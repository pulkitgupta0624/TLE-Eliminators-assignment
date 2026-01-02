import Session from '../models/Session.model.js';
import sessionService from '../services/session.service.js';

export const getDashboard = async (req, res) => {
  try {
    const activeSessions = await sessionService.getActiveSessionCount(req.user._id);

    res.json({
      success: true,
      data: {
        user: {
          name: req.user.name,
          email: req.user.email,
          maxDevices: req.user.maxDevices
        },
        activeSessions,
        availableSlots: req.user.maxDevices - activeSessions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading dashboard'
    });
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const sessions = await sessionService.getUserSessions(req.user._id);
    const currentSessionToken = req.session.sessionToken;

    const sessionsWithCurrent = sessions.map(session => ({
      id: session._id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      location: session.location,
      lastActivity: session.lastActivity,
      isCurrent: session.sessionToken === currentSessionToken
    }));

    res.json({
      success: true,
      sessions: sessionsWithCurrent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error loading sessions'
    });
  }
};

export const logoutDevice = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    await sessionService.invalidateSession(session.sessionToken);

    res.json({
      success: true,
      message: 'Device logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging out device'
    });
  }
};

export const logoutAllDevices = async (req, res) => {
  try {
    // 1. Invalidate all sessions for this user
    await sessionService.invalidateAllUserSessions(req.user._id);
    
    // 2. Clear the cookie for the current request too (log them out completely)
    res.clearCookie('token');

    res.json({
      success: true,
      message: 'Successfully logged out from all devices.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error performing force logout'
    });
  }
};