const mongoose = require('mongoose');
const { Hall } = require('../models/Hall');
const { HallBlock } = require('../models/HallBlock');
const { Reservation } = require('../models/Reservation');
const { verifyHallAvailability } = require('../services/availabilityService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Check Hall Slot Availability (Public / User)
 * @route   GET /api/halls/:id/availability
 * @access  Public / User
 */
const checkAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.query;

    const check = await verifyHallAvailability(id, date, startTime, endTime);

    // If validation error (past date, invalid format, outside hours, non-existent/disabled hall)
    if (!check.available && check.statusCode === 400) {
      return sendError(res, 400, check.errorMsg);
    }

    if (!check.available && check.statusCode === 404) {
      return sendError(res, 404, check.errorMsg);
    }

    // Availability Result (HTTP 200 with available: true/false)
    if (check.result.available) {
      return sendSuccess(res, 200, 'Hall is available', check.result);
    } else {
      return sendSuccess(res, 200, 'Hall is not available for the selected slot', check.result);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Hall Schedule / Blocked & Reserved Slots for a date or date range (Public / User)
 * @route   GET /api/halls/:id/schedule
 * @access  Public / User
 */
const getSchedule = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Hall ID format');
    }

    const hall = await Hall.findById(id);
    if (!hall) {
      return sendError(res, 404, 'Hall not found');
    }

    let filterStartDate = date || startDate;
    let filterEndDate = date || endDate || filterStartDate;

    if (!filterStartDate) {
      filterStartDate = new Date().toISOString().split('T')[0];
      filterEndDate = filterStartDate;
    }

    // 1. Fetch Maintenance Blocked Slots
    const blockQuery = {
      hall: id,
      isActive: true,
      startDate: { $lte: filterEndDate },
      endDate: { $gte: filterStartDate }
    };
    const blockedSlots = await HallBlock.find(blockQuery).sort({ startDate: 1, startTime: 1 });

    const formattedBlockSlots = blockedSlots.map(b => ({
      _id: b._id,
      slotType: 'BLOCKED',
      reason: b.reason,
      notes: b.notes,
      startDate: b.startDate,
      endDate: b.endDate,
      startTime: b.startTime,
      endTime: b.endTime
    }));

    // 2. Fetch Active Reservations (PENDING or APPROVED)
    const resQuery = {
      hall: id,
      eventDate: { $gte: filterStartDate, $lte: filterEndDate },
      status: { $in: ['PENDING', 'APPROVED'] }
    };
    const reservationSlots = await Reservation.find(resQuery).sort({ eventDate: 1, startTime: 1 });

    const formattedResSlots = reservationSlots.map(r => ({
      _id: r._id,
      slotType: 'RESERVATION',
      eventTitle: r.eventTitle,
      eventType: r.eventType,
      status: r.status,
      startDate: r.eventDate,
      endDate: r.eventDate,
      startTime: r.startTime,
      endTime: r.endTime
    }));

    // Combine and sort by date and startTime
    const combinedSchedule = [...formattedBlockSlots, ...formattedResSlots].sort((a, b) => {
      if (a.startDate !== b.startDate) return a.startDate.localeCompare(b.startDate);
      return a.startTime.localeCompare(b.startTime);
    });

    return sendSuccess(res, 200, 'Hall schedule retrieved successfully', {
      hallId: hall._id,
      hallName: hall.hallName,
      openingTime: hall.openingTime,
      closingTime: hall.closingTime,
      queryRange: { startDate: filterStartDate, endDate: filterEndDate },
      schedule: combinedSchedule
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkAvailability,
  getSchedule
};
