const express = require('express');
const router = express.Router();
const Threshold = require('../models/Threshold');

// GET /api/thresholds
router.get('/', async (req, res) => {
  try {
    let t = await Threshold.findOne();
    if (!t) {
      t = await Threshold.create({ attendanceMin: 75, scoreDropMax: 15, backlogsMax: 2 });
    }
    res.json({
      attendanceMin: t.attendanceMin,
      scoreDropMax: t.scoreDropMax,
      backlogsMax: t.backlogsMax,
    });
  } catch (err) {
    console.error('Fetch thresholds error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/thresholds
router.put('/', async (req, res) => {
  try {
    const { attendanceMin, scoreDropMax, backlogsMax } = req.body;
    let t = await Threshold.findOne();
    if (!t) {
      t = new Threshold({ attendanceMin: 75, scoreDropMax: 15, backlogsMax: 2 });
    }

    if (attendanceMin !== undefined) t.attendanceMin = attendanceMin;
    if (scoreDropMax !== undefined) t.scoreDropMax = scoreDropMax;
    if (backlogsMax !== undefined) t.backlogsMax = backlogsMax;

    await t.save();

    res.json({
      attendanceMin: t.attendanceMin,
      scoreDropMax: t.scoreDropMax,
      backlogsMax: t.backlogsMax,
    });
  } catch (err) {
    console.error('Update thresholds error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
