import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiry: '24h',
  vpnApiKey: process.env.VPN_API_KEY,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};
