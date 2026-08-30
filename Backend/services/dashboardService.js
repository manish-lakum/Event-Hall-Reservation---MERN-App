const { Reservation } = require('../models/Reservation');
const { Hall } = require('../models/Hall');
const { HallBlock } = require('../models/HallBlock');
const User = require('../models/userModel');

/**
 * Fetch Real-time User Dashboard Data (Isolated for logged-in user)
 */
const getUserDashboardData = async (userId) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Calculate Counts
  const totalReservations = await Reservation.countDocuments({ user: userId });
  const pendingReservations = await Reservation.countDocuments({ user: userId, status: 'PENDING' });
  const approvedReservations = await Reservation.countDocuments({ user: userId, status: 'APPROVED' });
  const cancelledReservations = await Reservation.countDocuments({ user: userId, status: 'CANCELLED' });
  const upcomingReservations = await Reservation.countDocuments({
    user: userId,
    status: 'APPROVED',
    eventDate: { $gte: todayStr }
  });

  // 2. Fetch Nearest Upcoming Approved Reservation
  const upcomingReservation = await Reservation.findOne({
    user: userId,
    status: 'APPROVED',
    eventDate: { $gte: todayStr }
  })
    .sort({ eventDate: 1, startTime: 1 })
    .populate('hall', 'hallName hallType location capacity image openingTime closingTime');

  // 3. Fetch Recent 5 Reservations
  const recentReservations = await Reservation.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('hall', 'hallName hallType location capacity image');

  return {
    stats: {
      totalReservations,
      pendingReservations,
      approvedReservations,
      cancelledReservations,
      upcomingReservations
    },
    upcomingReservation: upcomingReservation || null,
    recentReservations
  };
};

/**
 * Fetch Real-time System-wide Admin Dashboard Data
 */
const getAdminDashboardData = async () => {
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Hall Statistics
  const totalHalls = await Hall.countDocuments({});
  const activeHalls = await Hall.countDocuments({ isActive: true });
  const inactiveHalls = await Hall.countDocuments({ isActive: false });

  // 2. User Statistics (Excluding ADMIN)
  const totalUsers = await User.countDocuments({ role: 'USER' });
  const activeUsers = await User.countDocuments({ role: 'USER', isActive: true });
  const inactiveUsers = await User.countDocuments({ role: 'USER', isActive: false });

  const students = await User.countDocuments({ role: 'USER', userType: 'STUDENT' });
  const faculty = await User.countDocuments({ role: 'USER', userType: 'FACULTY' });
  const staff = await User.countDocuments({ role: 'USER', userType: 'STAFF' });
  const clubs = await User.countDocuments({ role: 'USER', userType: 'CLUB' });
  const departments = await User.countDocuments({ role: 'USER', userType: 'DEPARTMENT' });

  // 3. Reservation Statistics
  const totalReservations = await Reservation.countDocuments({});
  const pendingReservations = await Reservation.countDocuments({ status: 'PENDING' });
  const approvedReservations = await Reservation.countDocuments({ status: 'APPROVED' });
  const rejectedReservations = await Reservation.countDocuments({ status: 'REJECTED' });
  const cancelledReservations = await Reservation.countDocuments({ status: 'CANCELLED' });
  const completedReservations = await Reservation.countDocuments({ status: 'COMPLETED' });

  const todayReservations = await Reservation.countDocuments({
    eventDate: todayStr,
    status: 'APPROVED'
  });
  const upcomingReservations = await Reservation.countDocuments({
    eventDate: { $gte: todayStr },
    status: 'APPROVED'
  });

  // 4. Pending Reservation Requests (Latest 5)
  const pendingRequests = await Reservation.find({ status: 'PENDING' })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email userType department collegeId phone')
    .populate('hall', 'hallName hallType location capacity image');

  // 5. Today's Hall Schedule (Approved Reservations + Active Maintenance Blocks)
  const todayRes = await Reservation.find({
    eventDate: todayStr,
    status: 'APPROVED'
  })
    .populate('user', 'name department')
    .populate('hall', 'hallName location');

  const todayBlocks = await HallBlock.find({
    isActive: true,
    startDate: { $lte: todayStr },
    endDate: { $gte: todayStr }
  }).populate('hall', 'hallName location');

  const formattedResSchedule = todayRes.map(r => ({
    _id: r._id,
    slotType: 'RESERVATION',
    hallName: r.hall?.hallName || 'Hall',
    eventTitle: r.eventTitle,
    startTime: r.startTime,
    endTime: r.endTime,
    requestedBy: r.user?.name || 'User',
    department: r.user?.department || 'Department',
    status: r.status
  }));

  const formattedBlockSchedule = todayBlocks.map(b => ({
    _id: b._id,
    slotType: 'BLOCK',
    hallName: b.hall?.hallName || 'Hall',
    eventTitle: `[Maintenance] ${b.reason}`,
    startTime: b.startTime,
    endTime: b.endTime,
    requestedBy: 'Campus Estate Admin',
    status: 'BLOCKED'
  }));

  const todaySchedule = [...formattedResSchedule, ...formattedBlockSchedule].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );

  // 6. Recent System Activity Timeline (Latest 8 events)
  const recentResList = await Reservation.find({})
    .sort({ updatedAt: -1 })
    .limit(8)
    .populate('user', 'name')
    .populate('hall', 'hallName');

  const recentActivity = recentResList.map(r => {
    let activityType = 'RESERVATION_SUBMITTED';
    let message = `${r.user?.name || 'User'} requested reservation for '${r.eventTitle}' at ${r.hall?.hallName || 'Hall'}`;

    if (r.status === 'APPROVED') {
      activityType = 'RESERVATION_APPROVED';
      message = `Reservation '${r.eventTitle}' approved for ${r.hall?.hallName || 'Hall'}`;
    } else if (r.status === 'REJECTED') {
      activityType = 'RESERVATION_REJECTED';
      message = `Reservation '${r.eventTitle}' was rejected`;
    } else if (r.status === 'CANCELLED') {
      activityType = 'RESERVATION_CANCELLED';
      message = `Reservation '${r.eventTitle}' was cancelled by user`;
    }

    return {
      type: activityType,
      message,
      createdAt: r.updatedAt || r.createdAt
    };
  });

  // 7. Monthly Reservation Statistics (Last 6 Months Aggregation)
  const monthlyStats = await getMonthlyReservationStats();

  // 8. Hall Usage Statistics (Top 5 Most Used Halls)
  const hallUsageStats = await getHallUsageStats();

  return {
    hallStats: {
      totalHalls,
      activeHalls,
      inactiveHalls
    },
    userStats: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      byUserType: {
        students,
        faculty,
        staff,
        clubs,
        departments
      }
    },
    reservationStats: {
      totalReservations,
      pendingReservations,
      approvedReservations,
      rejectedReservations,
      cancelledReservations,
      completedReservations,
      todayReservations,
      upcomingReservations
    },
    pendingRequests,
    todaySchedule,
    recentActivity,
    monthlyStats,
    hallUsageStats
  };
};

