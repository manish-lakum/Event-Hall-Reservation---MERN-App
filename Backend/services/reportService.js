const mongoose = require('mongoose');
const { Reservation, ALLOWED_EVENT_TYPES, ALLOWED_RESERVATION_STATUSES } = require('../models/Reservation');
const { Hall } = require('../models/Hall');
const { HallBlock } = require('../models/HallBlock');
const User = require('../models/userModel');

const ALLOWED_USER_TYPES = ['STUDENT', 'FACULTY', 'STAFF', 'CLUB', 'DEPARTMENT'];

/**
 * Helper: Parse time "HH:mm" into total minutes
 */
const timeToMinutes = (timeStr) => {
  if (!timeStr || typeof timeStr !== 'string') return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
};

/**
 * Helper: Calculate duration in hours between startTime and endTime
 */
const calculateDurationHours = (startTime, endTime) => {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);
  if (endMins <= startMins) return 0;
  return Number(((endMins - startMins) / 60).toFixed(2));
};

/**
 * Helper: Format Date object to YYYY-MM-DD
 */
const formatDateLocal = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Helper: Build Base Match Query for Reservation Filters
 */
const buildReservationMatchQuery = async (filters = {}) => {
  const { startDate, endDate, hallId, status, eventType, userType, department } = filters;
  const query = {};

  // Date Range Validation & Filter (against eventDate)
  if (startDate && endDate) {
    if (new Date(endDate) < new Date(startDate)) {
      throw new Error('endDate cannot be before startDate');
    }
    query.eventDate = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.eventDate = { $gte: startDate };
  } else if (endDate) {
    query.eventDate = { $lte: endDate };
  }

  // Hall Filter
  if (hallId) {
    if (!mongoose.Types.ObjectId.isValid(hallId)) {
      throw new Error('Invalid Hall ID format');
    }
    const hallExists = await Hall.findById(hallId);
    if (!hallExists) {
      const err = new Error('Hall not found');
      err.statusCode = 404;
      throw err;
    }
    query.hall = new mongoose.Types.ObjectId(hallId);
  }

  // Status Filter
  if (status) {
    const formattedStatus = String(status).toUpperCase();
    if (!ALLOWED_RESERVATION_STATUSES.includes(formattedStatus)) {
      throw new Error(`Invalid status filter. Allowed: ${ALLOWED_RESERVATION_STATUSES.join(', ')}`);
    }
    query.status = formattedStatus;
  }

  // Event Type Filter
  if (eventType) {
    const formattedEventType = String(eventType).toUpperCase();
    if (!ALLOWED_EVENT_TYPES.includes(formattedEventType)) {
      throw new Error(`Invalid eventType filter. Allowed: ${ALLOWED_EVENT_TYPES.join(', ')}`);
    }
    query.eventType = formattedEventType;
  }

  // User Type or Department Filters (via User collection matching)
  if (userType || department) {
    const userQuery = {};
    if (userType) {
      const formattedUserType = String(userType).toUpperCase();
      if (!ALLOWED_USER_TYPES.includes(formattedUserType)) {
        throw new Error(`Invalid userType filter. Allowed: ${ALLOWED_USER_TYPES.join(', ')}`);
      }
      userQuery.userType = formattedUserType;
    }
    if (department) {
      userQuery.department = new RegExp(department.trim(), 'i');
    }
    const matchingUsers = await User.find(userQuery).select('_id');
    const userIds = matchingUsers.map(u => u._id);
    query.user = { $in: userIds };
  }

  return query;
};

/**
 * 1. GET Summary Report
 */
