import crypto from 'crypto';
import Session from '../models/Session.model.js';
import DeviceLog from '../models/DeviceLog.model.js';
import { SESSION_EXPIRY_HOURS } from '../config/constants.js';

class SessionService {
  async createSession(userId, deviceId, deviceInfo, ipAddress, location = {}) {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_HOURS * 60 * 60 * 1000);

    const session = await Session.create({
      userId,
      deviceId,
      deviceInfo,
      sessionToken,
      ipAddress,
      location,
      expiresAt,
      isActive: true
    });

    return session;
  }

  async getActiveSessionCount(userId) {
    return await Session.countDocuments({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
  }

  async getUserSessions(userId) {
    return await Session.find({
      userId,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastActivity: -1 });
  }

  async invalidateSession(sessionToken) {
    const session = await Session.findOne({ sessionToken });
    
    if (session) {
      session.isActive = false;
      await session.save();

      await DeviceLog.create({
        userId: session.userId,
        action: 'logout',
        deviceId: session.deviceId,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress
      });
    }
  }

  async invalidateAllUserSessions(userId) {
    await Session.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    await DeviceLog.create({
      userId,
      action: 'force_logout',
      deviceId: 'all',
      deviceInfo: { note: 'All devices logged out' }
    });
  }

  async cleanupExpiredSessions() {
    const result = await Session.deleteMany({
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ]
    });

    console.log(`🧹 Cleaned up ${result.deletedCount} expired sessions`);
    return result.deletedCount;
  }
}

export default new SessionService();