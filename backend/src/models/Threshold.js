const mongoose = require('mongoose');

const thresholdSchema = new mongoose.Schema({
  attendanceMin: { type: Number, default: 75 },
  scoreDropMax: { type: Number, default: 15 },
  backlogsMax: { type: Number, default: 2 },
}, { timestamps: true });

module.exports = mongoose.models.Threshold || mongoose.model('Threshold', thresholdSchema);
