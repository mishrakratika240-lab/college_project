import express from 'express';
import { query } from '../db.js';
import { verifyAdminToken } from '../middleware/auth.js';

const router = express.Router();

// Public / Admin: Get all faculties
router.get('/', async (req, res) => {
  try {
    const faculties = await query('SELECT * FROM faculties ORDER BY name ASC');
    res.json(faculties);
  } catch (err) {
    console.error('Error fetching faculties:', err);
    res.status(500).json({ message: 'Error retrieving faculties.' });
  }
});

// Admin: Add new faculty
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { faculty_code, name, designation, email } = req.body;
    if (!faculty_code || !name) {
      return res.status(400).json({ message: 'Faculty code and name are required.' });
    }

    const existing = await query('SELECT * FROM faculties WHERE faculty_code = $1', [faculty_code]);
    if (existing.length > 0) {
      return res.status(400).json({ message: `Faculty code "${faculty_code}" already exists.` });
    }

    const result = await query(
      'INSERT INTO faculties (faculty_code, name, designation, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [faculty_code, name, designation || '', email || '']
    );

    res.status(201).json({ message: 'Faculty added successfully.', faculty: result[0] });
  } catch (err) {
    console.error('Error adding faculty:', err);
    res.status(500).json({ message: 'Error adding faculty member.' });
  }
});

// Admin: Update faculty
router.put('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_code, name, designation, email } = req.body;

    await query(
      'UPDATE faculties SET faculty_code = $1, name = $2, designation = $3, email = $4 WHERE id = $5',
      [faculty_code, name, designation, email, id]
    );

    res.json({ message: 'Faculty updated successfully.' });
  } catch (err) {
    console.error('Error updating faculty:', err);
    res.status(500).json({ message: 'Error updating faculty.' });
  }
});

// Admin: Delete faculty
router.delete('/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM faculties WHERE id = $1', [id]);
    res.json({ message: 'Faculty deleted successfully.' });
  } catch (err) {
    console.error('Error deleting faculty:', err);
    res.status(500).json({ message: 'Error deleting faculty member.' });
  }
});

export default router;
