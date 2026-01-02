import mongoose from 'mongoose';
import { config } from './environment.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};