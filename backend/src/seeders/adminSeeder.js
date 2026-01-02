import mongoose from 'mongoose';
import User from '../models/User.model.js';
import { config } from '../config/environment.js';

const adminData = {
  name: 'Admin',
  email: 'admin@sessionmgmt.com',
  password: 'admin123',
  role: 'admin',
  isActive: true,
  maxDevices: 5
};

async function seedAdmin() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('⚠️ Admin account already exists');
      console.log('Email:', adminData.email);
      process.exit(0);
    }

    await User.create(adminData);

    console.log('✅ Admin account created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️ Please change this password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();