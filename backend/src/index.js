require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongo } = require('./mongo');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MongoDB connection
connectMongo();

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://class-pulse-beta-puce.vercel.app',
  'https://class-pulse-1ylvyxcph-sanasaniya464-5331s-projects.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Protected
const { requireAuth, requireRole } = require('./middleware/auth');
app.use('/api/students',     requireAuth, requireRole('faculty', 'hod', 'student', 'parent'), require('./routes/students'));
app.use('/api/reset', requireAuth, requireRole('hod', 'faculty'), require('./routes/reset'));
app.use('/api/interventions',requireAuth, requireRole('faculty', 'hod'),                       require('./routes/interventions'));
app.use('/api/thresholds',   requireAuth, requireRole('faculty', 'hod', 'student', 'parent'), require('./routes/thresholds'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n🚀 ClassPulse API  →  http://localhost:${PORT}`);
  console.log(`   Health check   →  http://localhost:${PORT}/api/health\n`);
});
