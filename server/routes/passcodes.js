import express from 'express';
import { query } from '../db.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to generate 6-digit random passcode
const generateRandomCode = (sem) => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `MCA${sem}-${num}`;
};

// 1. Admin: Create Timed Session Passcode for Entire MCA Semester Class
router.post('/generate', verifyAdminToken, async (req, res) => {
  try {
    const { semester, duration_minutes, custom_code } = req.body;
    const sem = parseInt(semester || 1);
    const durationMinutes = parseInt(duration_minutes || 15); // Default 15 mins
    const durationSeconds = durationMinutes * 60;

    if (sem < 1 || sem > 4) {
      return res.status(400).json({ message: 'Invalid semester number (1-4).' });
    }

    let passcode = custom_code ? custom_code.trim().toUpperCase() : generateRandomCode(sem);
    const expiresAt = new Date(Date.now() + durationSeconds * 1000);

    // Insert session token
    const inserted = await query(
      'INSERT INTO student_tokens (passcode, semester, duration_seconds, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [passcode, sem, durationSeconds, expiresAt]
    );

    res.status(201).json({
      message: `Active Session Passcode "${passcode}" created for MCA Semester ${sem}! Valid for ${durationMinutes} minutes.`,
      token: inserted[0]
    });

  } catch (err) {
    console.error('Error generating passcode:', err);
    res.status(500).json({ message: 'Error generating student session passcode.' });
  }
});

// 2. Admin: Get all student session passcodes
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const { semester } = req.query;
    let tokens = [];
    if (semester) {
      tokens = await query('SELECT * FROM student_tokens WHERE semester = $1', [parseInt(semester)]);
    } else {
      tokens = await query('SELECT * FROM student_tokens');
    }
    res.json(tokens);
  } catch (err) {
    console.error('Error fetching passcodes:', err);
    res.status(500).json({ message: 'Error fetching session passcodes.' });
  }
});

// 3. Student: Validate Timed Passcode & Get Expiration Status
router.post('/validate', async (req, res) => {
  try {
    const { passcode, semester } = req.body;
    if (!passcode) {
      return res.status(400).json({ message: 'Please enter your student feedback passcode.' });
    }

    const cleanPasscode = passcode.trim().toUpperCase();
    const tokens = await query('SELECT * FROM student_tokens WHERE passcode = $1', [cleanPasscode]);

    if (!tokens || tokens.length === 0) {
      return res.status(404).json({ message: 'Invalid Session Passcode. Please ask your Admin for the active passcode.' });
    }

    const tok = tokens[0];
    if (tok.semester !== parseInt(semester)) {
      return res.status(400).json({ message: `This passcode is for MCA Semester ${tok.semester}, not Semester ${semester}.` });
    }

    // Check expiration timer
    const now = Date.now();
    const expiresAtTime = new Date(tok.expires_at).getTime();
    if (now > expiresAtTime) {
      return res.status(403).json({ message: '⏰ This feedback session passcode has EXPIRED! The active time window has closed.' });
    }

    const remainingSeconds = Math.max(0, Math.floor((expiresAtTime - now) / 1000));

    res.json({
      valid: true,
      passcode: tok.passcode,
      semester: tok.semester,
      expires_at: tok.expires_at,
      remainingSeconds
    });
  } catch (err) {
    console.error('Error validating passcode:', err);
    res.status(500).json({ message: 'Error validating passcode.' });
  }
});

// 4. Admin: Delete session passcode
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM student_tokens WHERE id = $1', [parseInt(id)]);
    res.json({ message: 'Session passcode deleted.' });
  } catch (err) {
    console.error('Error deleting passcode:', err);
    res.status(500).json({ message: 'Error deleting passcode.' });
  }
});

export default router;
