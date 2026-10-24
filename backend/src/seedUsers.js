/**
 * Seeds default users for all 3 roles.
 * Run once: node src/seedUsers.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/classpulse';

const USERS = [
  {
    name:       'Dr. Priya Sharma',
    email:      'faculty@classpulse.edu',
    password:   'Faculty@123',
    role:       'faculty',
    department: 'CSE',
  },
  {
    name:       'Prof. Rajan Naidu',
    email:      'hod@classpulse.edu',
    password:   'HOD@123',
    role:       'hod',
    department: 'CSE',
  },
  {
    name:       'Aravind Swamy',
    email:      'student@classpulse.edu',
    password:   'Student@123',
    role:       'student',
    rollNo:     '22G1A0501',
    department: 'CSE',
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  for (const u of USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`  ↳ Skipped (already exists): ${u.email}`);
      continue;
    }
    await User.create(u);
    console.log(`  ✅ Created: ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('\nDone. Default credentials:');
  console.log('  Faculty : faculty@classpulse.edu  / Faculty@123');
  console.log('  HOD     : hod@classpulse.edu      / HOD@123');
  console.log('  Student : student@classpulse.edu  / Student@123');
}

seed().catch((e) => { console.error(e); process.exit(1); });
