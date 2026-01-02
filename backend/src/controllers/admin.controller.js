import User from '../models/User.model.js';
import DeviceLog from '../models/DeviceLog.model.js';
import suspiciousActivityService from '../services/suspiciousActivity.service.js';
import sessionService from '../services/session.service.js';
import Session from '../models/Session.model.js';

export const getDashboard = async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalSessions, suspiciousCount] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      Session.countDocuments({ isActive: true, expiresAt: { $gt: new Date() } }),
      DeviceLog.countDocuments({ isSuspicious: true })
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalSessions,
        suspiciousCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard'
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

    const usersWithSessions = await Promise.all(
      users.map(async (user) => {
        const sessionCount = await sessionService.getActiveSessionCount(user._id);
        return {
          ...user.toObject(),
          activeSessionCount: sessionCount
        };
      })
    );

    res.json({
      success: true,
      users: usersWithSessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading users'
    });
  }
};

export const getSuspiciousActivity = async (req, res) => {
  try {
    const summary = await suspiciousActivityService.getSuspiciousActivitySummary();

    res.json({
      success: true,
      ...summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading suspicious activity'
    });
  }
};

export const getAllSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ isActive: true, expiresAt: { $gt: new Date() } })
      .populate('userId', 'name email')
      .sort({ lastActivity: -1 });

    res.json({
      success: true,
      sessions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading sessions'
    });
  }
};

export const forceLogoutUser = async (req, res) => {
  try {
    const { userId } = req.params;

    await sessionService.invalidateAllUserSessions(userId);

    res.json({
      success: true,
      message: 'User logged out from all devices'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out user'
    });
  }
};

export const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    if (!user.isActive) {
      await sessionService.invalidateAllUserSessions(userId);
    }

    res.json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status'
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const [user, activeSessions, logs] = await Promise.all([
      User.findById(userId),
      Session.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() }
      }),
      DeviceLog.find({ userId })
        .sort({ timestamp: -1 })
        .limit(10)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user,
      activeSessions,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user details'
    });
  }
};

export const getSystemLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, type, riskLevel } = req.query;
    
    // Build the query object dynamically
    const query = {};

    // 1. Search by User Name, Email, or IP Address
    if (search) {
      // First find users matching the name/email to get their IDs
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);

      query.$or = [
        { userId: { $in: userIds } },        // Match by User ID found above
        { ipAddress: { $regex: search, $options: 'i' } } // OR Match by IP directly
      ];
    }

    // 2. Filter by Action Type (login, logout, etc.)
    if (type && type !== 'all') {
      query.action = type;
    }

    // 3. Filter by Risk Level (Suspicious only)
    if (riskLevel === 'suspicious') {
      query.isSuspicious = true;
    }

    // Execute Query with Pagination
    const logs = await DeviceLog.find(query)
      .populate('userId', 'name email role') // Get user details
      .sort({ timestamp: -1 })               // Newest first
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DeviceLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching system logs'
    });
  }
};

export const exportSystemLogs = async (req, res) => {
  try {
    const { search, type, riskLevel } = req.query;
    
    // 1. Re-use the exact same query logic as getSystemLogs
    const query = {};

    if (search) {
      const users = await User.find({
        $or: [
          { email: { $regex: search, $options: 'i' } },
          { name: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const userIds = users.map(u => u._id);
      query.$or = [
        { userId: { $in: userIds } },
        { ipAddress: { $regex: search, $options: 'i' } }
      ];
    }

    if (type && type !== 'all') {
      query.action = type;
    }

    if (riskLevel === 'suspicious') {
      query.isSuspicious = true;
    }

    // 2. Fetch ALL matching logs (No limit/skip)
    const logs = await DeviceLog.find(query)
      .populate('userId', 'name email')
      .sort({ timestamp: -1 });

    // 3. Define CSV Headers
    const headers = ['Timestamp', 'User Name', 'User Email', 'Action', 'Risk Level', 'IP Address', 'Device', 'Location', 'Details'];
    
    // 4. Convert Data to CSV Rows
    const csvRows = logs.map(log => {
      // Helper to escape commas in data (to prevent breaking CSV format)
      const escape = (text) => `"${(text || '').toString().replace(/"/g, '""')}"`;

      return [
        `"${new Date(log.timestamp).toLocaleString()}"`,
        escape(log.userId?.name || 'Unknown'),
        escape(log.userId?.email || 'N/A'),
        escape(log.action.toUpperCase()),
        log.isSuspicious ? 'SUSPICIOUS' : 'Normal',
        escape(log.ipAddress),
        escape(`${log.deviceInfo?.browser} on ${log.deviceInfo?.os}`),
        escape(log.location?.city ? `${log.location.city}, ${log.location.country}` : 'Unknown'),
        escape(log.suspicionReason || '')
      ].join(',');
    });

    // 5. Combine Header and Rows
    const csvString = [headers.join(','), ...csvRows].join('\n');

    // 6. Send as Download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=system_logs.csv');
    res.status(200).send(csvString);

  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ success: false, message: 'Error exporting logs' });
  }
};