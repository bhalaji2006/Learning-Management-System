import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="hero">
      <div className="hero-content">
        <h1>Learn new skills, at your own pace.</h1>
        <p className="muted">
          LearnHub is a simple learning management system — browse courses, track your
          progress, or create and teach your own course.
        </p>
        <div className="hero-actions">
          <Link to="/courses" className="btn btn-primary">
            Browse Courses
          </Link>
          {!user && (
            <Link to="/register" className="btn btn-ghost">
              Get Started
            </Link>
          )}
        </div>
      </div>
      <div className="hero-features">
        <div className="feature">
          <h3>🎓 For Students</h3>
          <p>Enroll in courses, complete lessons, and track your progress.</p>
        </div>
        <div className="feature">
          <h3>👩‍🏫 For Instructors</h3>
          <p>Create courses, add lessons, and manage your students.</p>
        </div>
        <div className="feature">
          <h3>📈 Track Progress</h3>
          <p>See exactly how far along you are in every course.</p>
        </div>
      </div>
    </div>
  );
}
