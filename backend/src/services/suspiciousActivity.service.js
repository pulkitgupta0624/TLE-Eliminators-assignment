import DeviceLog from '../models/DeviceLog.model.js';
import Session from '../models/Session.model.js';
import { SUSPICIOUS_LOGIN_DISTANCE_KM, SUSPICIOUS_TIME_WINDOW_MINUTES } from '../config/constants.js';

class SuspiciousActivityService {
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  async checkImpossibleTravel(userId, newLocation, newTimestamp) {
    const recentLogin = await DeviceLog.findOne({
      userId,
      action: 'login',
      timestamp: {
        $gte: new Date(newTimestamp - SUSPICIOUS_TIME_WINDOW_MINUTES * 60 * 1000)
      },
      'location.latitude': { $exists: true },
      'location.longitude': { $exists: true }
    }).sort({ timestamp: -1 });

    if (!recentLogin || !newLocation?.latitude || !newLocation?.longitude) {
      return { isSuspicious: false };
    }

    const distance = this.calculateDistance(
      recentLogin.location.latitude,
      recentLogin.location.longitude,
      newLocation.latitude,
      newLocation.longitude
    );

    const timeDiffMinutes = (newTimestamp - recentLogin.timestamp) / (1000 * 60);
    const isSuspicious = distance > SUSPICIOUS_LOGIN_DISTANCE_KM && timeDiffMinutes < SUSPICIOUS_TIME_WINDOW_MINUTES;

    return {
      isSuspicious,
      distance,
      timeDiffMinutes,
      reason: isSuspicious 
        ? `Impossible travel: ${distance.toFixed(0)}km in ${timeDiffMinutes.toFixed(0)} minutes`
        : null
    };
  }

  async getSuspiciousActivitySummary() {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [totalSuspicious, recentSuspicious] = await Promise.all([
      DeviceLog.countDocuments({ 
        isSuspicious: true,
        timestamp: { $gte: last7Days }
      }),
      DeviceLog.find({ isSuspicious: true })
        .populate('userId', 'name email')
        .sort({ timestamp: -1 })
        .limit(20)
    ]);

    return { totalSuspicious, recentSuspicious };
  }
}

export default new SuspiciousActivityService();