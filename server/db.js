import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

let pool = null;
let isPostgres = false;
let memoryStore = {
  admins: [],
  faculties: [],
  subjects: [],
  student_tokens: [],
  feedback_submissions: [],
  feedback_ratings: [],
  faculty_qualitative: []
};

const dataDir = path.join(__dirname, 'data');
const storePath = path.join(dataDir, 'database.json');

// Helper to get max dynamic ID + 1
const getNextId = (arr) => {
  if (!Array.isArray(arr) || arr.length === 0) return 1;
  const max = Math.max(...arr.map(item => (item && item.id) ? parseInt(item.id) : 0));
  return max + 1;
};

// Helper to save JS DB store
const saveStore = () => {
  if (!isPostgres) {
    try {
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      fs.writeFileSync(storePath, JSON.stringify(memoryStore, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving local store:', e);
    }
  }
};

// Helper to load JS DB store
const loadStore = () => {
  if (fs.existsSync(storePath)) {
    try {
      const data = fs.readFileSync(storePath, 'utf-8');
      const parsed = JSON.parse(data);
      memoryStore = {
        admins: parsed.admins || [],
        faculties: parsed.faculties || [],
        subjects: parsed.subjects || [],
        student_tokens: parsed.student_tokens || [],
        feedback_submissions: parsed.feedback_submissions || [],
        feedback_ratings: parsed.feedback_ratings || [],
        faculty_qualitative: parsed.faculty_qualitative || []
      };
    } catch (e) {
      console.error('Error loading local store:', e);
    }
  }
};

// Attempt PostgreSQL Connection
const pgConnectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/faculty_feedback_db';

try {
  pool = new Pool({
    connectionString: pgConnectionString,
    connectionTimeoutMillis: 2000,
  });

  const client = await pool.connect();
  console.log('✅ Connected to PostgreSQL database!');
  client.release();
  isPostgres = true;
} catch (err) {
  console.log('ℹ️ Local Pure JS Database Engine initialized (Zero native C++ build required).');
  pool = null;
  isPostgres = false;
  loadStore();
}

// Pure JS Database Helper Query Engine
export const query = async (text, params = []) => {
  if (isPostgres && pool) {
    const res = await pool.query(text, params);
    return res.rows;
  }

  const cleanSql = text.trim();
  const lowerSql = cleanSql.toLowerCase();

  // SELECT queries
  if (lowerSql.startsWith('select')) {

    // 1. Check: FROM student_tokens
    if (/\bfrom\s+student_tokens\b/.test(lowerSql)) {
      let result = [...memoryStore.student_tokens];
      if (lowerSql.includes('where passcode = $1')) {
        return result.filter(t => t && String(t.passcode).toUpperCase() === String(params[0]).toUpperCase());
      }
      if (lowerSql.includes('where semester = $1')) {
        return result.filter(t => t && t.semester === parseInt(params[0]));
      }
      return result.sort((a, b) => (b.id - a.id));
    }

    // 2. Precise Check: FROM subjects
    if (/\bfrom\s+subjects\b/.test(lowerSql)) {
      let filtered = memoryStore.subjects.map(s => {
        const fac = memoryStore.faculties.find(f => f && f.id === s.faculty_id);
        return {
          ...s,
          faculty_name: fac ? fac.name : null,
          faculty_code: fac ? fac.faculty_code : null
        };
      });

      if (lowerSql.includes('where s.semester = $1') || lowerSql.includes('where semester = $1')) {
        filtered = filtered.filter(s => s && s.semester === parseInt(params[0]));
      }

      return filtered.sort((a, b) => (a.semester - b.semester) || String(a.subject_code || '').localeCompare(String(b.subject_code || '')));
    }

    // 3. Precise Check: FROM feedback_submissions
    if (/\bfrom\s+feedback_submissions\b/.test(lowerSql)) {
      if (lowerSql.includes('count(*) as count')) {
        const sem = parseInt(params[0]);
        const count = memoryStore.feedback_submissions.filter(s => s && s.semester === sem).length;
        return [{ count }];
      }
      return memoryStore.feedback_submissions;
    }

    // 4. Precise Check: FROM feedback_ratings
    if (/\bfrom\s+feedback_ratings\b/.test(lowerSql)) {
      const subjectId = parseInt(params[0]);
      const ratingsForSubject = memoryStore.feedback_ratings.filter(r => r && r.subject_id === subjectId);

      const grouped = {};
      ratingsForSubject.forEach(r => {
        if (!grouped[r.criterion_key]) {
          grouped[r.criterion_key] = {
            criterion_key: r.criterion_key,
            count_5: 0, count_4: 0, count_3: 0, count_2: 0, count_1: 0,
            total_responses: 0,
            sum: 0
          };
        }
        const item = grouped[r.criterion_key];
        item[`count_${r.rating}`]++;
        item.total_responses++;
        item.sum += r.rating;
      });

      const result = Object.values(grouped).map(item => ({
        ...item,
        average_rating: item.total_responses > 0 ? (item.sum / item.total_responses).toFixed(2) : '0.00'
      }));

      return result;
    }

    // 5. Precise Check: FROM faculty_qualitative
    if (/\bfrom\s+faculty_qualitative\b/.test(lowerSql)) {
      const facultyId = parseInt(params[0]);
      const facQual = memoryStore.faculty_qualitative.filter(q => q && q.faculty_id === facultyId);

      if (lowerSql.includes('select remarks')) {
        return facQual.filter(q => q && q.remarks).map(q => ({ remarks: q.remarks }));
      }

      const count_take_again = facQual.filter(q => q && q.take_another_course).length;
      const count_learning = facQual.filter(q => q && q.satisfied_learning).length;
      const count_mentoring = facQual.filter(q => q && q.satisfied_mentoring).length;

      return [{
        count_take_again,
        count_learning,
        count_mentoring,
        total_qualitative: facQual.length
      }];
    }

    // 6. Precise Check: FROM admins
    if (/\bfrom\s+admins\b/.test(lowerSql)) {
      if (params.length > 0) {
        return memoryStore.admins.filter(a => a && a.username === params[0]);
      }
      return memoryStore.admins;
    }

    // 7. Precise Check: FROM faculties
    if (/\bfrom\s+faculties\b/.test(lowerSql)) {
      if (lowerSql.includes('where faculty_code = $1')) {
        return memoryStore.faculties.filter(f => f && f.faculty_code === params[0]);
      }
      return [...memoryStore.faculties].sort((a, b) => {
        const nameA = (a && a.name) ? String(a.name) : '';
        const nameB = (b && b.name) ? String(b.name) : '';
        return nameA.localeCompare(nameB);
      });
    }

    return [];
  }

  // INSERT queries
  if (lowerSql.startsWith('insert into student_tokens')) {
    // params: [passcode, semester, durationSeconds, expiresAt]
    const tokenObj = {
      id: getNextId(memoryStore.student_tokens),
      passcode: params[0],
      semester: parseInt(params[1]),
      duration_seconds: parseInt(params[2] || 600),
      expires_at: params[3] ? new Date(params[3]) : new Date(Date.now() + 600 * 1000),
      is_used: false,
      created_at: new Date()
    };
    memoryStore.student_tokens.push(tokenObj);
    saveStore();
    return [tokenObj];
  }

  if (lowerSql.startsWith('insert into admins')) {
    const adminObj = { id: getNextId(memoryStore.admins), username: params[0], password_hash: params[1], created_at: new Date() };
    memoryStore.admins.push(adminObj);
    saveStore();
    return [adminObj];
  }

  if (lowerSql.startsWith('insert into faculties')) {
    const facObj = { id: getNextId(memoryStore.faculties), faculty_code: params[0], name: params[1], designation: params[2] || '', email: params[3] || '', created_at: new Date() };
    memoryStore.faculties.push(facObj);
    saveStore();
    return [facObj];
  }

  if (lowerSql.startsWith('insert into subjects')) {
    const subjObj = { id: getNextId(memoryStore.subjects), subject_code: params[0], subject_name: params[1], semester: params[2], faculty_id: params[3], created_at: new Date() };
    memoryStore.subjects.push(subjObj);
    saveStore();
    return [subjObj];
  }

  if (lowerSql.startsWith('insert into feedback_submissions')) {
    const subObj = { id: getNextId(memoryStore.feedback_submissions), semester: params[0], submitted_at: new Date() };
    memoryStore.feedback_submissions.push(subObj);
    saveStore();
    return [subObj];
  }

  if (lowerSql.startsWith('insert into feedback_ratings')) {
    const ratObj = { id: getNextId(memoryStore.feedback_ratings), submission_id: params[0], subject_id: params[1], criterion_key: params[2], rating: params[3] };
    memoryStore.feedback_ratings.push(ratObj);
    saveStore();
    return [ratObj];
  }

  if (lowerSql.startsWith('insert into faculty_qualitative')) {
    const qualObj = { id: getNextId(memoryStore.faculty_qualitative), submission_id: params[0], faculty_id: params[1], take_another_course: params[2], satisfied_learning: params[3], satisfied_mentoring: params[4], remarks: params[5] };
    memoryStore.faculty_qualitative.push(qualObj);
    saveStore();
    return [qualObj];
  }

  // DELETE queries
  if (lowerSql.startsWith('delete from student_tokens')) {
    const id = parseInt(params[0]);
    memoryStore.student_tokens = memoryStore.student_tokens.filter(t => t && t.id !== id);
    saveStore();
    return [{ affectedRows: 1 }];
  }

  if (lowerSql.startsWith('delete from faculties')) {
    const id = parseInt(params[0]);
    memoryStore.faculties = memoryStore.faculties.filter(f => f && f.id !== id);
    saveStore();
    return [{ affectedRows: 1 }];
  }

  if (lowerSql.startsWith('delete from subjects')) {
    const id = parseInt(params[0]);
    memoryStore.subjects = memoryStore.subjects.filter(s => s && s.id !== id);
    saveStore();
    return [{ affectedRows: 1 }];
  }

  return [];
};

export const initDB = async () => {
  if (isPostgres && pool) {
    const schemaSQL = `
      CREATE TABLE IF NOT EXISTS admins (id SERIAL PRIMARY KEY, username VARCHAR(50) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS faculties (id SERIAL PRIMARY KEY, faculty_code VARCHAR(20) UNIQUE NOT NULL, name VARCHAR(100) NOT NULL, designation VARCHAR(50), email VARCHAR(100), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS subjects (id SERIAL PRIMARY KEY, subject_code VARCHAR(20) NOT NULL, subject_name VARCHAR(150) NOT NULL, semester INT NOT NULL CHECK (semester BETWEEN 1 AND 4), faculty_id INT REFERENCES faculties(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS student_tokens (id SERIAL PRIMARY KEY, passcode VARCHAR(50) UNIQUE NOT NULL, semester INT NOT NULL CHECK (semester BETWEEN 1 AND 4), duration_seconds INT DEFAULT 600, expires_at TIMESTAMP NOT NULL, is_used BOOLEAN DEFAULT false, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS feedback_submissions (id SERIAL PRIMARY KEY, semester INT NOT NULL CHECK (semester BETWEEN 1 AND 4), submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS feedback_ratings (id SERIAL PRIMARY KEY, submission_id INT REFERENCES feedback_submissions(id) ON DELETE CASCADE, subject_id INT REFERENCES subjects(id) ON DELETE CASCADE, criterion_key VARCHAR(50) NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5));
      CREATE TABLE IF NOT EXISTS faculty_qualitative (id SERIAL PRIMARY KEY, submission_id INT REFERENCES feedback_submissions(id) ON DELETE CASCADE, faculty_id INT REFERENCES faculties(id) ON DELETE CASCADE, take_another_course BOOLEAN, satisfied_learning BOOLEAN, satisfied_mentoring BOOLEAN, remarks TEXT);
    `;
    await pool.query(schemaSQL);
  }
  console.log('✅ Database Engine ready!');
};

export { isPostgres };
