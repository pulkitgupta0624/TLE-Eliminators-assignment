import jwt from 'jsonwebtoken';
import geoip from 'geoip-lite';
import User from '../models/User.model.js';
import Session from '../models/Session.model.js';
import DeviceLog from '../models/DeviceLog.model.js';
import sessionService from '../services/session.service.js';
import ipRiskService from '../services/ipRisk.service.js';
import suspiciousActivityService from '../services/suspiciousActivity.service.js';
import { config } from '../config/environment.js';

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'user'
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      userId: user._id
    });
  } catch (error) {
    console.error("❌ SIGNUP ERROR DETAILED:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let { deviceId, deviceInfo, ipAddress } = req;

    // ipAddress = config.nodeEnv === 'development' ? '34.106.208.213' : realIp;
    // ipAddress = config.nodeEnv === 'development' ? '2409:40d4:1c:3e86:6566:ae19:8437:e9da' : realIp;


    const geo = geoip.lookup(ipAddress);
    const location = geo ? {
      country: geo.country,
      city: geo.city,
      latitude: geo.ll?.[0],
      longitude: geo.ll?.[1]
    } : {};

    const ipAnalysis = await ipRiskService.analyzeIp(ipAddress);

    let finalLocation = {};

    if (ipAnalysis?.location?.country) {
      finalLocation = ipAnalysis.location;
    } else {
      // 2. Fallback to local database (geoip-lite) if API fails
      console.log("⚠️ Using local GeoIP fallback");
      const geo = geoip.lookup(ipAddress);
      if (geo) {
        finalLocation = {
          country: geo.country,
          city: geo.city,
          latitude: geo.ll?.[0],
          longitude: geo.ll?.[1]
        };
      }
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Contact admin.'
      });
    }

    const activeSessions = await sessionService.getActiveSessionCount(user._id);
    const existingDeviceSession = await Session.findOne({
      userId: user._id,
      deviceId,
      isActive: true
    });

    if (!existingDeviceSession && activeSessions >= user.maxDevices) {
      await DeviceLog.create({
        userId: user._id,
        action: 'device_limit_exceeded',
        deviceId,
        deviceInfo,
        ipAddress,
        location,
        isSuspicious: true,
        suspicionReason: `Device limit exceeded (${activeSessions}/${user.maxDevices})`
      });

      return res.status(403).json({
        success: false,
        message: 'Device limit exceeded',
        maxDevices: user.maxDevices,
        activeSessions
      });
    }

    let session;
    if (existingDeviceSession) {
      session = existingDeviceSession;
      session.lastActivity = new Date();
      session.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      if (location.city) session.location = location;
      await session.save();
    } else {
      session = await sessionService.createSession(
        user._id,
        deviceId,
        deviceInfo,
        ipAddress,
        location
      );
    }

    // Check for suspicious activity
    const travelCheck = await suspiciousActivityService.checkImpossibleTravel(
      user._id,
      location,
      Date.now()
    );

    const isSuspicious = ipAnalysis.isRisky || travelCheck.isSuspicious;
    const suspicionReasons = [
      ipAnalysis.riskReason,
      travelCheck.reason
    ].filter(Boolean).join('; ');

    await DeviceLog.create({
      userId: user._id,
      action: 'login',
      deviceId,
      deviceInfo,
      ipAddress,
      location,
      isSuspicious,
      suspicionReason: isSuspicious ? suspicionReasons : null
    });

    const token = jwt.sign(
      { userId: user._id, sessionToken: session.sessionToken },
      config.jwtSecret,
      { expiresIn: config.jwtExpiry }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

export const logout = async (req, res) => {
  try {
    const sessionToken = req.session?.sessionToken;

    if (sessionToken) {
      await sessionService.invalidateSession(sessionToken);
    }

    res.clearCookie('token');
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        maxDevices: req.user.maxDevices
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
};