/**
 * Helper: Aggregate Last 6 Months Reservation Counts
 */
const getMonthlyReservationStats = async () => {
  const months = [];
  const now = new Date();

  // Generate array for last 6 months (YYYY-MM)
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = d.toISOString().slice(0, 7); // e.g. "2026-08"
    const monthLabel = d.toLocaleString('en-US', { month: 'short' });
    months.push({ monthKey: monthStr, month: monthLabel, total: 0, approved: 0, pending: 0, rejected: 0, cancelled: 0 });
  }

  const startDateStr = months[0].monthKey + '-01';

  const aggregation = await Reservation.aggregate([
    { $match: { eventDate: { $gte: startDateStr } } },
    {
      $group: {
        _id: {
          month: { $substr: ['$eventDate', 0, 7] },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    }
  ]);

  // Merge aggregation results into months template
  const map = {};
  months.forEach(m => {
    map[m.monthKey] = { ...m };
  });

  aggregation.forEach(item => {
    const monthKey = item._id.month;
    const status = item._id.status;
    if (map[monthKey]) {
      map[monthKey].total += item.count;
      if (status === 'APPROVED') map[monthKey].approved += item.count;
      if (status === 'PENDING') map[monthKey].pending += item.count;
      if (status === 'REJECTED') map[monthKey].rejected += item.count;
      if (status === 'CANCELLED') map[monthKey].cancelled += item.count;
    }
  });

  return Object.values(map);
};

/**
 * Helper: Aggregate Top 5 Halls by Approved Reservations Count
 */
const getHallUsageStats = async () => {
  const allHalls = await Hall.find({}).select('hallName capacity hallType');

  const usageAggregation = await Reservation.aggregate([
    {
      $group: {
        _id: '$hall',
        totalReservations: { $sum: 1 },
        approvedReservations: {
          $sum: { $cond: [{ $eq: ['$status', 'APPROVED'] }, 1, 0] }
        }
      }
    },
    { $sort: { approvedReservations: -1, totalReservations: -1 } },
    { $limit: 5 }
  ]);

  const usageStats = [];

  for (const hallItem of allHalls) {
    const agg = usageAggregation.find(u => u._id.toString() === hallItem._id.toString());
    usageStats.push({
      hallId: hallItem._id,
      hallName: hallItem.hallName,
      totalReservations: agg ? agg.totalReservations : 0,
      approvedReservations: agg ? agg.approvedReservations : 0
    });
  }

  // Sort highest approved count first
  usageStats.sort((a, b) => b.approvedReservations - a.approvedReservations || b.totalReservations - a.totalReservations);

  return usageStats.slice(0, 5);
};

module.exports = {
  getUserDashboardData,
  getAdminDashboardData
};
