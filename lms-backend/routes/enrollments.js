const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all courses the logged-in student is enrolled in, with progress
router.get('/my', authenticate, requireRole('student'), (req, res) => {
  const rows = db
    .prepare(
      `SELECT c.*, u.name AS instructor_name, e.enrolled_at
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       JOIN users u ON u.id = c.instructor_id
       WHERE e.student_id = ?
       ORDER BY e.enrolled_at DESC`
    )
    .all(req.user.id);

  const withProgress = rows.map((course) => {
    const total = db
      .prepare('SELECT COUNT(*) AS c FROM lessons WHERE course_id = ?')
      .get(course.id).c;
    const done = db
      .prepare(
        `SELECT COUNT(*) AS c FROM progress WHERE student_id = ? AND lesson_id IN
         (SELECT id FROM lessons WHERE course_id = ?)`
      )
      .get(req.user.id, course.id).c;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);
    return { ...course, total_lessons: total, completed_lessons: done, percent };
  });

  res.json({ courses: withProgress });
});

// Get courses created by the logged-in instructor
router.get('/teaching', authenticate, requireRole('instructor'), (req, res) => {
  const courses = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS student_count,
       (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count
       FROM courses c WHERE c.instructor_id = ? ORDER BY c.created_at DESC`
    )
    .all(req.user.id);
  res.json({ courses });
});

// Mark a lesson complete
router.post('/lessons/:lessonId/complete', authenticate, requireRole('student'), (req, res) => {
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.lessonId);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

  const enrolled = db
    .prepare('SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?')
    .get(req.user.id, lesson.course_id);
  if (!enrolled) return res.status(403).json({ error: 'Not enrolled in this course' });

  db.prepare(
    'INSERT OR IGNORE INTO progress (student_id, lesson_id, completed) VALUES (?, ?, 1)'
  ).run(req.user.id, req.params.lessonId);

  res.json({ success: true });
});

// Unmark a lesson (undo completion)
router.delete('/lessons/:lessonId/complete', authenticate, requireRole('student'), (req, res) => {
  db.prepare('DELETE FROM progress WHERE student_id = ? AND lesson_id = ?').run(
    req.user.id,
    req.params.lessonId
  );
  res.json({ success: true });
});

module.exports = router;
