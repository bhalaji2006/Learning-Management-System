// Optional: populates the database with demo data.
// Run with: npm run seed
const bcrypt = require('bcryptjs');
const db = require('./db');

const password = bcrypt.hashSync('password123', 10);

const insertUser = db.prepare(
  'INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)'
);
insertUser.run('Jane Instructor', 'instructor@example.com', password, 'instructor');
insertUser.run('Sam Student', 'student@example.com', password, 'student');

const instructor = db.prepare('SELECT id FROM users WHERE email = ?').get('instructor@example.com');

const insertCourse = db.prepare(
  'INSERT INTO courses (title, description, category, instructor_id) VALUES (?, ?, ?, ?)'
);
const c1 = insertCourse.run(
  'Introduction to Web Development',
  'Learn HTML, CSS, and JavaScript fundamentals from scratch.',
  'Web Development',
  instructor.id
);
const c2 = insertCourse.run(
  'Python for Data Analysis',
  'Master pandas, numpy, and data visualization with Python.',
  'Data Science',
  instructor.id
);

const insertLesson = db.prepare(
  'INSERT INTO lessons (course_id, title, content, order_index) VALUES (?, ?, ?, ?)'
);
[
  ['What is HTML?', 'HTML stands for HyperText Markup Language. It structures web content.'],
  ['CSS Basics', 'CSS is used to style HTML elements — colors, layout, fonts, and more.'],
  ['JavaScript Fundamentals', 'JavaScript adds interactivity to your web pages.'],
].forEach(([title, content], i) => insertLesson.run(c1.lastInsertRowid, title, content, i));

[
  ['Getting Started with pandas', 'pandas is a powerful library for data manipulation in Python.'],
  ['Data Cleaning Techniques', 'Learn how to handle missing values and duplicates.'],
].forEach(([title, content], i) => insertLesson.run(c2.lastInsertRowid, title, content, i));

console.log('✅ Seed data inserted!');
console.log('   Instructor login: instructor@example.com / password123');
console.log('   Student login:    student@example.com / password123');
