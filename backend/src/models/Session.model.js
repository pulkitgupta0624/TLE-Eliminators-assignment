import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  deviceId: {
    type: String,
    required: true,
    index: true
  },
  deviceInfo: {
    browser: String,
    os: String,
    deviceType: String,
    screenResolution: String,
    timezone: String,
    language: String
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, { timestamps: true });

// Compound indexes
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ deviceId: 1, userId: 1 });
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('Session', sessionSchema);