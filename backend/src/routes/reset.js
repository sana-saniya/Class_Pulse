const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Threshold = require('../models/Threshold');

// Initial 15 demo students (same as seed)
const initialStudents = [
  { rollNo: '22G1A0501', name: 'Aravind Swamy', department: 'CSE', section: 'A', attendancePct: 62, scores: { mid1: 22, mid2: 12, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 3, parentEmail: 'parent@classpulse.edu', parentPhone: '+91 98765 43210', homeDistrict: 'Nellore', state: 'Andhra Pradesh', parentLanguage: 'te', interventions: [] },
  { rollNo: '22G1A0502', name: 'Bhavana Reddy', department: 'CSE', section: 'A', attendancePct: 88, scores: { mid1: 26, mid2: 27, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, parentEmail: 'parent.0502@classpulse.edu', parentPhone: '+91 98765 43211', homeDistrict: 'Chittoor', state: 'Andhra Pradesh', parentLanguage: 'te', interventions: [] },
  { rollNo: '22G1A0503', name: 'C. Harish Kumar', department: 'ECE', section: 'B', attendancePct: 71, scores: { mid1: 20, mid2: 11, assignmentsSubmitted: 3, totalAssignments: 5 }, backlogs: 2, parentEmail: 'parent.0503@classpulse.edu', parentPhone: '+91 98765 43212', homeDistrict: 'Hosur', state: 'Tamil Nadu', parentLanguage: 'ta', interventions: [] },
  { rollNo: '22G1A0504', name: 'Divya Sri Lakshmi', department: 'EEE', section: 'A', attendancePct: 92, scores: { mid1: 28, mid2: 29, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, parentEmail: 'parent.0504@classpulse.edu', parentPhone: '+91 98765 43213', homeDistrict: 'Tirupati', state: 'Andhra Pradesh', parentLanguage: 'te', interventions: [] },
  { rollNo: '22G1A0505', name: 'E. Karthik Reddy', department: 'CSE', section: 'B', attendancePct: 68, scores: { mid1: 18, mid2: 14, assignmentsSubmitted: 1, totalAssignments: 5 }, backlogs: 4, parentEmail: 'parent.0505@classpulse.edu', parentPhone: '+91 98765 43214', homeDistrict: 'Kolar', state: 'Karnataka', parentLanguage: 'kn', interventions: [] },
  { rollNo: '22G1A0506', name: 'Farida Begum', department: 'MECH', section: 'A', attendancePct: 79, scores: { mid1: 23, mid2: 20, assignmentsSubmitted: 4, totalAssignments: 5 }, backlogs: 1, parentEmail: 'parent.0506@classpulse.edu', parentPhone: '+91 98765 43215', homeDistrict: 'Pune', state: 'Maharashtra', parentLanguage: 'mr', interventions: [] },
  { rollNo: '22G1A0507', name: 'G. Venkat Sai', department: 'ECE', section: 'A', attendancePct: 55, scores: { mid1: 15, mid2: 8, assignmentsSubmitted: 1, totalAssignments: 5 }, backlogs: 5, parentEmail: 'parent.0507@classpulse.edu', parentPhone: '+91 98765 43216', homeDistrict: 'Kadapa', state: 'Andhra Pradesh', parentLanguage: 'te', interventions: [] },
  { rollNo: '22G1A0508', name: 'Himabindu Patel', department: 'CSE', section: 'A', attendancePct: 84, scores: { mid1: 25, mid2: 24, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, parentEmail: 'parent.0508@classpulse.edu', parentPhone: '+91 98765 43217', homeDistrict: 'Mumbai', state: 'Maharashtra', parentLanguage: 'mr', interventions: [] },
  { rollNo: '22G1A0509', name: 'Ibrahim Shaik', department: 'EEE', section: 'B', attendancePct: 73, scores: { mid1: 19, mid2: 15, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 2, parentEmail: 'parent.0509@classpulse.edu', parentPhone: '+91 98765 43218', homeDistrict: 'Kurnool', state: 'Andhra Pradesh', parentLanguage: 'te', interventions: [] },
  { rollNo: '22G1A0510', name: 'J. Sravani', department: 'MECH', section: 'B', attendancePct: 91, scores: { mid1: 27, mid2: 28, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, parentEmail: 'parent.0510@classpulse.edu', parentPhone: '+91 98765 43219', homeDistrict: 'Anantapur', state: 'Andhra Pradesh', parentLanguage: 'te', interventions: [] },
  { rollNo: '22G1A0511', name: 'K. Ravi Teja', department: 'CSE', section: 'B', attendancePct: 66, scores: { mid1: 21, mid2: 10, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 3, parentEmail: 'parent.0511@classpulse.edu', parentPhone: '+91 98765 43220', homeDistrict: 'Hyderabad', state: 'Telangana', parentLanguage: 'te', interventions: [] },
  { rollNo: '22G1A0512', name: 'Lavanya Mothukuri', department: 'ECE', section: 'B', attendancePct: 82, scores: { mid1: 24, mid2: 25, assignmentsSubmitted: 4, totalAssignments: 5 }, backlogs: 0, parentEmail: 'parent.0512@classpulse.edu', parentPhone: '+91 98765 43221', homeDistrict: 'Vellore', state: 'Tamil Nadu', parentLanguage: 'ta', interventions: [] },
  { rollNo: '22G1A0513', name: 'M. Dheeraj', department: 'MECH', section: 'A', attendancePct: 58, scores: { mid1: 16, mid2: 9, assignmentsSubmitted: 1, totalAssignments: 5 }, backlogs: 4, parentEmail: 'parent.0513@classpulse.edu', parentPhone: '+91 98765 43222', homeDistrict: 'Bengaluru', state: 'Karnataka', parentLanguage: 'kn', interventions: [] },
  { rollNo: '22G1A0514', name: 'Nandini Vankayalapati', department: 'EEE', section: 'A', attendancePct: 77, scores: { mid1: 22, mid2: 21, assignmentsSubmitted: 4, totalAssignments: 5 }, backlogs: 1, parentEmail: 'parent.0514@classpulse.edu', parentPhone: '+91 98765 43223', homeDistrict: 'Ballari', state: 'Karnataka', parentLanguage: 'kn', interventions: [] },
  { rollNo: '22G1A0515', name: 'O. Prashanth Varma', department: 'CSE', section: 'A', attendancePct: 95, scores: { mid1: 29, mid2: 30, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, parentEmail: 'parent.0515@classpulse.edu', parentPhone: '+91 98765 43224', homeDistrict: 'Patna', state: 'Bihar', parentLanguage: 'hi', interventions: [] }
];

// POST /api/reset – drop all students, re‑seed demo data + default thresholds
router.post('/', async (req, res) => {
  try {
    await Student.deleteMany({});
    await Student.insertMany(initialStudents);
    // Ensure thresholds exist (idempotent)
    const thCount = await Threshold.countDocuments();
    if (thCount === 0) {
      await Threshold.create({ attendanceMin: 75, scoreDropMax: 15, backlogsMax: 2 });
    }
    res.json({ message: 'Demo data restored', studentCount: initialStudents.length });
  } catch (err) {
    console.error('Reset error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