const getSummaryReport = async (filters = {}) => {
  const query = await buildReservationMatchQuery(filters);

  // Reservation Counts
  const totalReservations = await Reservation.countDocuments(query);
  const pendingReservations = await Reservation.countDocuments({ ...query, status: 'PENDING' });
  const approvedReservations = await Reservation.countDocuments({ ...query, status: 'APPROVED' });
  const rejectedReservations = await Reservation.countDocuments({ ...query, status: 'REJECTED' });
  const cancelledReservations = await Reservation.countDocuments({ ...query, status: 'CANCELLED' });
  const completedReservations = await Reservation.countDocuments({ ...query, status: 'COMPLETED' });

  // Rates
  const approvalRate = totalReservations > 0 ? Number(((approvedReservations / totalReservations) * 100).toFixed(2)) : 0;
  const rejectionRate = totalReservations > 0 ? Number(((rejectedReservations / totalReservations) * 100).toFixed(2)) : 0;
  const cancellationRate = totalReservations > 0 ? Number(((cancelledReservations / totalReservations) * 100).toFixed(2)) : 0;

  // Hall Statistics
  const totalHalls = await Hall.countDocuments({});
  const activeHalls = await Hall.countDocuments({ isActive: true });
  const inactiveHalls = await Hall.countDocuments({ isActive: false });

  // User Statistics
  const totalUsers = await User.countDocuments({});

  // Block Statistics
  const totalBlocks = await HallBlock.countDocuments({});
  const activeBlocks = await HallBlock.countDocuments({ status: 'ACTIVE' });
  const blocksByReasonAgg = await HallBlock.aggregate([
    { $group: { _id: '$reason', count: { $sum: 1 } } }
  ]);
  const blocksByReason = blocksByReasonAgg.map(b => ({ reason: b._id, count: b.count }));

  // Upcoming Approved Reservations (Date >= Today)
  const todayStr = formatDateLocal(new Date());
  const upcomingReservations = await Reservation.countDocuments({
    ...query,
    status: 'APPROVED',
    eventDate: { $gte: todayStr }
  });

  return {
    totalReservations,
    pendingReservations,
    approvedReservations,
    rejectedReservations,
    cancelledReservations,
    completedReservations,
    approvalRate,
    rejectionRate,
    cancellationRate,
    totalHalls,
    activeHalls,
    inactiveHalls,
    totalUsers,
    totalBlocks,
    activeBlocks,
    blocksByReason,
    upcomingReservations
  };
};

/**
 * 2. GET Reservation Report (Aggregated Statistics + Distribution)
 */
