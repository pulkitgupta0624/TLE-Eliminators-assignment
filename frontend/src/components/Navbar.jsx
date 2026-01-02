import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <i className="fas fa-shield-alt"></i>
          <span>Session Management</span>
        </div>

        <div className="navbar-menu">
          {isAdmin ? (
            <>
              <Link to="/admin" className="nav-link"><i className="fas fa-tachometer-alt"></i> Dashboard</Link>
              <Link to="/admin/users" className="nav-link"><i className="fas fa-users"></i> Users</Link>
              <Link to="/admin/suspicious" className="nav-link"><i className="fas fa-exclamation-triangle"></i> Suspicious</Link>
              <Link to="/admin/logs" className="nav-link"><i className="fas fa-history"></i> System Logs</Link>
              <Link to="/admin/sessions" className="nav-link"><i className="fas fa-desktop"></i> Sessions</Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className="nav-link"><i className="fas fa-home"></i> Dashboard</Link>
              <Link to="/sessions" className="nav-link"><i className="fas fa-laptop"></i> My Devices</Link>
            </>
          )}
        </div>

        <div className="navbar-user">
          <div className="user-info">
            <i className="fas fa-user-circle"></i>
            <span>{user.name}</span>
            {isAdmin && <span className="badge badge-admin">Admin</span>}
          </div>
          <button onClick={handleLogout} className="btn btn-logout">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;