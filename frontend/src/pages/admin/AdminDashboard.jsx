import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminDashboard } from '../../api/admin.api';
import { showAlert } from '../../utils/helpers';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await getAdminDashboard();
        setStats(response.stats);
      } catch (error) {
        showAlert('Error loading dashboard', 'error');
      }
    };
    loadStats();
  }, []);

  if (!stats) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1><i className="fas fa-tachometer-alt"></i> Admin Dashboard</h1>
        <p className="subtitle">System Overview & Monitoring</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-card-primary">
          <div className="stat-icon"><i className="fas fa-users"></i></div>
          <div className="stat-content">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card stat-card-success">
          <div className="stat-icon"><i className="fas fa-user-check"></i></div>
          <div className="stat-content">
            <h3>{stats.activeUsers}</h3>
            <p>Active Users</p>
          </div>
        </div>

        <div className="stat-card stat-card-info">
          <div className="stat-icon"><i className="fas fa-desktop"></i></div>
          <div className="stat-content">
            <h3>{stats.totalSessions}</h3>
            <p>Active Sessions</p>
          </div>
        </div>

        <div className="stat-card stat-card-danger">
          <div className="stat-icon"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="stat-content">
            <h3>{stats.suspiciousCount}</h3>
            <p>Suspicious Activities</p>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="card">
          <div className="card-header">
            <h2><i className="fas fa-chart-line"></i> Quick Actions</h2>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <Link to="/admin/users" className="action-btn">
                <i className="fas fa-users"></i>
                <span>Manage Users</span>
              </Link>
              <Link to="/admin/suspicious" className="action-btn">
                <i className="fas fa-exclamation-triangle"></i>
                <span>View Suspicious Activity</span>
              </Link>
              <Link to="/admin/sessions" className="action-btn">
                <i className="fas fa-desktop"></i>
                <span>All Sessions</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;