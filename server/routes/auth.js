import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const router = express.Router();

// Admin Login Route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    // Default master admin check for instant development access
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { id: 1, username: 'admin' },
        process.env.JWT_SECRET || 'super_secret_faculty_feedback_key_2026',
        { expiresIn: '12h' }
      );
      return res.json({
        token,
        admin: { id: 1, username: 'admin' }
      });
    }

    // Database lookup check
    const admins = await query('SELECT * FROM admins WHERE username = $1', [username]);
    if (admins && admins.length > 0) {
      const admin = admins[0];
      const isMatch = await bcrypt.compare(password, admin.password_hash);
      if (isMatch) {
        const token = jwt.sign(
          { id: admin.id, username: admin.username },
          process.env.JWT_SECRET || 'super_secret_faculty_feedback_key_2026',
          { expiresIn: '12h' }
        );
        return res.json({
          token,
          admin: { id: admin.id, username: admin.username }
        });
      }
    }

    return res.status(401).json({ message: 'Invalid admin credentials.' });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error during authentication.' });
  }
});

export default router;
