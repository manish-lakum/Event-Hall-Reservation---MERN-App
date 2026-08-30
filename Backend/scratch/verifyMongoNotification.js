const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

require('../models/userModel');
const { Reservation } = require('../models/Reservation');
const { Hall } = require('../models/Hall');
const Notification = require('../models/Notification');

async function verifyNotifications() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db');
  console.log('[Mongo Check] Connected to EventHall_db');

  const count = await Notification.countDocuments({});
  console.log(`[Mongo Check] Total Notifications in collection: ${count}`);

  const sampleNotifs = await Notification.find({})
    .sort({ createdAt: -1 })
    .limit(4)
    .populate('recipient', 'name email role')
    .populate('reservation', 'eventTitle status')
    .populate('hall', 'hallName');

  console.log('[Mongo Check] Recent 4 Notification Documents:');
  console.log(JSON.stringify(sampleNotifs, null, 2));

  process.exit(0);
}

verifyNotifications();
