import { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { formatDate, showAlert } from '../../utils/helpers';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: 'all',
        riskLevel: 'all',
        page: 1
    });
    const [pagination, setPagination] = useState({ total: 0, pages: 1 });

    // Debounce search to prevent too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters]);

    const fetchLogs = async () => {
        try {
            // Build query string
            const params = new URLSearchParams({
                page: filters.page,
                limit: 10,
                ...(filters.search && { search: filters.search }),
                ...(filters.type !== 'all' && { type: filters.type }),
                ...(filters.riskLevel !== 'all' && { riskLevel: filters.riskLevel })
            });

            const response = await apiClient.get(`/admin/logs?${params}`);
            setLogs(response.data.logs);
            setPagination(response.data.pagination);
        } catch (error) {
            showAlert('Failed to load logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        // 1. Construct query params from current filters
        const params = new URLSearchParams({
            ...(filters.search && { search: filters.search }),
            ...(filters.type !== 'all' && { type: filters.type }),
            ...(filters.riskLevel !== 'all' && { riskLevel: filters.riskLevel })
        });

        // 2. Trigger download by opening the URL
        // Note: Since the backend sets Content-Disposition: attachment, 
        // the browser will download the file instead of navigating away.
        window.location.href = `/api/admin/logs/export?${params.toString()}`;
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    return (
        <div className="admin-logs-page">
            <div className="page-header">
                <h1><i className="fas fa-history"></i> System Logs</h1>
                <p className="subtitle">Audit trail of all user activities</p>
            </div>

            {/* --- Filter Controls --- */}
            <div className="card mb-4">
                <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>

                    {/* Search Box */}
                    <div style={{ flex: 1, minWidth: '250px' }}>
                        <input
                            type="text"
                            placeholder="Search email, name or IP..."
                            className="form-control" // Use your existing input styles
                            style={{ width: '100%', padding: '0.6rem' }}
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                    </div>

                    {/* Action Filter */}
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        style={{ padding: '0.6rem' }}
                    >
                        <option value="all">All Actions</option>
                        <option value="login">Login</option>
                        <option value="logout">Logout</option>
                        <option value="device_limit_exceeded">Limit Exceeded</option>
                        <option value="force_logout">Force Logout</option>
                    </select>

                    {/* Risk Filter */}
                    <select
                        value={filters.riskLevel}
                        onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
                        style={{ padding: '0.6rem' }}
                    >
                        <option value="all">All Levels</option>
                        <option value="suspicious">Suspicious Only ⚠️</option>
                    </select>

                    <button
                        className="btn btn-success"
                        onClick={handleExport}
                        style={{ marginLeft: 'auto' }} // Pushes button to the right
                    >
                        <i className="fas fa-file-csv"></i> Export CSV
                    </button>
                </div>
            </div>

            {/* --- Logs Table --- */}
            <div className="table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Action</th>
                            <th>IP & Device</th>
                            <th>Location</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="text-center">Loading...</td></tr>
                        ) : logs.length === 0 ? (
                            <tr><td colSpan="6" className="text-center">No logs found</td></tr>
                        ) : (
                            logs.map(log => (
                                <tr key={log._id} style={log.isSuspicious ? { backgroundColor: '#fff5f5' } : {}}>
                                    <td>
                                        <strong>{log.userId?.name || 'Unknown'}</strong><br />
                                        <small className="text-muted">{log.userId?.email}</small>
                                    </td>
                                    <td>
                                        <span className="badge badge-info">{log.action.toUpperCase()}</span>
                                    </td>
                                    <td>
                                        <div>{log.ipAddress}</div>
                                        <small className="text-muted">
                                            {log.deviceInfo?.browser} on {log.deviceInfo?.os}
                                        </small>
                                    </td>
                                    <td>{log.location?.city || 'N/A'}, {log.location?.country || 'N/A'}</td>
                                    <td>{formatDate(log.timestamp)}</td>
                                    <td>
                                        {log.isSuspicious ? (
                                            <span className="badge badge-danger">Suspicious</span>
                                        ) : (
                                            <span className="badge badge-success">Normal</span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- Simple Pagination --- */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button
                    className="btn btn-secondary"
                    disabled={filters.page === 1}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                >
                    Previous
                </button>
                <span style={{ alignSelf: 'center' }}>Page {filters.page} of {pagination.pages}</span>
                <button
                    className="btn btn-secondary"
                    disabled={filters.page >= pagination.pages}
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default AdminLogs;