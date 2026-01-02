import crypto from 'crypto';
import {UAParser} from 'ua-parser-js';

class DeviceFingerprintUtil {
  static generateFingerprint(deviceData) {
    const fingerprintString = [
      deviceData.userAgent || '',
      deviceData.language || '',
      deviceData.screenResolution || '',
      deviceData.timezone || '',
      deviceData.platform || ''
    ].join('|');

    return crypto
      .createHash('sha256')
      .update(fingerprintString)
      .digest('hex');
  }

  static extractDeviceInfo(req) {
    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent); // Parse the string
    const result = parser.getResult();

    return {
      userAgent,
      // Library gives clean output: "Edge", "Chrome", "Firefox"
      browser: result.browser.name || 'Unknown',
      // Library gives specific OS: "Windows 10", "Mac OS 13.5", "Android"
      os: `${result.os.name} ${result.os.version || ''}`.trim() || 'Unknown',
      // Library detects device type automatically
      deviceType: result.device.type === 'mobile' ? 'Mobile' : (result.device.type === 'tablet' ? 'Tablet' : 'Desktop'),
      ipAddress: this.getClientIP(req)
    };
  }

  // static detectBrowser(userAgent) {
  //   if (userAgent.includes('Chrome')) return 'Chrome';
  //   if (userAgent.includes('Firefox')) return 'Firefox';
  //   if (userAgent.includes('Safari')) return 'Safari';
  //   if (userAgent.includes('Edge')) return 'Edge';
  //   return 'Unknown';
  // }

  // static detectOS(userAgent) {
  //   if (userAgent.includes('Windows')) return 'Windows';
  //   if (userAgent.includes('Mac')) return 'MacOS';
  //   if (userAgent.includes('Linux')) return 'Linux';
  //   if (userAgent.includes('Android')) return 'Android';
  //   if (userAgent.includes('iOS')) return 'iOS';
  //   return 'Unknown';
  // }

  // static detectDeviceType(userAgent) {
  //   if (/Mobile|Android|iPhone/i.test(userAgent)) return 'Mobile';
  //   if (/Tablet|iPad/i.test(userAgent)) return 'Tablet';
  //   return 'Desktop';
  // }

  static getClientIP(req) {
    return (
      req.headers['x-forwarded-for']?.split(',')[0] ||
      req.ip ||
      'unknown'
    );
  }
}

export default DeviceFingerprintUtil;