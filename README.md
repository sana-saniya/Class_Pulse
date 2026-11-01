# ClassPulse — Early Academic Support Dashboard 🚀

[![GitHub stars](https://img.shields.io/github/stars/sana-saniya/Class_Pulse?style=flat-square)](https://github.com/sana-saniya/Class_Pulse/stargazers)
[![License](https://img.shields.io/github/license/sana-saniya/Class_Pulse?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat-square)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square)](https://www.mongodb.com/)

> **ClassPulse** is a full‑stack, offline‑first academic monitoring dashboard built for the JNTU A Hackathon. It empowers faculty, HODs, and students to identify at‑risk learners early, using configurable risk thresholds and explainable AI cards — with role‑based authentication, cohort management, and a student profile update approval workflow.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Role-Based Access](#role-based-access)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [JNTUA Roll Number Format](#jntua-roll-number-format)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

| Layer        | Technology                                              |
|--------------|---------------------------------------------------------|
| **Frontend** | React 18 · Vite · TypeScript · Tailwind CSS             |
| **Charts**   | Recharts                                                |
| **Icons**    | Lucide React                                            |
| **Backend**  | Node.js · Express                                       |
| **Database** | MongoDB (Mongoose ODM) — local or Atlas                 |
| **Auth**     | JWT (RS256) · bcrypt password hashing                   |

---

## Features

### 🔐 Authentication & Role Management
- JWT-based login with **4 distinct roles**: Faculty, HOD, Student, Parent
- Passwords hashed with bcrypt; tokens verified server-side on every request
- Role badge shown in the navbar; views are gated per role

### 🎓 Cohort & Faculty Allocation
- **Auto-distribute cohort evenly** — one click splits students equally across all faculty mentors
- Manual cohort generation with configurable batch sizes
- HOD can view and adjust faculty → student assignments

### ⚠️ Risk Detection Engine
- Configurable thresholds (attendance %, score-drop tolerance, backlogs) via live sliders
- **Explainable AI cards** — human-readable breakdown of every risk flag
- Three risk levels: 🔴 High Risk · 🟡 Medium Risk · 🟢 On Track
- Risk badge on every student row; XAI card on click

### 🗒️ Intervention Logging
- Log counselling sessions, parent meetings, remedial classes, peer tutoring
- Auto-drafted email notices with multi-language support (regional language routing)
- WhatsApp deep-link generation for quick parent outreach
- Offline SMS queue when backend is unreachable

### 📊 HOD Analytics Dashboard
- Department-wise risk distribution donut charts
- Heatmaps of section-level risk concentration
- Full audit log of all interventions across faculty
- Faculty allocation overview

### 👤 Student Profile Update Workflow
- Students can request a **phone / parent phone number change** from their profile view
- Requests are submitted with a reason and routed to their assigned **faculty mentor** for approval
- Faculty see a live **"Profile Requests" badge** in the navbar (animated when pending items exist)
- Dedicated **Profile Requests page** lists only students who have active pending requests (not everyone)
- Faculty can **Approve & Apply** (updates the official record immediately) or **Reject** with a reason
- Students can cancel a pending request before it is reviewed

### 🛠️ Offline-First Architecture
- Full offline fallback with seeded mock data — works with zero network dependency
- Live/Offline status indicator in the navbar
- All writes queue gracefully when backend is down

### 📂 Data Management
- **Export CSV** — download a full cohort risk report
- **Add Student Record** — add new students directly from the faculty dashboard
- Backend seeder for bootstrapping the MongoDB database with realistic JNTUA roll-number data

---

## Role-Based Access

| Feature                        | Student | Parent | Faculty | HOD |
|--------------------------------|:-------:|:------:|:-------:|:---:|
| View own academic profile      | ✅      | ✅     | —       | —   |
| Request phone number change    | ✅      | —      | —       | —   |
| View mentee list & risk cards  | —       | —      | ✅      | ✅  |
| Log interventions              | —       | —      | ✅      | ✅  |
| Approve/reject profile updates | —       | —      | ✅      | ✅  |
| HOD analytics & audit log      | —       | —      | —       | ✅  |
| Add student records            | —       | —      | ✅      | ✅  |
| Generate / distribute cohort   | —       | —      | ✅      | ✅  |
| Export CSV                     | —       | —      | ✅      | ✅  |

---

## Quick Start

```bash
# 1️⃣  Clone the repository
git clone https://github.com/sana-saniya/Class_Pulse.git
cd Class_Pulse

# 2️⃣  Install all dependencies (frontend + backend)
npm run install:all

# 3️⃣  Configure environment variables (see below)
cp backend/.env.example backend/.env   # then fill in your values

# 4️⃣  Seed the MongoDB database with mock students
npm run seed

# 5️⃣  Start the backend (Terminal 1)
npm run dev:backend

# 6️⃣  Start the frontend (Terminal 2)
npm run dev:frontend
```

Open the app: **[http://localhost:5173](http://localhost:5173)**

> The frontend automatically falls back to offline mock data if the backend is not running.

---

## Environment Variables

Create `backend/.env` with the following keys:

```env
# MongoDB connection string (local or Atlas)
MONGO_URI=mongodb://localhost:27017/classpulse

# JWT secret (use a long random string in production)
JWT_SECRET=your_super_secret_key_here

# Port for the Express API (default: 5000)
PORT=5000
```

---

## Project Structure

```
Class_Pulse/
├── backend/
│   └── src/
│       ├── index.js              # Express server entry point
│       ├── mongo.js              # MongoDB connection (Mongoose)
│       ├── models/
│       │   ├── Student.js        # Student schema (inc. pendingProfileUpdate)
│       │   ├── Faculty.js        # Faculty / user schema
│       │   └── Intervention.js   # Intervention log schema
│       └── routes/
│           ├── auth.js           # Login, JWT issue, faculty directory
│           ├── students.js       # CRUD + profile update approval workflow
│           ├── interventions.js  # Intervention CRUD
│           └── thresholds.js     # Risk threshold persistence
├── frontend/
│   └── src/
│       ├── api/                  # Typed API layer with offline fallback
│       ├── components/           # Navbar, StudentTable, Modals, XAICard …
│       ├── context/              # AppContext (global state) · AuthContext
│       ├── types/                # TypeScript interfaces
│       ├── utils/
│       │   ├── riskEngine.ts     # Risk scoring logic
│       │   ├── allocationEngine.ts   # Even cohort distribution algorithm
│       │   ├── languageRouter.ts     # Regional language detection
│       │   ├── messagingGateway.ts   # WhatsApp link + offline SMS queue
│       │   └── notificationTemplates.ts
│       └── views/
│           ├── FacultyView.tsx   # Faculty academic dashboard
│           ├── HODView.tsx       # HOD analytics & audit
│           ├── StudentView.tsx   # Student self-service profile
│           ├── ParentView.tsx    # Parent read-only view
│           └── ProfileUpdatesView.tsx  # ⭐ Pending profile update approvals
└── README.md
```

---

## JNTUA Roll Number Format

```
22G1A0501
│ │  │  └─ Serial: 0501
│ │  └──── Branch code: 05 (CSE)
│ └─────── College code: G1A
└───────── Admission year: 22
```

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit with clear messages (`git commit -m "feat: add xyz"`)
4. Push to your fork and open a Pull Request

---

## Recent Changes

- Added new profile update approval workflow enhancements.
- Updated risk detection engine thresholds UI.

---

## License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

*Built for JNTU A Hackathon · Aligned with Ministry of Education & NEP 2020 · Offline‑first · Zero network dependency*
