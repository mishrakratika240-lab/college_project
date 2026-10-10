import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDB } from './db.js';
import { seedDatabase } from './seed.js';
import authRoutes from './routes/auth.js';
import facultyRoutes from './routes/faculty.js';
import subjectRoutes from './routes/subject.js';
import feedbackRoutes from './routes/feedback.js';
import passcodeRoutes from './routes/passcodes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/passcodes', passcodeRoutes);

// Serve static frontend files in production build
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
      if (err) {
        res.status(200).send('Student Feedback System API is running on port ' + PORT);
      }
    });
  }
});

// Start Server & Initialize Database
const startServer = async () => {
  try {
    await initDB();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 PERN Server is running live on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
