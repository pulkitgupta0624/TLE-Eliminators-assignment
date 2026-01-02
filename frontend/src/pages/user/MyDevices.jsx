import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getSessions, logoutDevice } from '../../api/user.api';
import { showAlert, formatDate, getDeviceIcon } from '../../utils/helpers';

const MyDevices = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSessions = async () => {
    try {
      const response = await getSessions();
      setSessions(response.sessions);
    } catch (error) {
      showAlert('Error loading sessions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDeviceLogout = async (sessionId) => {
    if (!window.confirm('Are you sure you want to logout from this device?')) return;
    
    try {
      await logoutDevice(sessionId);
      showAlert('Device logged out successfully!', 'success');
      loadSessions(); // Refresh list
    } catch (error) {
      showAlert('Error logging out device', 'error');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="sessions-page">
      <div className="page-header">
        <h1><i className="fas fa-laptop"></i> My Devices</h1>
        <p className="subtitle">Manage your active login sessions</p>
      </div>

      {sessions.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-desktop"></i>
          <h3>No Active Sessions</h3>
          <p>You are not logged in on any device.</p>
        </div>
      ) : (
        <div className="sessions-grid">
          {sessions.map(session => (
            <div key={session.id} className={`session-card ${session.isCurrent ? 'session-current' : ''}`}>
              <div className="session-icon">
                <i className={`fas ${getDeviceIcon(session.deviceInfo.deviceType)}`}></i>
              </div>
              <div className="session-info">
                <h3>{session.deviceInfo.browser} on {session.deviceInfo.os}</h3>
                {session.isCurrent && (
                  <span className="badge badge-success"><i className="fas fa-check-circle"></i> Current Device</span>
                )}
                <div className="session-details">
                  <div className="detail-item">
                    <i className="fas fa-globe"></i>
                    <span>{session.ipAddress}</span>
                  </div>
                  {session.location?.city && (
                    <div className="detail-item">
                      <i className="fas fa-map-marker-alt"></i>
                      <span>{session.location.city}, {session.location.country}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <i className="fas fa-clock"></i>
                    <span>Last active: {formatDate(session.lastActivity)}</span>
                  </div>
                </div>
              </div>
              <div className="session-actions">
                {!session.isCurrent ? (
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeviceLogout(session.id)}
                  >
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                ) : (
                  <span className="text-muted">You are using this device</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="sessions-footer">
        <Link to="/dashboard" className="btn btn-secondary">
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default MyDevices;