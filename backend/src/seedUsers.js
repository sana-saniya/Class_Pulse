const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('./db');

const USERS = [
  {
    name:       'Dr. Priya Sharma',
    email:      'faculty@classpulse.edu',
    password:   'Faculty@123',
    role:       'faculty',
    department: 'CSE',
    roll_no:    null,
  },
  {
    name:       'Prof. Rajan Naidu',
    email:      'hod@classpulse.edu',
    password:   'HOD@123',
    role:       'hod',
    department: 'CSE',
    roll_no:    null,
  },
  {
    name:       'Aravind Swamy',
    email:      'student@classpulse.edu',
    password:   'Student@123',
    role:       'student',
    roll_no:    '22G1A0501',
    department: 'CSE',
  },
];

async function seed() {
  let seeded = 0;
  for (const u of USERS) {
    const exists = db.get('SELECT id FROM users WHERE email = ?', [u.email]);
    if (exists) {
      console.log(`  ↳ Skipped (exists): ${u.email}`);
      continue;
    }
    const hash = await bcrypt.hash(u.password, 12);
    db.run(
      'INSERT INTO users (id, name, email, password_hash, role, roll_no, department) VALUES (?,?,?,?,?,?,?)',
      [uuidv4(), u.name, u.email, hash, u.role, u.roll_no, u.department],
    );
    console.log(`  ✅ Created: ${u.email}  (${u.role})`);
    seeded++;
  }

  console.log(`\nSeeded ${seeded} user(s). Login credentials:`);
  console.log('  Faculty : faculty@classpulse.edu  / Faculty@123');
  console.log('  HOD     : hod@classpulse.edu      / HOD@123');
  console.log('  Student : student@classpulse.edu  / Student@123');
}

seed().catch((e) => { console.error(e); process.exit(1); });
