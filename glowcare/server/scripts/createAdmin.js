import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/User.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/glowcare';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@glowcare.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function createAdmin() {
  if (!ADMIN_PASSWORD) {
    console.error('ADMIN_PASSWORD environment variable is required.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin account already exists: ${ADMIN_EMAIL}`);
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await User.create({
      name: 'GlowCare Admin',
      email: ADMIN_EMAIL,
      passwordHash,
      role: 'admin',
      isActive: true
    });

    console.log(`\n✅ Admin account created successfully!`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: (from ADMIN_PASSWORD env variable)\n`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
}

createAdmin();
