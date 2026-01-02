import { useEffect, useState } from 'react';
import { getAllSessions } from '../../api/admin.api';
import { showAlert, formatDate, getDeviceIcon } from '../../utils/helpers';

const AdminSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await getAllSessions();
        setSessions(response.sessions);
      } catch (error) {
        showAlert('Error loading sessions', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="admin-sessions">
      <div className="page-header">
        <h1><i className="fas fa-desktop"></i> All Active Sessions</h1>
        <p className="subtitle">Monitor all user sessions across the platform</p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Device</th>
              <th>IP Address</th>
              <th>Location</th>
              <th>Last Activity</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr><td colSpan="5" className="text-center">No active sessions</td></tr>
            ) : (
              sessions.map(session => (
                <tr key={session._id}>
                  <td>
                    <div className="user-cell">
                      <strong>{session.userId.name}</strong>
                      <small>{session.userId.email}</small>
                    </div>
                  </td>
                  <td>
                    <div className="device-cell">
                      <i className={`fas ${getDeviceIcon(session.deviceInfo.deviceType)}`}></i>
                      <span>{session.deviceInfo.browser} / {session.deviceInfo.os}</span>
                    </div>
                  </td>
                  <td>{session.ipAddress}</td>
                  <td>
                    {session.location?.country
                      ? (session.location.city
                        ? `${session.location.city}, ${session.location.country}`
                        : session.location.country)
                      : 'N/A'
                    }
                  </td>
                  <td>{formatDate(session.lastActivity)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSessions;