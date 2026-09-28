import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/courses')
      .then(({ data }) => setCourses(data.courses))
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container">
      <div className="page-header">
        <h1>Browse Courses</h1>
        <input
          className="search-input"
          placeholder="Search by title or category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading && <p>Loading courses...</p>}
      {!loading && filtered.length === 0 && <p className="muted">No courses found.</p>}

      <div className="grid">
        {filtered.map((course) => (
          <Link to={`/courses/${course.id}`} key={course.id} className="card course-card">
            <span className="badge">{course.category}</span>
            <h3>{course.title}</h3>
            <p className="muted">{course.description}</p>
            <div className="card-footer">
              <span>👩‍🏫 {course.instructor_name}</span>
              <span>{course.lesson_count} lessons</span>
              <span>{course.student_count} students</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
