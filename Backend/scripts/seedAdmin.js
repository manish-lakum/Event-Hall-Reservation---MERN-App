const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/userModel');

// Load environment variables
dotenv.config();

const seedAdmin = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db';
    await mongoose.connect(mongoURI);
    console.log(`\x1b[32m%s\x1b[0m`, `[Seed Script] Connected to MongoDB`);

    const adminName = process.env.ADMIN_NAME || 'SVGU Campus Admin';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@svgu.edu.in').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'AdminPass@123';

    // Check if Admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`\x1b[33m%s\x1b[0m`, `[Seed Script] Admin account already exists: ${adminEmail}`);
      process.exit(0);
    }

    // Create New Admin
    const adminUser = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN',
      userType: 'FACULTY',
      department: 'Campus Estate & Facilities Management',
      collegeId: 'ADMIN-FAC-01',
      phone: '+91 98000 11223',
      isActive: true
    });

    console.log(`\x1b[32m%s\x1b[0m`, `[Seed Script] Default Admin Created Successfully!`);
    console.log(`\x1b[36m%s\x1b[0m`, `Email: ${adminUser.email}`);
    console.log(`\x1b[36m%s\x1b[0m`, `Role: ${adminUser.role}`);

    process.exit(0);
  } catch (error) {
    console.error(`\x1b[31m%s\x1b[0m`, `[Seed Error] Failed to seed admin user: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
