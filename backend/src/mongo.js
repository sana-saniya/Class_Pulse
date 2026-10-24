const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/classpulse';

async function connectMongo() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'classpulse' });
    console.log('✅ MongoDB connected successfully to database: classpulse');
    await seedMongoIfEmpty();
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
  }
}

async function seedMongoIfEmpty() {
  try {
    const Student = require('./models/Student');
    const User = require('./models/User');
    const Threshold = require('./models/Threshold');
    const bcrypt = require('bcryptjs');

    // Thresholds
    const thresholdCount = await Threshold.countDocuments();
    if (thresholdCount === 0) {
      await Threshold.create({ attendanceMin: 75, scoreDropMax: 15, backlogsMax: 2 });
      console.log('🌱 Seeded default thresholds in MongoDB');
    }

    // Default Users
    const users = [
      {
        name: 'Dr. Priya Sharma',
        email: 'faculty@classpulse.edu',
        password: 'Faculty@123',
        role: 'faculty',
        department: 'CSE',
        rollNo: null,
      },
      {
        name: 'Prof. Rajan Naidu',
        email: 'hod@classpulse.edu',
        password: 'HOD@123',
        role: 'hod',
        department: 'CSE',
        rollNo: null,
      },
      {
        name: 'Aravind Swamy',
        email: 'student@classpulse.edu',
        password: 'Student@123',
        role: 'student',
        rollNo: '22G1A0501',
        department: 'CSE',
      },
      {
        name: 'Suryanarayana Swamy (Parent)',
        email: 'parent@classpulse.edu',
        password: 'Parent@123',
        role: 'parent',
        rollNo: '22G1A0501',
        department: 'CSE',
        phone: '+91 98765 43210',
      },
    ];

    for (const u of users) {
      const exists = await User.findOne({ email: u.email });
      if (!exists) {
        const hashedPassword = await bcrypt.hash(u.password, 12);
        await User.create({
          name: u.name,
          email: u.email,
          password: hashedPassword,
          role: u.role,
          rollNo: u.rollNo,
          department: u.department,
          phone: u.phone || null,
        });
        console.log(`🌱 Seeded initial user in MongoDB: ${u.email} (${u.role})`);
      }
    }

    // Seed Students if empty
    const studentCount = await Student.countDocuments();
    if (studentCount === 0) {
      const initialStudents = [
        { rollNo: '22G1A0501', name: 'Aravind Swamy', department: 'CSE', section: 'A', attendancePct: 62, scores: { mid1: 22, mid2: 12, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 3, parentEmail: 'parent@classpulse.edu', parentPhone: '+91 98765 43210', interventions: [] },
        { rollNo: '22G1A0502', name: 'Bhavana Reddy', department: 'CSE', section: 'A', attendancePct: 88, scores: { mid1: 26, mid2: 27, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
        { rollNo: '22G1A0503', name: 'C. Harish Kumar', department: 'ECE', section: 'B', attendancePct: 71, scores: { mid1: 20, mid2: 11, assignmentsSubmitted: 3, totalAssignments: 5 }, backlogs: 2, interventions: [] },
        { rollNo: '22G1A0504', name: 'Divya Sri Lakshmi', department: 'EEE', section: 'A', attendancePct: 92, scores: { mid1: 28, mid2: 29, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
        { rollNo: '22G1A0505', name: 'E. Karthik Reddy', department: 'CSE', section: 'B', attendancePct: 68, scores: { mid1: 18, mid2: 14, assignmentsSubmitted: 1, totalAssignments: 5 }, backlogs: 4, interventions: [] },
        { rollNo: '22G1A0506', name: 'Farida Begum', department: 'MECH', section: 'A', attendancePct: 79, scores: { mid1: 23, mid2: 20, assignmentsSubmitted: 4, totalAssignments: 5 }, backlogs: 1, interventions: [] },
        { rollNo: '22G1A0507', name: 'G. Venkat Sai', department: 'ECE', section: 'A', attendancePct: 55, scores: { mid1: 15, mid2: 8, assignmentsSubmitted: 1, totalAssignments: 5 }, backlogs: 5, interventions: [] },
        { rollNo: '22G1A0508', name: 'Himabindu Patel', department: 'CSE', section: 'A', attendancePct: 84, scores: { mid1: 25, mid2: 24, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
        { rollNo: '22G1A0509', name: 'Ibrahim Shaik', department: 'EEE', section: 'B', attendancePct: 73, scores: { mid1: 19, mid2: 15, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 2, interventions: [] },
        { rollNo: '22G1A0510', name: 'J. Sravani', department: 'MECH', section: 'B', attendancePct: 91, scores: { mid1: 27, mid2: 28, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
        { rollNo: '22G1A0511', name: 'K. Ravi Teja', department: 'CSE', section: 'B', attendancePct: 66, scores: { mid1: 21, mid2: 10, assignmentsSubmitted: 2, totalAssignments: 5 }, backlogs: 3, interventions: [] },
        { rollNo: '22G1A0512', name: 'Lavanya Mothukuri', department: 'ECE', section: 'B', attendancePct: 82, scores: { mid1: 24, mid2: 25, assignmentsSubmitted: 4, totalAssignments: 5 }, backlogs: 0, interventions: [] },
        { rollNo: '22G1A0513', name: 'M. Dheeraj', department: 'MECH', section: 'A', attendancePct: 58, scores: { mid1: 16, mid2: 9, assignmentsSubmitted: 1, totalAssignments: 5 }, backlogs: 4, interventions: [] },
        { rollNo: '22G1A0514', name: 'Nandini Vankayalapati', department: 'EEE', section: 'A', attendancePct: 77, scores: { mid1: 22, mid2: 21, assignmentsSubmitted: 4, totalAssignments: 5 }, backlogs: 1, interventions: [] },
        { rollNo: '22G1A0515', name: 'O. Prashanth Varma', department: 'CSE', section: 'A', attendancePct: 95, scores: { mid1: 29, mid2: 30, assignmentsSubmitted: 5, totalAssignments: 5 }, backlogs: 0, interventions: [] },
      ];

      await Student.insertMany(initialStudents);
      console.log('🌱 Seeded 15 default students in MongoDB');
    }
  } catch (seedErr) {
    console.error('Seeding MongoDB error:', seedErr);
  }
}

module.exports = { connectMongo };
