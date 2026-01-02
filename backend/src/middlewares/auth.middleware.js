import jwt from 'jsonwebtoken';
import Session from '../models/Session.model.js';
import { config } from '../config/environment.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    
    const session = await Session.findOne({
      sessionToken: decoded.sessionToken,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('userId');

    if (!session) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session' });
    }

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    req.user = session.userId;
    req.session = session;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

// ========================================
// backend/src/middlewares/admin.middleware.js
// ========================================
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }

  next();
};

// ========================================
// backend/src/middlewares/device.middleware.js
// ========================================
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

// ========================================
// backend/src/middlewares/rateLimiter.middleware.js
// ========================================
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false
});

export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: 'Too many accounts created. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// ========================================
// backend/src/middlewares/errorHandler.middleware.js
// ========================================
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};