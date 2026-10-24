const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET /api/interventions
router.get('/', (req, res) => {
  try {
    const rows = db.all(`
      SELECT i.*, s.name as student_name, s.roll_no
      FROM interventions i
      JOIN students s ON i.student_id = s.id
      ORDER BY i.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interventions
router.post('/', (req, res) => {
  try {
    const { studentId, type, notes, status, actionTakenBy } = req.body;

    if (!studentId || !type || !actionTakenBy) {
      return res.status(400).json({ error: 'studentId, type, and actionTakenBy are required' });
    }

    const student = db.get('SELECT id FROM students WHERE id = ?', [studentId]);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const id = uuidv4();
    const date = new Date().toISOString().split('T')[0];

    db.run(
      'INSERT INTO interventions (id, student_id, date, type, notes, status, action_taken_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, studentId, date, type, notes || '', status || 'Pending', actionTakenBy],
    );

    res.status(201).json({ id, studentId, date, type, notes, status, actionTakenBy });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/interventions/:id
router.patch('/:id', (req, res) => {
  try {
    const { status, notes } = req.body;
    if (status) db.run('UPDATE interventions SET status = ? WHERE id = ?', [status, req.params.id]);
    if (notes !== undefined) db.run('UPDATE interventions SET notes = ? WHERE id = ?', [notes, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
