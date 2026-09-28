const express = require('express');
const db = require('../db');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all courses (public list, with instructor name + enrollment count)
router.get('/', (req, res) => {
  const courses = db
    .prepare(
      `SELECT c.*, u.name AS instructor_name,
       (SELECT COUNT(*) FROM enrollments e WHERE e.course_id = c.id) AS student_count,
       (SELECT COUNT(*) FROM lessons l WHERE l.course_id = c.id) AS lesson_count
       FROM courses c
       JOIN users u ON u.id = c.instructor_id
       ORDER BY c.created_at DESC`
    )
    .all();
  res.json({ courses });
});

// Get single course with lessons
router.get('/:id', (req, res) => {
  const course = db
    .prepare(
      `SELECT c.*, u.name AS instructor_name FROM courses c
       JOIN users u ON u.id = c.instructor_id WHERE c.id = ?`
    )
    .get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const lessons = db
    .prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC, id ASC')
    .all(req.params.id);

  res.json({ course, lessons });
});

// Create course (instructor only)
router.post('/', authenticate, requireRole('instructor'), (req, res) => {
  const { title, description, category } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  const info = db
    .prepare('INSERT INTO courses (title, description, category, instructor_id) VALUES (?, ?, ?, ?)')
    .run(title, description || '', category || 'General', req.user.id);

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ course });
});

// Update course (instructor who owns it)
router.put('/:id', authenticate, requireRole('instructor'), (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (course.instructor_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your course' });
  }
  const { title, description, category } = req.body;
  db.prepare('UPDATE courses SET title = ?, description = ?, category = ? WHERE id = ?').run(
    title || course.title,
    description ?? course.description,
    category || course.category,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  res.json({ course: updated });
});

// Delete course (instructor who owns it)
router.delete('/:id', authenticate, requireRole('instructor'), (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (course.instructor_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your course' });
  }
  db.prepare('DELETE FROM courses WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// Add a lesson to a course (instructor who owns it)
router.post('/:id/lessons', authenticate, requireRole('instructor'), (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (course.instructor_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your course' });
  }
  const { title, content, order_index } = req.body;
  if (!title) return res.status(400).json({ error: 'Lesson title is required' });

  const info = db
    .prepare('INSERT INTO lessons (course_id, title, content, order_index) VALUES (?, ?, ?, ?)')
    .run(req.params.id, title, content || '', order_index || 0);

  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json({ lesson });
});

// Delete a lesson (instructor who owns the parent course)
router.delete('/:courseId/lessons/:lessonId', authenticate, requireRole('instructor'), (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.courseId);
  if (!course) return res.status(404).json({ error: 'Course not found' });
  if (course.instructor_id !== req.user.id) {
    return res.status(403).json({ error: 'Not your course' });
  }
  db.prepare('DELETE FROM lessons WHERE id = ? AND course_id = ?').run(
    req.params.lessonId,
    req.params.courseId
  );
  res.json({ success: true });
});

// Enroll in a course (student)
router.post('/:id/enroll', authenticate, requireRole('student'), (req, res) => {
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const existing = db
    .prepare('SELECT * FROM enrollments WHERE student_id = ? AND course_id = ?')
    .get(req.user.id, req.params.id);
  if (existing) return res.status(409).json({ error: 'Already enrolled' });

  db.prepare('INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)').run(
    req.user.id,
    req.params.id
  );
  res.status(201).json({ success: true });
});

// Get course progress for the logged-in student
router.get('/:id/progress', authenticate, (req, res) => {
  const lessons = db
    .prepare('SELECT id FROM lessons WHERE course_id = ?')
    .all(req.params.id);
  const completed = db
    .prepare(
      `SELECT lesson_id FROM progress WHERE student_id = ? AND lesson_id IN
       (SELECT id FROM lessons WHERE course_id = ?)`
    )
    .all(req.user.id, req.params.id)
    .map((r) => r.lesson_id);

  const total = lessons.length;
  const done = completed.length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  res.json({ total, completed: done, percent, completedLessonIds: completed });
});

module.exports = router;
