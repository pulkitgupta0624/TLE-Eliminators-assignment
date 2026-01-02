import { useEffect, useState } from 'react';
import { getAllUsers, forceLogoutUser, toggleUserStatus } from '../../api/admin.api';
import { showAlert, formatDate } from '../../utils/helpers';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const response = await getAllUsers();
      setUsers(response.users);
    } catch (error) {
      showAlert('Error loading users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggleStatus = async (userId, currentStatus) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await toggleUserStatus(userId);
      showAlert(`User ${action}d successfully`, 'success');
      loadUsers(); // Refresh
    } catch (error) {
      showAlert('Error updating user status', 'error');
    }
  };

  const handleForceLogout = async (userId) => {
    if (!window.confirm('Are you sure you want to force logout this user from all devices?')) return;

    try {
      await forceLogoutUser(userId);
      showAlert('User logged out successfully', 'success');
      loadUsers(); // Refresh
    } catch (error) {
      showAlert('Error logging out user', 'error');
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="admin-users">
      <div className="page-header">
        <h1><i className="fas fa-users"></i> User Management</h1>
        <p className="subtitle">View and manage all registered users</p>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Active Sessions</th>
              <th>Max Devices</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No users found</td></tr>
            ) : (
              users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${user.activeSessionCount >= user.maxDevices ? 'badge-warning' : 'badge-info'}`}>
                      {user.activeSessionCount}
                    </span>
                  </td>
                  <td>{user.maxDevices}</td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td className="action-buttons">
                    <button 
                      className="btn btn-sm btn-warning"
                      onClick={() => handleToggleStatus(user._id, user.isActive)}
                    >
                      <i className={`fas fa-${user.isActive ? 'ban' : 'check'}`}></i>
                      {user.isActive ? ' Deactivate' : ' Activate'}
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleForceLogout(user._id)}
                    >
                      <i className="fas fa-sign-out-alt"></i> Force Logout
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;