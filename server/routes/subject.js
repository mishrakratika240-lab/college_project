import express from 'express';
import { query } from '../db.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = express.Router();

// Get subjects (optionally filtered by semester)
router.get('/', async (req, res) => {
  try {
    const { semester } = req.query;
    let sql = `
      SELECT s.*, f.name as faculty_name, f.faculty_code 
      FROM subjects s 
      LEFT JOIN faculties f ON s.faculty_id = f.id
    `;
    const params = [];
    if (semester) {
      sql += ` WHERE s.semester = $1`;
      params.push(parseInt(semester));
    }
    sql += ` ORDER BY s.semester ASC, s.subject_code ASC`;

    const subjects = await query(sql, params);
    res.json(subjects);
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ message: 'Error retrieving subjects.' });
  }
});

// Admin: Add new subject
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { subject_code, subject_name, semester, faculty_id } = req.body;
    if (!subject_code || !subject_name || !semester) {
      return res.status(400).json({ message: 'Subject code, name, and semester are required.' });
    }

    const result = await query(
      'INSERT INTO subjects (subject_code, subject_name, semester, faculty_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [subject_code, subject_name, parseInt(semester), faculty_id || null]
    );

    res.status(201).json({ message: 'Subject created successfully.', subject: result[0] });
  } catch (err) {
    console.error('Error creating subject:', err);
    res.status(500).json({ message: 'Error creating subject.' });
  }
});

// Admin: Delete subject
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM subjects WHERE id = $1', [id]);
    res.json({ message: 'Subject deleted successfully.' });
  } catch (err) {
    console.error('Error deleting subject:', err);
    res.status(500).json({ message: 'Error deleting subject.' });
  }
});

export default router;
