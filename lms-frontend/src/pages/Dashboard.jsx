import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = user.role === 'student' ? '/enrollments/my' : '/enrollments/teaching';
    api
      .get(endpoint)
      .then(({ data }) => setCourses(data.courses))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="container">
      <h1>Welcome, {user.name} 👋</h1>
      <p className="muted">
        {user.role === 'student'
          ? 'Here are the courses you are enrolled in.'
          : 'Here are the courses you are teaching.'}
      </p>

      {loading && <p>Loading...</p>}

      {!loading && courses.length === 0 && (
        <div className="empty-state">
          <p>
            {user.role === 'student'
              ? "You haven't enrolled in any courses yet."
              : "You haven't created any courses yet."}
          </p>
          <Link
            to={user.role === 'student' ? '/courses' : '/create-course'}
            className="btn btn-primary"
          >
            {user.role === 'student' ? 'Browse Courses' : 'Create a Course'}
          </Link>
        </div>
      )}

      <div className="grid">
        {courses.map((course) => (
          <Link to={`/courses/${course.id}`} key={course.id} className="card course-card">
            <span className="badge">{course.category}</span>
            <h3>{course.title}</h3>
            {user.role === 'student' ? (
              <>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.percent}%` }} />
                </div>
                <span className="muted small">
                  {course.completed_lessons}/{course.total_lessons} lessons · {course.percent}%
                </span>
              </>
            ) : (
              <div className="card-footer">
                <span>{course.lesson_count} lessons</span>
                <span>{course.student_count} students enrolled</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