const getReservationReport = async (filters = {}) => {
  const query = await buildReservationMatchQuery(filters);

  const total = await Reservation.countDocuments(query);
  const pending = await Reservation.countDocuments({ ...query, status: 'PENDING' });
  const approved = await Reservation.countDocuments({ ...query, status: 'APPROVED' });
  const rejected = await Reservation.countDocuments({ ...query, status: 'REJECTED' });
  const cancelled = await Reservation.countDocuments({ ...query, status: 'CANCELLED' });
  const completed = await Reservation.countDocuments({ ...query, status: 'COMPLETED' });

  const statusDistribution = {
    PENDING: pending,
    APPROVED: approved,
    REJECTED: rejected,
    CANCELLED: cancelled,
    COMPLETED: completed
  };

  const approvalRate = total > 0 ? Number(((approved / total) * 100).toFixed(2)) : 0;
  const rejectionRate = total > 0 ? Number(((rejected / total) * 100).toFixed(2)) : 0;
  const cancellationRate = total > 0 ? Number(((cancelled / total) * 100).toFixed(2)) : 0;

  // Event Type Distribution
  const eventTypeAgg = await Reservation.aggregate([
    { $match: query },
    { $group: { _id: '$eventType', count: { $sum: 1 } } }
  ]);
  const eventTypeDistribution = eventTypeAgg.map(e => ({ eventType: e._id, count: e.count }));

  // Daily Booking Requests Trend (createdAt date)
  const dailyTrendAgg = await Reservation.aggregate([
    { $match: query },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);
  const dailyRequestTrend = dailyTrendAgg.map(d => ({ date: d._id, count: d.count }));

  return {
    totalReservations: total,
    statusDistribution,
    rates: {
      approvalRate,
      rejectionRate,
      cancellationRate
    },
    eventTypeDistribution,
    dailyRequestTrend
  };
};

/**
 * 2b. GET Raw Reservation Report Table List
 */
const getReservationListReport = async (filters = {}, options = {}) => {
  const query = await buildReservationMatchQuery(filters);
  const { page = 1, limit = 10, sort = 'eventDate_desc' } = options;

  let sortOption = { eventDate: -1, startTime: -1 };
  if (sort === 'eventDate_asc') sortOption = { eventDate: 1, startTime: 1 };
  else if (sort === 'createdAt_desc') sortOption = { createdAt: -1 };
  else if (sort === 'createdAt_asc') sortOption = { createdAt: 1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Reservation.countDocuments(query);
  const reservations = await Reservation.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .populate('user', 'name email userType department')
    .populate('hall', 'hallName location hallType capacity');

  const list = reservations.map(r => ({
    reservationId: r._id,
    eventTitle: r.eventTitle,
    eventType: r.eventType,
    eventDate: r.eventDate,
    startTime: r.startTime,
    endTime: r.endTime,
    status: r.status,
    userName: r.user?.name || 'N/A',
    userType: r.user?.userType || 'N/A',
    department: r.user?.department || 'Not Specified',
    hallName: r.hall?.hallName || 'N/A',
    createdAt: r.createdAt
  }));

  return {
    reservations: list,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * 3. GET Hall Usage Report
 */
const getHallUsageReport = async (filters = {}, limit) => {
  const query = await buildReservationMatchQuery(filters);

  // Fetch all halls
  const halls = await Hall.find({}).sort({ hallName: 1 });

  const hallStats = [];

  for (const hall of halls) {
    const hallQuery = { ...query, hall: hall._id };

    const totalReservations = await Reservation.countDocuments(hallQuery);
    const approvedReservations = await Reservation.countDocuments({ ...hallQuery, status: 'APPROVED' });
    const pendingReservations = await Reservation.countDocuments({ ...hallQuery, status: 'PENDING' });
    const rejectedReservations = await Reservation.countDocuments({ ...hallQuery, status: 'REJECTED' });
    const cancelledReservations = await Reservation.countDocuments({ ...hallQuery, status: 'CANCELLED' });

    // Calculate booked hours from APPROVED reservations
    const approvedList = await Reservation.find({ ...hallQuery, status: 'APPROVED' }).select('startTime endTime');
    let bookedHours = 0;
    for (const res of approvedList) {
      bookedHours += calculateDurationHours(res.startTime, res.endTime);
    }
    bookedHours = Number(bookedHours.toFixed(2));

    hallStats.push({
      hallId: hall._id,
      hallName: hall.hallName,
      hallType: hall.hallType,
      location: hall.location,
      capacity: hall.capacity,
      totalReservations,
      approvedReservations,
      pendingReservations,
      rejectedReservations,
      cancelledReservations,
      bookedHours
    });
  }

  // Sort by approvedReservations descending
  hallStats.sort((a, b) => b.approvedReservations - a.approvedReservations);

  if (limit) {
    const limitNum = parseInt(limit, 10);
    if (!isNaN(limitNum) && limitNum > 0) {
      return hallStats.slice(0, limitNum);
    }
  }

  return hallStats;
};

/**
 * 4. GET Event Type Report
 */
const getEventReport = async (filters = {}) => {
  const query = await buildReservationMatchQuery(filters);

  const eventStatsMap = {};
  ALLOWED_EVENT_TYPES.forEach(type => {
    eventStatsMap[type] = { eventType: type, total: 0, approved: 0, pending: 0, rejected: 0, cancelled: 0 };
  });

  const reservations = await Reservation.find(query).select('eventType status');
  for (const r of reservations) {
    if (eventStatsMap[r.eventType]) {
      eventStatsMap[r.eventType].total++;
      if (r.status === 'APPROVED') eventStatsMap[r.eventType].approved++;
      else if (r.status === 'PENDING') eventStatsMap[r.eventType].pending++;
      else if (r.status === 'REJECTED') eventStatsMap[r.eventType].rejected++;
      else if (r.status === 'CANCELLED') eventStatsMap[r.eventType].cancelled++;
    }
  }

  return Object.values(eventStatsMap);
};

/**
 * 5. GET User Type & Department Report
 */
const getUserReport = async (filters = {}) => {
  const query = await buildReservationMatchQuery(filters);

  // Group by userType
  const userTypeMap = {};
  ALLOWED_USER_TYPES.forEach(type => {
    userTypeMap[type] = { userType: type, reservationCount: 0, approvedCount: 0 };
  });

  const departmentMap = {};

  const reservations = await Reservation.find(query).populate('user', 'userType department');
  for (const r of reservations) {
    const ut = r.user?.userType || 'STUDENT';
    const dept = r.user?.department ? r.user.department.trim() : 'Not Specified';

    if (userTypeMap[ut]) {
      userTypeMap[ut].reservationCount++;
      if (r.status === 'APPROVED') userTypeMap[ut].approvedCount++;
    }

    if (!departmentMap[dept]) {
      departmentMap[dept] = { department: dept, totalReservations: 0, approvedReservations: 0, pendingReservations: 0 };
    }
    departmentMap[dept].totalReservations++;
    if (r.status === 'APPROVED') departmentMap[dept].approvedReservations++;
    else if (r.status === 'PENDING') departmentMap[dept].pendingReservations++;
  }

  const userTypeDistribution = Object.values(userTypeMap);
  const departmentDistribution = Object.values(departmentMap).sort((a, b) => b.totalReservations - a.totalReservations);

  return {
    userTypeDistribution,
    departmentDistribution
  };
};

/**
 * 6. GET Monthly Report (Rolling 12 Months with Zero-Data Months)
 */
const getMonthlyReport = async (filters = {}) => {
  const query = await buildReservationMatchQuery(filters);

  // Build array of rolling 12 months (e.g. from 11 months ago to current month)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyList = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const monthIdx = d.getMonth();
    const monthStr = monthNames[monthIdx];
    const key = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;

    monthlyList.push({
      key,
      month: monthStr,
      year,
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0,
      completed: 0
    });
  }

  const reservations = await Reservation.find(query).select('eventDate createdAt status');

  for (const r of reservations) {
    // Group by eventDate if present (YYYY-MM), else createdAt
    let dateKey = r.eventDate ? r.eventDate.slice(0, 7) : formatDateLocal(r.createdAt).slice(0, 7);
    const targetMonth = monthlyList.find(m => m.key === dateKey);

    if (targetMonth) {
      targetMonth.total++;
      if (r.status === 'PENDING') targetMonth.pending++;
      else if (r.status === 'APPROVED') targetMonth.approved++;
      else if (r.status === 'REJECTED') targetMonth.rejected++;
      else if (r.status === 'CANCELLED') targetMonth.cancelled++;
      else if (r.status === 'COMPLETED') targetMonth.completed++;
    }
  }

  // Remove key field before returning
  return monthlyList.map(({ key, ...rest }) => rest);
};

/**
 * 7. GET Report Dashboard (Consolidated payload for Analytics Dashboard)
 */
const getReportDashboard = async (filters = {}) => {
  const summary = await getSummaryReport(filters);
  const reservationReport = await getReservationReport(filters);
  const topHalls = await getHallUsageReport(filters, 5);
  const eventTypes = await getEventReport(filters);
  const userTypes = await getUserReport(filters);
  const monthlyTrend = await getMonthlyReport(filters);

  return {
    summary,
    statusDistribution: reservationReport.statusDistribution,
    monthlyTrend,
    topHalls,
    eventTypes,
    userTypes: userTypes.userTypeDistribution,
    departmentDistribution: userTypes.departmentDistribution
  };
};

module.exports = {
  getSummaryReport,
  getReservationReport,
  getReservationListReport,
  getHallUsageReport,
  getEventReport,
  getUserReport,
  getMonthlyReport,
  getReportDashboard
};
