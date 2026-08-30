const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/userModel');

async function resetUserPassword() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db');
  console.log('[Mongo Reset] Connected to EventHall_db');

  const user = await User.findOne({ email: 'rahul.verma@student.svgu.edu.in' }).select('+password');
  if (user) {
    user.password = 'studentpassword123';
    await user.save();
    console.log('[Mongo Reset] Successfully reset password for rahul.verma@student.svgu.edu.in to studentpassword123');
  }

  process.exit(0);
}

resetUserPassword();
