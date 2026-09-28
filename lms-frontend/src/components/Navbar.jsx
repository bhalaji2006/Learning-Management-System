import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        📚 LearnHub
      </Link>
      <div className="nav-links">
        <Link to="/courses">Browse Courses</Link>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link>
            {user.role === 'instructor' && <Link to="/create-course">+ New Course</Link>}
            <span className="nav-user">Hi, {user.name}</span>
            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
