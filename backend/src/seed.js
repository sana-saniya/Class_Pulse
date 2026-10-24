const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const STUDENTS = [
  { roll_no: '22G1A0501', name: 'Aravind Swamy',         department: 'CSE',  section: 'A', attendance_pct: 62, mid1: 22, mid2: 12, assignments_submitted: 2, backlogs: 3 },
  { roll_no: '22G1A0502', name: 'Bhavana Reddy',         department: 'CSE',  section: 'A', attendance_pct: 88, mid1: 26, mid2: 27, assignments_submitted: 5, backlogs: 0 },
  { roll_no: '22G1A0503', name: 'C. Harish Kumar',       department: 'ECE',  section: 'B', attendance_pct: 71, mid1: 20, mid2: 11, assignments_submitted: 3, backlogs: 2 },
  { roll_no: '22G1A0504', name: 'Divya Sri Lakshmi',     department: 'EEE',  section: 'A', attendance_pct: 92, mid1: 28, mid2: 29, assignments_submitted: 5, backlogs: 0 },
  { roll_no: '22G1A0505', name: 'E. Karthik Reddy',      department: 'CSE',  section: 'B', attendance_pct: 68, mid1: 18, mid2: 14, assignments_submitted: 1, backlogs: 4 },
  { roll_no: '22G1A0506', name: 'Farida Begum',          department: 'MECH', section: 'A', attendance_pct: 79, mid1: 23, mid2: 20, assignments_submitted: 4, backlogs: 1 },
  { roll_no: '22G1A0507', name: 'G. Venkat Sai',         department: 'ECE',  section: 'A', attendance_pct: 55, mid1: 15, mid2:  8, assignments_submitted: 1, backlogs: 5 },
  { roll_no: '22G1A0508', name: 'Himabindu Patel',       department: 'CSE',  section: 'A', attendance_pct: 84, mid1: 25, mid2: 24, assignments_submitted: 5, backlogs: 0 },
  { roll_no: '22G1A0509', name: 'Ibrahim Shaik',         department: 'EEE',  section: 'B', attendance_pct: 73, mid1: 19, mid2: 15, assignments_submitted: 2, backlogs: 2 },
  { roll_no: '22G1A0510', name: 'J. Sravani',            department: 'MECH', section: 'B', attendance_pct: 91, mid1: 27, mid2: 28, assignments_submitted: 5, backlogs: 0 },
  { roll_no: '22G1A0511', name: 'K. Ravi Teja',          department: 'CSE',  section: 'B', attendance_pct: 66, mid1: 21, mid2: 10, assignments_submitted: 2, backlogs: 3 },
  { roll_no: '22G1A0512', name: 'Lavanya Mothukuri',     department: 'ECE',  section: 'B', attendance_pct: 82, mid1: 24, mid2: 25, assignments_submitted: 4, backlogs: 0 },
  { roll_no: '22G1A0513', name: 'M. Dheeraj',            department: 'MECH', section: 'A', attendance_pct: 58, mid1: 16, mid2:  9, assignments_submitted: 1, backlogs: 4 },
  { roll_no: '22G1A0514', name: 'Nandini Vankayalapati', department: 'EEE',  section: 'A', attendance_pct: 77, mid1: 22, mid2: 21, assignments_submitted: 4, backlogs: 1 },
  { roll_no: '22G1A0515', name: 'O. Prashanth Varma',   department: 'CSE',  section: 'A', attendance_pct: 95, mid1: 29, mid2: 30, assignments_submitted: 5, backlogs: 0 },
];

let seeded = 0;
for (const s of STUDENTS) {
  const existing = db.get('SELECT id FROM students WHERE roll_no = ?', [s.roll_no]);
  if (!existing) {
    db.run(
      `INSERT INTO students (id, roll_no, name, department, section, attendance_pct, mid1, mid2, assignments_submitted, total_assignments, backlogs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 5, ?)`,
      [uuidv4(), s.roll_no, s.name, s.department, s.section,
      s.attendance_pct, s.mid1, s.mid2, s.assignments_submitted, s.backlogs],
    );
    seeded++;
  }
}
console.log(`✅ Seeded ${seeded} new students (${STUDENTS.length - seeded} already existed)`);
