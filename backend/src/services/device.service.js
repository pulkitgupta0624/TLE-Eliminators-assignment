import crypto from 'crypto';

class DeviceService {
  generateDeviceFingerprint(deviceData) {
    const fingerprintString = [
      deviceData.userAgent,
      deviceData.language,
      deviceData.screenResolution,
      deviceData.timezone,
      deviceData.platform
    ].join('|');

    return crypto
      .createHash('sha256')
      .update(fingerprintString)
      .digest('hex');
  }

  getDeviceNickname(deviceInfo) {
    return `${deviceInfo.browser} on ${deviceInfo.os}`;
  }
}

export default new DeviceService();