const mongoose = require('mongoose');
const { Reservation } = require('../models/Reservation');
const { HallBlock } = require('../models/HallBlock');
const { Hall } = require('../models/Hall');

const formatDateLocal = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Generate dates array (YYYY-MM-DD) between start and end date strings inclusive
 */
const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  const curr = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T00:00:00`);

  while (curr <= end) {
    dates.push(formatDateLocal(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

/**
 * Service: Fetch Logged-in User's Calendar Events
 */
const getUserCalendarEvents = async (userId, options = {}) => {
  const { startDate, endDate, status } = options;

  const query = { user: userId };

  // Status Filter: Default to PENDING & APPROVED if not specified
  if (status) {
    query.status = String(status).toUpperCase();
  } else {
    query.status = { $in: ['PENDING', 'APPROVED'] };
  }

  // Date Range Filter
  if (startDate && endDate) {
    query.eventDate = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.eventDate = { $gte: startDate };
  } else if (endDate) {
    query.eventDate = { $lte: endDate };
  }

  const reservations = await Reservation.find(query)
    .sort({ eventDate: 1, startTime: 1 })
    .populate('hall', 'hallName location hallType capacity image');

  return reservations.map(r => ({
    id: r._id,
    title: r.eventTitle,
    date: r.eventDate,
    startTime: r.startTime,
    endTime: r.endTime,
    status: r.status,
    eventType: r.eventType,
    expectedParticipants: r.expectedParticipants,
    requestedFacilities: r.requestedFacilities,
    hall: r.hall
      ? {
          _id: r.hall._id,
          hallName: r.hall.hallName,
          location: r.hall.location,
          hallType: r.hall.hallType,
          capacity: r.hall.capacity
        }
      : null
  }));
};

/**
 * Service: Fetch Admin Calendar Events (Reservations + Multi-Day Expanded Blocks)
 */
const getAdminCalendarEvents = async (options = {}) => {
  const { startDate, endDate, hallId, status, slotType, eventType } = options;

  let reservationEntries = [];
  let blockEntries = [];

  // Determine query range boundary dates
  const queryStart = startDate || formatDateLocal(new Date()); // Default to today
  // Default end date to 30 days from queryStart if not provided
  let queryEnd = endDate;
  if (!queryEnd) {
    const endD = new Date(`${queryStart}T00:00:00`);
    endD.setDate(endD.getDate() + 30);
    queryEnd = formatDateLocal(endD);
  }

  // ---------------------------------------------------------
  // 1. Fetch & Format Reservations (Unless slotType === 'BLOCK')
  // ---------------------------------------------------------
  if (!slotType || slotType.toUpperCase() === 'RESERVATION') {
    const resQuery = {
      eventDate: { $gte: queryStart, $lte: queryEnd }
    };

    if (hallId && mongoose.Types.ObjectId.isValid(hallId)) {
      resQuery.hall = hallId;
    }

    if (status) {
      resQuery.status = String(status).toUpperCase();
    } else {
      resQuery.status = { $in: ['PENDING', 'APPROVED'] };
    }

    if (eventType) {
      resQuery.eventType = String(eventType).toUpperCase();
    }

    const reservations = await Reservation.find(resQuery)
      .sort({ eventDate: 1, startTime: 1 })
      .populate('user', 'name email userType department collegeId phone')
      .populate('hall', 'hallName location hallType capacity');

    reservationEntries = reservations.map(r => ({
      id: r._id,
      slotType: 'RESERVATION',
      title: r.eventTitle,
      date: r.eventDate,
      startTime: r.startTime,
      endTime: r.endTime,
      status: r.status,
      eventType: r.eventType,
      expectedParticipants: r.expectedParticipants,
      requestedFacilities: r.requestedFacilities,
      user: r.user
        ? {
            _id: r.user._id,
            name: r.user.name,
            email: r.user.email,
            userType: r.user.userType,
            department: r.user.department,
            collegeId: r.user.collegeId
          }
        : null,
      hall: r.hall
        ? {
            _id: r.hall._id,
            hallName: r.hall.hallName,
            location: r.hall.location,
            hallType: r.hall.hallType
          }
        : null
    }));
  }

  // ---------------------------------------------------------
  // 2. Fetch & Expand Maintenance Blocks (Unless slotType === 'RESERVATION')
  // ---------------------------------------------------------
  if (!slotType || slotType.toUpperCase() === 'BLOCK') {
    const blockQuery = {
      isActive: true,
      startDate: { $lte: queryEnd },
      endDate: { $gte: queryStart }
    };

    if (hallId && mongoose.Types.ObjectId.isValid(hallId)) {
      blockQuery.hall = hallId;
    }

    const blocks = await HallBlock.find(blockQuery)
      .sort({ startDate: 1, startTime: 1 })
      .populate('hall', 'hallName location hallType capacity');

    for (const b of blocks) {
      // Calculate effective start and end date bounded by query range
      const effStart = b.startDate < queryStart ? queryStart : b.startDate;
      const effEnd = b.endDate > queryEnd ? queryEnd : b.endDate;

      const expandedDates = getDatesInRange(effStart, effEnd);

      for (const currDate of expandedDates) {
        blockEntries.push({
          id: `${b._id}_${currDate}`,
          blockId: b._id,
          slotType: 'BLOCK',
          title: `[Maintenance] ${b.reason}`,
          date: currDate,
          startTime: b.startTime,
          endTime: b.endTime,
          status: 'BLOCKED',
          reason: b.reason,
          notes: b.notes,
          hall: b.hall
            ? {
                _id: b.hall._id,
                hallName: b.hall.hallName,
                location: b.hall.location,
                hallType: b.hall.hallType
              }
            : null
        });
      }
    }
  }

  // ---------------------------------------------------------
  // 3. Merge & Sort Combined Calendar Entries
  // ---------------------------------------------------------
  const combined = [...reservationEntries, ...blockEntries].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  return combined;
};

module.exports = {
  getDatesInRange,
  getUserCalendarEvents,
  getAdminCalendarEvents
};
