import { useEffect, useState } from 'react';
import { getSuspiciousActivity, forceLogoutUser } from '../../api/admin.api';
import { showAlert, formatDate } from '../../utils/helpers';
import SuspiciousMap from '../../components/SuspiciousMap';

const AdminSuspicious = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const response = await getSuspiciousActivity();
        setLogs(response.recentSuspicious);
      } catch (error) {
        showAlert('Error loading suspicious activity', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadLogs();
  }, []);

  const handleForceLogout = async (userId) => {
    if (!window.confirm('Force logout this user from all devices?')) return;
    try {
      await forceLogoutUser(userId);
      showAlert('User logged out successfully', 'success');
    } catch (error) {
      showAlert('Error logging out user', 'error');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="admin-suspicious">
      <div className="page-header">
        <h1><i className="fas fa-exclamation-triangle"></i> Suspicious Activity</h1>
        <p className="subtitle">Monitor and review flagged user activities</p>
      </div>

      {logs.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <SuspiciousMap logs={logs} />
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-check-circle"></i>
          <h3>No Suspicious Activity</h3>
          <p>All user activities appear normal.</p>
        </div>
      ) : (
        <div className="suspicious-list">
          {logs.map(log => (
            <div key={log._id} className="suspicious-card">
              <div className="suspicious-header">
                <div className="user-info">
                  <i className="fas fa-user-circle"></i>
                  <div>
                    <h3>{log.userId.name}</h3>
                    <p>{log.userId.email}</p>
                  </div>
                </div>
                <span className="badge badge-danger">
                  <i className="fas fa-exclamation-triangle"></i> Suspicious
                </span>
              </div>
              
              <div className="suspicious-details">
                <div className="detail-row">
                  <span className="detail-label">Reason:</span>
                  <span className="detail-value text-danger">{log.suspicionReason}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Action:</span>
                  <span className="detail-value">{log.action}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">IP Address:</span>
                  <span className="detail-value">{log.ipAddress}</span>
                </div>
                {log.location?.city && (
                  <div className="detail-row">
                    <span className="detail-label">Location:</span>
                    <span className="detail-value">{log.location.city}, {log.location.country}</span>
                  </div>
                )}
                <div className="detail-row">
                  <span className="detail-label">Time:</span>
                  <span className="detail-value">{formatDate(log.timestamp)}</span>
                </div>
              </div>

              <div className="suspicious-actions">
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleForceLogout(log.userId._id)}
                >
                  <i className="fas fa-sign-out-alt"></i> Force Logout
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSuspicious;