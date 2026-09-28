import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function CourseDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrolled, setEnrolled] = useState(false);
  const [progress, setProgress] = useState({ completedLessonIds: [], percent: 0 });
  const [newLesson, setNewLesson] = useState({ title: '', content: '' });
  const [msg, setMsg] = useState('');

  const isOwner = user && course && user.role === 'instructor' && user.id === course.instructor_id;

  const load = () => {
    api.get(`/courses/${id}`).then(({ data }) => {
      setCourse(data.course);
      setLessons(data.lessons);
    });
    if (user && user.role === 'student') {
      api.get(`/courses/${id}/progress`).then(({ data }) => setProgress(data));
      api.get('/enrollments/my').then(({ data }) => {
        setEnrolled(data.courses.some((c) => String(c.id) === String(id)));
      });
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    try {
      await api.post(`/courses/${id}/enroll`);
      setEnrolled(true);
      setMsg('Enrolled! Start learning below.');
      load();
    } catch (err) {
      setMsg(err.response?.data?.error || 'Enroll failed');
    }
  };

  const toggleComplete = async (lessonId, isDone) => {
    if (isDone) {
      await api.delete(`/enrollments/lessons/${lessonId}/complete`);
    } else {
      await api.post(`/enrollments/lessons/${lessonId}/complete`);
    }
    load();
  };

  const handleAddLesson = async (e) => {
    e.preventDefault();
    if (!newLesson.title) return;
    await api.post(`/courses/${id}/lessons`, {
      ...newLesson,
      order_index: lessons.length,
    });
    setNewLesson({ title: '', content: '' });
    load();
  };

  const handleDeleteLesson = async (lessonId) => {
    await api.delete(`/courses/${id}/lessons/${lessonId}`);
    load();
  };

  if (!course) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <span className="badge">{course.category}</span>
      <h1>{course.title}</h1>
      <p className="muted">
        By {course.instructor_name} · {lessons.length} lessons
      </p>
      <p>{course.description}</p>

      {msg && <div className="alert-info">{msg}</div>}

      {user?.role === 'student' && !enrolled && (
        <button className="btn btn-primary" onClick={handleEnroll}>
          Enroll in this Course
        </button>
      )}

      {user?.role === 'student' && enrolled && (
        <div className="progress-wrap">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress.percent}%` }} />
          </div>
          <span className="muted small">{progress.percent}% complete</span>
        </div>
      )}

      <h2>Lessons</h2>
      <div className="lesson-list">
        {lessons.length === 0 && <p className="muted">No lessons added yet.</p>}
        {lessons.map((lesson, idx) => {
          const isDone = progress.completedLessonIds?.includes(lesson.id);
          return (
            <div className="lesson-item" key={lesson.id}>
              <div>
                <strong>
                  {idx + 1}. {lesson.title}
                </strong>
                <p className="muted">{lesson.content}</p>
              </div>
              <div className="lesson-actions">
                {user?.role === 'student' && enrolled && (
                  <button
                    className={isDone ? 'btn btn-sm btn-success' : 'btn btn-sm btn-ghost'}
                    onClick={() => toggleComplete(lesson.id, isDone)}
                  >
                    {isDone ? '✓ Completed' : 'Mark Complete'}
                  </button>
                )}
                {isOwner && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteLesson(lesson.id)}>
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isOwner && (
        <form className="card add-lesson-form" onSubmit={handleAddLesson}>
          <h3>Add a Lesson</h3>
          <input
            placeholder="Lesson title"
            value={newLesson.title}
            onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
            required
          />
          <textarea
            placeholder="Lesson content"
            value={newLesson.content}
            onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
            rows={3}
          />
          <button className="btn btn-primary">Add Lesson</button>
        </form>
      )}
    </div>
  );
}
