import bcrypt from 'bcryptjs';
import { query, initDB } from './db.js';

export const seedDatabase = async () => {
  await initDB();

  // Check if admins exist
  const existingAdmins = await query('SELECT * FROM admins WHERE username = $1', ['admin']);
  if (!existingAdmins || existingAdmins.length === 0) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', ['admin', passwordHash]);
    console.log('👤 Admin created: username="admin", password="admin123"');
  }

  // Check if faculties exist
  let faculties = await query('SELECT * FROM faculties');
  if (!faculties || faculties.length === 0) {
    const sampleFaculties = [
      { code: 'Dr.DC', name: 'Dr. Divya Chowdhry', designation: 'Professor', email: 'divya@jim.edu' },
      { code: 'PC', name: 'Mrs. Priya Chopra Arora', designation: 'Associate Professor', email: 'priya@jim.edu' },
      { code: 'Dr.AG', name: 'Dr. Akshat Gupta', designation: 'Assistant Professor', email: 'akshat@jim.edu' },
      { code: 'SK', name: 'CS Shantanu Kumar', designation: 'Assistant Professor', email: 'shantanu@jim.edu' },
      { code: 'PO', name: 'Mr. Pawan Omer', designation: 'Senior Lecturer', email: 'pawan@jim.edu' },
      { code: 'AS', name: 'Mr. Adarsh Srivastava', designation: 'Assistant Professor', email: 'adarsh@jim.edu' },
      { code: 'TK', name: 'Ms. Taniya Khurana', designation: 'Lecturer', email: 'taniya@jim.edu' },
      { code: 'AK', name: 'Mr. Aman Kesharwani', designation: 'Assistant Professor', email: 'aman@jim.edu' },
    ];

    for (const f of sampleFaculties) {
      await query(
        'INSERT INTO faculties (faculty_code, name, designation, email) VALUES ($1, $2, $3, $4)',
        [f.code, f.name, f.designation, f.email]
      );
    }
    console.log('👩‍🏫 Faculties seeded from physical evaluation form!');
    faculties = await query('SELECT * FROM faculties');
  }

  // Map faculty codes to IDs safely
  const facultyMap = {};
  if (Array.isArray(faculties)) {
    faculties.forEach(f => {
      if (f && f.faculty_code && f.id) {
        facultyMap[f.faculty_code] = f.id;
      }
    });
  }

  const defaultFacultyId = faculties && faculties.length > 0 ? faculties[0].id : 1;

  // Check if subjects exist
  const existingSubjects = await query('SELECT * FROM subjects');
  if (!existingSubjects || existingSubjects.length === 0) {
    const sampleSubjects = [
      // MCA Semester 1 (Matching BMB 201-251 from document)
      { code: 'MCA 101', name: 'BELA (Business Environments Legal Aspect of Business)', sem: 1, fCode: 'Dr.DC' },
      { code: 'MCA 102', name: 'HRM (Human Resource Management)', sem: 1, fCode: 'PC' },
      { code: 'MCA 103', name: 'BRM (Business Research Methods)', sem: 1, fCode: 'Dr.AG' },
      { code: 'MCA 104', name: 'FM (Financial Management & Corporate Finance)', sem: 1, fCode: 'SK' },
      { code: 'MCA 105', name: 'OM (Operations Management)', sem: 1, fCode: 'PO' },
      { code: 'MCA 106', name: 'QT (Quantitative Techniques for Managers)', sem: 1, fCode: 'AS' },
      { code: 'MCA 107', name: 'CMA (Cost & Management Accounting)', sem: 1, fCode: 'TK' },
      { code: 'MCA 108', name: 'MIS (Management Information Systems)', sem: 1, fCode: 'PO' },
      { code: 'MCA 151', name: 'IT SKILLS-2 (Web Development & DB)', sem: 1, fCode: 'AK' },

      // MCA Semester 2
      { code: 'MCA 201', name: 'Advanced Data Structures & Algorithms', sem: 2, fCode: 'AK' },
      { code: 'MCA 202', name: 'Database Management Systems (PostgreSQL)', sem: 2, fCode: 'PO' },
      { code: 'MCA 203', name: 'Object Oriented Programming with Java', sem: 2, fCode: 'AS' },
      { code: 'MCA 204', name: 'Operating System Design', sem: 2, fCode: 'Dr.AG' },

      // MCA Semester 3
      { code: 'MCA 301', name: 'Full Stack Web Development (PERN)', sem: 3, fCode: 'AK' },
      { code: 'MCA 302', name: 'Cloud Computing & DevOps', sem: 3, fCode: 'PO' },
      { code: 'MCA 303', name: 'Software Engineering & Agile', sem: 3, fCode: 'SK' },
      { code: 'MCA 304', name: 'Artificial Intelligence & Machine Learning', sem: 3, fCode: 'Dr.DC' },

      // MCA Semester 4
      { code: 'MCA 401', name: 'Cyber Security & Forensics', sem: 4, fCode: 'TK' },
      { code: 'MCA 402', name: 'Enterprise Architecture', sem: 4, fCode: 'PC' },
      { code: 'MCA 403', name: 'Major Industrial Project & Seminar', sem: 4, fCode: 'Dr.AG' },
    ];

    for (const s of sampleSubjects) {
      const fId = facultyMap[s.fCode] || defaultFacultyId;
      await query(
        'INSERT INTO subjects (subject_code, subject_name, semester, faculty_id) VALUES ($1, $2, $3, $4)',
        [s.code, s.name, s.sem, fId]
      );
    }
    console.log('📚 Subjects seeded for MCA Semesters 1, 2, 3, 4!');
  }

  // Seed default test passcodes
  const existingTokens = await query('SELECT * FROM student_tokens');
  if (!existingTokens || existingTokens.length === 0) {
    const samplePasscodes = [
      { code: 'MCA1-100101', sem: 1 },
      { code: 'MCA1-100102', sem: 1 },
      { code: 'MCA1-100103', sem: 1 },
      { code: 'MCA2-200101', sem: 2 },
      { code: 'MCA3-300101', sem: 3 },
      { code: 'MCA4-400101', sem: 4 }
    ];
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days valid
    for (const p of samplePasscodes) {
      await query('INSERT INTO student_tokens (passcode, semester, expires_at) VALUES ($1, $2, $3)', [p.code, p.sem, expiresAt]);
    }
    console.log('🔑 Sample student access passcodes generated!');
  }

  // Seed sample feedback submissions
  const existingSubmissions = await query('SELECT * FROM feedback_submissions');
  if (!existingSubmissions || existingSubmissions.length === 0) {
    console.log('⏳ Seeding sample anonymous student submissions for demonstration report...');
    const sem1Subjects = await query('SELECT * FROM subjects WHERE semester = 1');
    const criteriaKeys = [
      'q1_on_time_completion',
      'q2_faculty_knowledge',
      'q3_response_to_questions',
      'q4_regularity',
      'q5_interest_generated',
      'q6_content_clarity',
      'q7_module_coverage',
      'q8_resources_guidance',
      'q9_practical_examples'
    ];

    if (Array.isArray(sem1Subjects) && sem1Subjects.length > 0) {
      for (let i = 0; i < 15; i++) {
        const subRes = await query('INSERT INTO feedback_submissions (semester) VALUES (1) RETURNING id');
        const subId = subRes && subRes[0] && subRes[0].id ? subRes[0].id : (i + 1);

        for (const subj of sem1Subjects) {
          for (const crit of criteriaKeys) {
            const ratings = [5, 5, 5, 4, 4, 4, 3, 5, 4, 2];
            const ratingVal = ratings[Math.floor(Math.random() * ratings.length)];
            await query(
              'INSERT INTO feedback_ratings (submission_id, subject_id, criterion_key, rating) VALUES ($1, $2, $3, $4)',
              [subId, subj.id, crit, ratingVal]
            );
          }

          await query(
            'INSERT INTO faculty_qualitative (submission_id, faculty_id, take_another_course, satisfied_learning, satisfied_mentoring, remarks) VALUES ($1, $2, $3, $4, $5, $6)',
            [subId, subj.faculty_id || defaultFacultyId, true, true, true, i === 0 ? 'Excellent teaching methods and detailed notes provided.' : 'Good subject coverage!']
          );
        }
      }
      console.log('📊 Sample feedback entries generated! Ready to view Mode & Frequency reports.');
    }
  }
};

if (process.argv[1].includes('seed.js')) {
  seedDatabase().then(() => {
    console.log('🎉 Database Seeding Completed!');
    process.exit(0);
  });
}
