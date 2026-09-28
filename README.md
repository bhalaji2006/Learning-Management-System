# LMS Project

| Intern ID | Full Name | No. of Weeks | Project Name | Project Scope |
|---|---|---|---|---|
| CITS9146 | Kuddigana Venkatbhalaji | 8 Weeks | Learning Management System (LMS) | Full-stack school management platform covering course creation with lessons and downloadable materials, student enrollment and progress tracking, attendance management, weekly class timetables, fee management with simulated payments, examination management with results and auto-generated transcripts, and course announcements/communication feed. |

A full-stack Learning Management / school-management system.

## Structure

- `lms-backend/` — Node.js + Express REST API (SQLite via `better-sqlite3`, JWT auth). See its README for the full API reference.
- `lms-frontend/` — React + Vite frontend. See its README for a feature tour.

## Quick start

Open this folder in VS Code, then use two terminals:

**Terminal 1 — backend:**
```bash
cd lms-backend
npm install
copy .env.example .env    # (use `cp` instead of `copy` on macOS/Linux)
npm run seed              # optional: demo instructor/student + sample courses
npm run dev
```
Runs at http://localhost:5000

**Terminal 2 — frontend:**
```bash
cd lms-frontend
npm install
copy .env.example .env    # (use `cp` instead of `copy` on macOS/Linux)
npm run dev
```
Runs at http://localhost:5173

Open http://localhost:5173 in your browser. Both terminals need to stay running.

Demo accounts (after `npm run seed`):
- Instructor: `instructor@example.com` / `password123`
- Student: `student@example.com` / `password123`

## Features

Currently implemented:

- Authentication (student / instructor roles, JWT)
- Courses and lessons (instructors create, edit and delete)
- Enrollments and lesson progress tracking

Remaining from the project scope (not yet implemented):

- Course documents/materials (file uploads)
- Attendance tracking
- Weekly class timetables
- Fee management (create, pay, receipts)
- Examinations, results, and student transcripts
- Course announcements + a combined student announcement feed
