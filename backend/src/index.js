require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectMongo } = require('./mongo');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect MongoDB (non-blocking — app still starts without it)
connectMongo();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.use(express.json());

// Auth routes (public)
app.use('/api/auth', require('./routes/auth'));

// Protected routes
const { requireAuth, requireRole } = require('./middleware/auth');

// Students — faculty & hod can read, faculty can generate/export
app.use('/api/students', requireAuth, requireRole('faculty', 'hod', 'student'), require('./routes/students'));

// Interventions — faculty & hod only
app.use('/api/interventions', requireAuth, requireRole('faculty', 'hod'), require('./routes/interventions'));

// Thresholds — faculty & hod only
app.use('/api/thresholds', requireAuth, requireRole('faculty', 'hod'), require('./routes/thresholds'));

// Health check (public)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ClassPulse API  →  http://localhost:${PORT}`);
  console.log(`   Health check   →  http://localhost:${PORT}/api/health\n`);
});
