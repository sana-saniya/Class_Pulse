const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  rollNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  section: { type: String, required: true },
  attendancePct: { type: Number, required: true, default: 0 },
  scores: {
    mid1: { type: Number, default: 0 },
    mid2: { type: Number, default: 0 },
    assignmentsSubmitted: { type: Number, default: 0 },
    totalAssignments: { type: Number, default: 5 },
  },
  backlogs: { type: Number, default: 0 },
  parentEmail: { type: String, default: null, lowercase: true, trim: true },
  parentPhone: { type: String, default: null },
  interventions: [
    {
      id: { type: String, required: true },
      date: { type: String, required: true },
      type: { type: String, required: true },
      notes: { type: String, default: '' },
      status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
      actionTakenBy: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    }
  ]
}, { timestamps: true });

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);
