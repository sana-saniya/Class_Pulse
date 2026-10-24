const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/thresholds
router.get('/', (req, res) => {
  try {
    const t = db.get('SELECT * FROM thresholds WHERE id = 1');
    res.json({
      attendanceMin: t.attendance_min,
      scoreDropMax: t.score_drop_max,
      backlogsMax: t.backlogs_max,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/thresholds
router.put('/', (req, res) => {
  try {
    const { attendanceMin, scoreDropMax, backlogsMax } = req.body;
    if (attendanceMin !== undefined) db.run('UPDATE thresholds SET attendance_min = ? WHERE id = 1', [attendanceMin]);
    if (scoreDropMax !== undefined) db.run('UPDATE thresholds SET score_drop_max = ? WHERE id = 1', [scoreDropMax]);
    if (backlogsMax !== undefined) db.run('UPDATE thresholds SET backlogs_max = ? WHERE id = 1', [backlogsMax]);

    const updated = db.get('SELECT * FROM thresholds WHERE id = 1');
    res.json({
      attendanceMin: updated.attendance_min,
      scoreDropMax: updated.score_drop_max,
      backlogsMax: updated.backlogs_max,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
