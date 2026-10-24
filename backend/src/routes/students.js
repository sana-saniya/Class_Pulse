const express = require('express');
const router = express.Router();
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// GET /api/students
router.get('/', (req, res) => {
  try {
    const students = db.all('SELECT * FROM students ORDER BY roll_no');
    const interventions = db.all('SELECT * FROM interventions ORDER BY created_at DESC');

    const result = students.map((s) => ({
      id: s.id,
      rollNo: s.roll_no,
      name: s.name,
      department: s.department,
      section: s.section,
      attendancePct: s.attendance_pct,
      scores: {
        mid1: s.mid1,
        mid2: s.mid2,
        assignmentsSubmitted: s.assignments_submitted,
        totalAssignments: s.total_assignments,
      },
      backlogs: s.backlogs,
      interventions: interventions
        .filter((i) => i.student_id === s.id)
        .map((i) => ({
          id: i.id,
          date: i.date,
          type: i.type,
          notes: i.notes,
          status: i.status,
          actionTakenBy: i.action_taken_by,
        })),
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/students/generate
router.post('/generate', (req, res) => {
  try {
    const NAMES = [
      'Akshay Nair', 'Bindu Valli', 'Chetan Reddy', 'Deepa Krishnan', 'Eswari Devi',
    ];
    const DEPTS = ['CSE', 'ECE', 'EEE', 'MECH'];
    const SECTIONS = ['A', 'B'];

    const lastRow = db.get("SELECT roll_no FROM students ORDER BY roll_no DESC LIMIT 1");
    let startNum = 516;
    if (lastRow) {
      const last = parseInt(lastRow.roll_no.slice(-4));
      startNum = last + 1;
    }

    let count = 0;
    for (let i = 0; i < 5; i++) {
      const rollNum = String(startNum + i).padStart(4, '0');
      const roll_no = `22G1A${rollNum}`;
      const attendance_pct = Math.floor(Math.random() * 45) + 50;
      const mid1 = Math.floor(Math.random() * 16) + 12;
      const mid2 = Math.floor(Math.random() * 16) + 10;
      const backlogs = Math.floor(Math.random() * 5);
      const assignments_submitted = Math.floor(Math.random() * 6);

      db.run(
        `INSERT OR IGNORE INTO students (id, roll_no, name, department, section, attendance_pct, mid1, mid2, assignments_submitted, total_assignments, backlogs)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5, ?)`,
        [uuidv4(), roll_no,
        NAMES[i % NAMES.length],
        DEPTS[Math.floor(Math.random() * DEPTS.length)],
        SECTIONS[Math.floor(Math.random() * SECTIONS.length)],
        attendance_pct, mid1, mid2, assignments_submitted, backlogs],
      );
      count++;
    }

    res.json({ message: `Generated ${count} new students`, count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/students/export
router.get('/export', (req, res) => {
  try {
    const students = db.all('SELECT * FROM students ORDER BY roll_no');
    const thresholds = db.get('SELECT * FROM thresholds WHERE id = 1');

    const header = 'Roll No,Name,Department,Section,Attendance %,Mid-1,Mid-2,Assignments Submitted,Backlogs,Risk Level\n';
    const rows = students.map((s) => {
      const scoreDrop = s.mid1 > 0 ? ((s.mid1 - s.mid2) / s.mid1) * 100 : 0;
      let risk = 'On Track';
      if (
        s.attendance_pct < thresholds.attendance_min ||
        scoreDrop > thresholds.score_drop_max ||
        s.backlogs > thresholds.backlogs_max
      ) {
        risk = (s.attendance_pct < 65 || s.backlogs > 3) ? 'High Risk' : 'Medium Risk';
      }
      return `${s.roll_no},${s.name},${s.department},${s.section},${s.attendance_pct},${s.mid1},${s.mid2},${s.assignments_submitted},${s.backlogs},${risk}`;
    });

    const csv = header + rows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=classpulse-report.csv');
    res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
