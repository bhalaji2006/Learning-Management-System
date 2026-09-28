# LMS Backend (Express + SQLite)

A REST API for a Learning Management System: authentication (JWT), courses, lessons,
enrollments, and progress tracking. Uses SQLite (via `better-sqlite3`) so there is
**no external database server to install** — the database is just a file.

## Setup (in VS Code terminal)

```bash
cd lms-backend
npm install
cp .env.example .env
npm run seed      # optional: adds demo instructor/student + 2 courses
npm run dev        # starts on http://localhost:5000 (auto-restarts on changes)
```

If you don't have `nodemon`/don't want auto-restart, use `npm start` instead of `npm run dev`.

Demo accounts created by `npm run seed`:
- Instructor: `instructor@example.com` / `password123`
- Student: `student@example.com` / `password123`

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | - | Register (role: student/instructor) |
| POST | /api/auth/login | - | Login, returns JWT |
| GET | /api/auth/me | ✅ | Current user info |
| GET | /api/courses | - | List all courses |
| GET | /api/courses/:id | - | Course details + lessons |
| POST | /api/courses | ✅ instructor | Create course |
| PUT | /api/courses/:id | ✅ instructor (owner) | Update course |
| DELETE | /api/courses/:id | ✅ instructor (owner) | Delete course |
| POST | /api/courses/:id/lessons | ✅ instructor (owner) | Add lesson |
| DELETE | /api/courses/:id/lessons/:lessonId | ✅ instructor (owner) | Delete lesson |
| POST | /api/courses/:id/enroll | ✅ student | Enroll in course |
| GET | /api/courses/:id/progress | ✅ | Progress in a course |
| GET | /api/enrollments/my | ✅ student | My enrolled courses + progress |
| GET | /api/enrollments/teaching | ✅ instructor | Courses I teach |
| POST | /api/enrollments/lessons/:lessonId/complete | ✅ student | Mark lesson complete |
| DELETE | /api/enrollments/lessons/:lessonId/complete | ✅ student | Unmark lesson |

The SQLite database file (`lms.db`) is created automatically on first run in this folder.
To reset all data, stop the server and delete `lms.db` (and the `-wal`/`-shm` files).
