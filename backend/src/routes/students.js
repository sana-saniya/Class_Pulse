const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Threshold = require('../models/Threshold');
const { v4: uuidv4 } = require('uuid');

// Helper to format student document for API output
function formatStudent(s) {
  return {
    id: s._id.toString(),
    rollNo: s.rollNo,
    name: s.name,
    department: s.department,
    section: s.section,
    attendancePct: s.attendancePct,
    scores: {
      mid1: s.scores?.mid1 ?? 0,
      mid2: s.scores?.mid2 ?? 0,
      assignmentsSubmitted: s.scores?.assignmentsSubmitted ?? 0,
      totalAssignments: s.scores?.totalAssignments ?? 5,
    },
    backlogs: s.backlogs ?? 0,
    parentEmail: s.parentEmail || null,
    parentPhone: s.parentPhone || null,
    interventions: (s.interventions || []).map((i) => ({
      id: i.id,
      date: i.date,
      type: i.type,
      notes: i.notes,
      status: i.status,
      actionTakenBy: i.actionTakenBy,
    })),
  };
}

// GET /api/students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ rollNo: 1 });
    res.json(students.map(formatStudent));
  } catch (err) {
    console.error('Fetch students error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students - Add a new student (Faculty / HOD)
router.post('/', async (req, res) => {
  try {
    const {
      rollNo,
      name,
      department,
      section,
      attendancePct,
      mid1,
      mid2,
      assignmentsSubmitted,
      totalAssignments,
      backlogs,
      parentEmail,
      parentPhone,
    } = req.body;

    if (!rollNo || !name || !department || !section) {
      return res.status(400).json({ error: 'Roll number, Name, Department, and Section are required' });
    }

    const cleanRoll = rollNo.trim().toUpperCase();
    const existing = await Student.findOne({ rollNo: cleanRoll });
    if (existing) {
      return res.status(409).json({ error: `Student with roll number ${cleanRoll} already exists` });
    }

    const student = await Student.create({
      rollNo: cleanRoll,
      name: name.trim(),
      department: department.trim(),
      section: section.trim().toUpperCase(),
      attendancePct: Number(attendancePct) || 0,
      scores: {
        mid1: Number(mid1) || 0,
        mid2: Number(mid2) || 0,
        assignmentsSubmitted: Number(assignmentsSubmitted) || 0,
        totalAssignments: Number(totalAssignments) || 5,
      },
      backlogs: Number(backlogs) || 0,
      parentEmail: parentEmail?.trim()?.toLowerCase() || null,
      parentPhone: parentPhone?.trim() || null,
      interventions: [],
    });

    res.status(201).json(formatStudent(student));
  } catch (err) {
    console.error('Add student error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/students/:id - Delete a student
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Student.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student removed successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students/generate
router.post('/generate', async (req, res) => {
  try {
    const NAMES = [
      'Akshay Nair', 'Bindu Valli', 'Chetan Reddy', 'Deepa Krishnan', 'Eswari Devi',
      'Faizan Ahmed', 'Gita Raman', 'Hitesh Chandra', 'Indira Varma', 'Jagan Mohan'
    ];
    const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH'];
    const SECTIONS = ['A', 'B'];

    const lastStudent = await Student.findOne().sort({ rollNo: -1 });
    let startNum = 516;
    if (lastStudent && lastStudent.rollNo) {
      const parsed = parseInt(lastStudent.rollNo.slice(-4));
      if (!isNaN(parsed)) startNum = parsed + 1;
    }

    const newDocs = [];
    for (let i = 0; i < 5; i++) {
      const rollNum = String(startNum + i).padStart(4, '0');
      const roll_no = `22G1A${rollNum}`;
      const attendance_pct = Math.floor(Math.random() * 45) + 50;
      const mid1 = Math.floor(Math.random() * 16) + 12;
      const mid2 = Math.floor(Math.random() * 16) + 10;
      const backlogs = Math.floor(Math.random() * 5);
      const assignments_submitted = Math.floor(Math.random() * 6);

      newDocs.push({
        rollNo: roll_no,
        name: NAMES[i % NAMES.length],
        department: DEPTS[Math.floor(Math.random() * DEPTS.length)],
        section: SECTIONS[Math.floor(Math.random() * SECTIONS.length)],
        attendancePct: attendance_pct,
        scores: {
          mid1,
          mid2,
          assignmentsSubmitted: assignments_submitted,
          totalAssignments: 5,
        },
        backlogs,
        parentEmail: `parent.${roll_no.toLowerCase()}@classpulse.edu`,
        parentPhone: '+91 98765 00000',
        interventions: [],
      });
    }

    await Student.insertMany(newDocs);
    res.json({ message: `Generated ${newDocs.length} new students`, count: newDocs.length });
  } catch (err) {
    console.error('Generate cohort error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/export
router.get('/export', async (req, res) => {
  try {
    const students = await Student.find().sort({ rollNo: 1 });
    let threshold = await Threshold.findOne();
    if (!threshold) {
      threshold = { attendanceMin: 75, scoreDropMax: 15, backlogsMax: 2 };
    }

    const header = 'Roll No,Name,Department,Section,Attendance %,Mid-1,Mid-2,Assignments Submitted,Backlogs,Risk Level,Parent Email,Parent Phone\n';
    const rows = students.map((s) => {
      const mid1 = s.scores?.mid1 ?? 0;
      const mid2 = s.scores?.mid2 ?? 0;
      const scoreDrop = mid1 > 0 ? ((mid1 - mid2) / mid1) * 100 : 0;
      let risk = 'On Track';
      if (
        s.attendancePct < threshold.attendanceMin ||
        scoreDrop > threshold.scoreDropMax ||
        s.backlogs > threshold.backlogsMax
      ) {
        risk = (s.attendancePct < 65 || s.backlogs > 3) ? 'High Risk' : 'Medium Risk';
      }
      return `${s.rollNo},"${s.name}",${s.department},${s.section},${s.attendancePct},${mid1},${mid2},${s.scores?.assignmentsSubmitted ?? 0},${s.backlogs},${risk},${s.parentEmail || ''},${s.parentPhone || ''}`;
    });

    const csv = header + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=classpulse-report.csv');
    res.send(csv);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
