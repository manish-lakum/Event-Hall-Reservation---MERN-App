const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/userModel');
const { Reservation } = require('../models/Reservation');

async function verifyMongoUsers() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db');
  console.log('[Mongo Check] Connected to EventHall_db');

  const count = await User.countDocuments({});
  console.log(`[Mongo Check] Total Users in SVGU collection: ${count}`);

  const users = await User.find({}).select('-password');
  console.log('[Mongo Check] User Documents Summary:');
  for (const u of users) {
    const resCount = await Reservation.countDocuments({ user: u._id });
    console.log(`- ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | Type: ${u.userType} | Active: ${u.isActive} | Reservations: ${resCount}`);
  }

  process.exit(0);
}

verifyMongoUsers();
