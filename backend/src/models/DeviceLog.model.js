import mongoose from 'mongoose';

const deviceLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    enum: ['login', 'logout', 'device_limit_exceeded', 'force_logout'],
    required: true
  },
  deviceId: {
    type: String,
    required: true
  },
  deviceInfo: {
    browser: String,
    os: String,
    deviceType: String
  },
  ipAddress: String,
  location: {
    country: String,
    city: String,
    latitude: Number,
    longitude: Number
  },
  isSuspicious: {
    type: Boolean,
    default: false,
    index: true
  },
  suspicionReason: String,
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

deviceLogSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('DeviceLog', deviceLogSchema);