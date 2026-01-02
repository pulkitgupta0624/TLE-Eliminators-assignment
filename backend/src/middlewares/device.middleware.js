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

    req.deviceId = deviceId;
    req.deviceInfo = deviceInfo;
    req.ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing device information'
    });
  }
};