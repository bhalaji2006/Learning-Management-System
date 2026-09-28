# LMS Frontend (React + Vite)

The web client for the LMS. Talks to the backend API at `http://localhost:5000/api` by default.

## Setup (in VS Code terminal)

**Make sure the backend is already running first** (see `lms-backend/README.md`).

```bash
cd lms-frontend
npm install
cp .env.example .env
npm run dev
```

Open the URL it prints — usually **http://localhost:5173**.

## What you get

- Landing page, course catalog with search
- Register/Login (choose Student or Instructor role)
- Students: browse courses, enroll, mark lessons complete, see progress bars
- Instructors: create courses, add/delete lessons, see enrolled student counts
- JWT stored in `localStorage`, auto-attached to API requests

## Build for production

```bash
npm run build      # outputs static files to dist/
npm run preview     # preview the production build locally
```
