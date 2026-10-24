# ClassPulse — Early Academic Support Dashboard

> JNTUA Hackathon Project · Aligned with Ministry of Education & NEP 2020 Guidelines

ClassPulse is a full-stack, offline-first academic monitoring dashboard that helps faculty identify at-risk students early using configurable risk thresholds and explainable AI cards.

---

## Tech Stack

| Layer     | Technology                              |
|-----------|----------------------------------------|
| Frontend  | React 18 + Vite + TypeScript + Tailwind CSS |
| Charts    | Recharts                                |
| Icons     | Lucide React                            |
| Backend   | Node.js + Express                       |
| Database  | SQLite (via better-sqlite3)             |

---

## Features

- **Role-Based Access**: Faculty, HOD, and Student views
- **Configurable Risk Thresholds**: Live sliders for attendance %, score drop tolerance, and backlogs
- **Explainable AI Cards**: Human-readable reasons for each student's risk flag
- **Intervention Logging**: Log counselling, parent meetings, remedial classes with auto-drafted email notices
- **HOD Analytics**: Dept-wise risk distribution donut charts, heatmaps, and audit logs
- **Student Privacy View**: Personal academic trajectory without peer comparisons
- **Offline Fallback**: Works completely offline with seeded mock data
- **Export CSV**: Download full cohort risk report
- **Generate Synthetic Cohort**: Add new student batches dynamically

---

## Quick Start

```bash
# 1. Install dependencies
npm run install:all

# 2. Seed the database
npm run seed

# 3. Start backend (Terminal 1)
npm run dev:backend

# 4. Start frontend (Terminal 2)
npm run dev:frontend
```

Then open: **http://localhost:5173**

The frontend will automatically fall back to offline mock data if the backend is not running.

---

## Project Structure

```
Class_Pulse/
├── backend/
│   ├── src/
│   │   ├── index.js          # Express server
│   │   ├── db.js             # SQLite setup
│   │   ├── seed.js           # 15 student seed data
│   │   └── routes/
│   │       ├── students.js
│   │       ├── interventions.js
│   │       └── thresholds.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/              # API layer with offline fallback
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Global state (AppContext)
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # Risk engine
│   │   └── views/            # Faculty / HOD / Student views
│   └── package.json
└── README.md
```

---

## JNTUA Roll Number Format

`22G1A0501` → Year: 22, College: G1A, Serial: 0501

---

*Built for JNTUA Hackathon · NEP 2020 · Offline-first · Zero network dependency*
