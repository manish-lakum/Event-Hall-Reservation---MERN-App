const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { Reservation } = require('../models/Reservation');
const { Hall } = require('../models/Hall');
const { HallBlock } = require('../models/HallBlock');
const User = require('../models/userModel');

async function verifyMongoReportData() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db');
  console.log('[Mongo Report Check] Connected to EventHall_db');

  const totalRes = await Reservation.countDocuments({});
  const approvedRes = await Reservation.countDocuments({ status: 'APPROVED' });
  const pendingRes = await Reservation.countDocuments({ status: 'PENDING' });
  const rejectedRes = await Reservation.countDocuments({ status: 'REJECTED' });
  const cancelledRes = await Reservation.countDocuments({ status: 'CANCELLED' });

  const totalHalls = await Hall.countDocuments({});
  const totalUsers = await User.countDocuments({});
  const totalBlocks = await HallBlock.countDocuments({});

  console.log(`[Mongo Report Check] Real Collection Counts:`);
  console.log(`- Total Reservations: ${totalRes}`);
  console.log(`- Approved: ${approvedRes} | Pending: ${pendingRes} | Rejected: ${rejectedRes} | Cancelled: ${cancelledRes}`);
  console.log(`- Total Halls: ${totalHalls} | Total Users: ${totalUsers} | Total Blocks: ${totalBlocks}`);

  process.exit(0);
}

verifyMongoReportData();
