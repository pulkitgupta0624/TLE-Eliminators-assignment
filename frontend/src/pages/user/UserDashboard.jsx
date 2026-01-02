import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard } from '../../api/user.api';
import { showAlert } from '../../utils/helpers';
import { logoutAllDevices } from '../../api/user.api';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [data, setData] = useState(null);
  const navigate = useNavigate();

  const handlePanicLogout = async () => {
    const confirm = window.confirm("⚠️ ARE YOU SURE? \n\nThis will log you out of this computer, your phone, and all other devices immediately.");
    if (!confirm) return;

    try {
      await logoutAllDevices();
      showAlert('Security Alert: You have been logged out of all devices.', 'success');
      navigate('/login'); // Redirect to login
    } catch (error) {
      showAlert('Failed to perform panic logout', 'error');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await getDashboard();
        setData(response.data);
      } catch (error) {
        showAlert('Error loading dashboard', 'error');
      }
    };
    loadData();
  }, []);

  if (!data) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {data.user.name}!</h1>
        <p className="subtitle">Manage your devices and security settings</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon-primary"><i className="fas fa-laptop"></i></div>
          <div className="stat-content">
            <h3>{data.activeSessions}</h3>
            <p>Active Devices</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-success"><i className="fas fa-check-circle"></i></div>
          <div className="stat-content">
            <h3>{data.user.maxDevices}</h3>
            <p>Maximum Allowed</p>
          </div>
        </div>
        {/* ... Other stat cards similar to above ... */}
      </div>

      <div className="dashboard-content">
        <div className="card">
          <div className="card-header">
            <h2><i className="fas fa-desktop"></i> Device Management</h2>
          </div>
          <div className="card-body">
            <p>You are currently logged in on <strong>{data.activeSessions}</strong> device(s).</p>
            {data.activeSessions >= data.user.maxDevices && (
              <div className="alert alert-warning">
                <i className="fas fa-exclamation-triangle"></i>
                <span>You've reached your maximum device limit.</span>
              </div>
            )}
            <Link to="/sessions" className="btn btn-primary">
              <i className="fas fa-laptop"></i> Manage Devices
            </Link>
          </div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="card-header">
            <h2 className="text-danger"><i className="fas fa-shield-alt"></i> Security Actions</h2>
          </div>
          <div className="card-body">
            <p className="mb-3">
              If you notice suspicious activity or lost a device, use this to secure your account immediately.
            </p>
            <button onClick={handlePanicLogout} className="btn btn-danger btn-block">
              <i className="fas fa-bomb"></i> Sign Out of All Devices (Panic Button)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;