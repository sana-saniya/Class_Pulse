require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongo } = require('./mongo');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize MongoDB connection
connectMongo();

app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Auth (public)
app.use('/api/auth', require('./routes/auth'));

// Protected
const { requireAuth, requireRole } = require('./middleware/auth');
app.use('/api/students',     requireAuth, requireRole('faculty', 'hod', 'student', 'parent'), require('./routes/students'));
app.use('/api/interventions',requireAuth, requireRole('faculty', 'hod'),                       require('./routes/interventions'));
app.use('/api/thresholds',   requireAuth, requireRole('faculty', 'hod', 'student', 'parent'), require('./routes/thresholds'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`\n🚀 ClassPulse API  →  http://localhost:${PORT}`);
  console.log(`   Health check   →  http://localhost:${PORT}/api/health\n`);
});
