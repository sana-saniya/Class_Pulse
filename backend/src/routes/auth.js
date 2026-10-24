const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken, requireAuth, requireRole } = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const payload = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      rollNo: user.rollNo || null,
      department: user.department || null,
      phone: user.phone || null,
    };

    const token = signToken(payload);
    res.json({ token, user: payload });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      rollNo: user.rollNo || null,
      department: user.department || null,
      phone: user.phone || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/faculty (HOD gets all faculty members)
router.get('/faculty', requireAuth, requireRole('hod'), async (req, res) => {
  try {
    const facultyList = await User.find({ role: 'faculty' })
      .select('name email role department phone createdAt')
      .sort({ createdAt: -1 });
    res.json(facultyList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/faculty (HOD creates a new faculty member)
router.post('/faculty', requireAuth, requireRole('hod'), async (req, res) => {
  try {
    const { name, email, password, department, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newFaculty = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: 'faculty',
      department: department?.trim() || req.user.department || 'CSE',
      phone: phone?.trim() || null,
    });

    res.status(201).json({
      id: newFaculty._id.toString(),
      name: newFaculty.name,
      email: newFaculty.email,
      role: newFaculty.role,
      department: newFaculty.department,
      phone: newFaculty.phone,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auth/faculty/:id (HOD removes a faculty member)
router.delete('/faculty/:id', requireAuth, requireRole('hod'), async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findOneAndDelete({ _id: id, role: 'faculty' });
    if (!deleted) {
      return res.status(404).json({ error: 'Faculty member not found' });
    }
    res.json({ message: 'Faculty removed successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/register (public registration / self-service)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, rollNo, department, phone } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'name, email, password, and role are required' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const exists = await User.findOne({ email: cleanEmail });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password: hash,
      role,
      rollNo: rollNo?.trim()?.toUpperCase() || null,
      department: department?.trim() || null,
      phone: phone?.trim() || null,
    });

    res.status(201).json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
