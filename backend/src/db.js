const { Database } = require('node-sqlite3-wasm');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'classpulse.db');

const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    roll_no TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    section TEXT NOT NULL,
    attendance_pct REAL NOT NULL DEFAULT 0,
    mid1 INTEGER NOT NULL DEFAULT 0,
    mid2 INTEGER NOT NULL DEFAULT 0,
    assignments_submitted INTEGER NOT NULL DEFAULT 0,
    total_assignments INTEGER NOT NULL DEFAULT 5,
    backlogs INTEGER NOT NULL DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS interventions (
    id TEXT PRIMARY KEY,
    student_id TEXT NOT NULL,
    date TEXT NOT NULL,
    type TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'Pending',
    action_taken_by TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS thresholds (
    id INTEGER PRIMARY KEY,
    attendance_min REAL NOT NULL DEFAULT 75,
    score_drop_max REAL NOT NULL DEFAULT 15,
    backlogs_max INTEGER NOT NULL DEFAULT 2
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('faculty','hod','student')),
    roll_no TEXT,
    department TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const existing = db.get('SELECT id FROM thresholds WHERE id = 1');
if (!existing) {
  db.run('INSERT INTO thresholds (id, attendance_min, score_drop_max, backlogs_max) VALUES (1, 75, 15, 2)');
}

module.exports = db;
