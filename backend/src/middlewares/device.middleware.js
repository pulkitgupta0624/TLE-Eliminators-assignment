import crypto from 'crypto';

export const extractDeviceInfo = (req, res, next) => {
  try {
    const deviceFingerprint = req.body.deviceFingerprint || req.headers['x-device-fingerprint'];
    
    if (!deviceFingerprint) {
      return res.status(400).json({
        success: false,
        message: 'Device fingerprint missing'
      });
    }

    const deviceInfo = {
      browser: req.body.browser || 'Unknown',
      os: req.body.os || 'Unknown',
      deviceType: req.body.deviceType || 'Desktop',
      screenResolution: req.body.screenResolution || 'Unknown',
      timezone: req.body.timezone || 'Unknown',
      language: req.body.language || 'en'
    };

    const deviceId = crypto
      .createHash('sha256')
      .update(deviceFingerprint + JSON.stringify(deviceInfo))
      .digest('hex');

    let ip = req.headers['x-forwarded-for'] || req.ip || req.connection.remoteAddress;

    // If multiple IPs are present (e.g., "ClientIP, ProxyIP"), grab the first one
    if (ip && typeof ip === 'string' && ip.includes(',')) {
      ip = ip.split(',')[0].trim();
    }

    req.deviceId = deviceId; // (defined earlier in your code)
    req.deviceInfo = deviceInfo; // (defined earlier in your code)
    req.ipAddress = ip; // ✅ Now this will be the Public IP

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing device information'
    });
  }
};