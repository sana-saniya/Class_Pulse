const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { v4: uuidv4 } = require('uuid');

// GET /api/interventions
router.get('/', async (req, res) => {
  try {
    const students = await Student.find({ 'interventions.0': { $exists: true } });
    const allInterventions = [];
    for (const s of students) {
      for (const i of s.interventions) {
        allInterventions.push({
          id: i.id,
          studentId: s._id.toString(),
          student_name: s.name,
          roll_no: s.rollNo,
          date: i.date,
          type: i.type,
          notes: i.notes,
          status: i.status,
          actionTakenBy: i.actionTakenBy,
          createdAt: i.createdAt,
        });
      }
    }
    allInterventions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json(allInterventions);
  } catch (err) {
    console.error('Fetch interventions error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/interventions
router.post('/', async (req, res) => {
  try {
    const { studentId, type, notes, status, actionTakenBy } = req.body;

    if (!studentId || !type || !actionTakenBy) {
      return res.status(400).json({ error: 'studentId, type, and actionTakenBy are required' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const newIntervention = {
      id: uuidv4(),
      date: new Date().toISOString().split('T')[0],
      type,
      notes: notes || '',
      status: status || 'Pending',
      actionTakenBy,
      createdAt: new Date(),
    };

    student.interventions.push(newIntervention);
    await student.save();

    res.status(201).json(newIntervention);
  } catch (err) {
    console.error('Add intervention error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
