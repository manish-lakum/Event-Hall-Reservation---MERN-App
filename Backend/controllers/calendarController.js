const mongoose = require('mongoose');
const { Hall } = require('../models/Hall');
const { getUserCalendarEvents, getAdminCalendarEvents } = require('../services/calendarService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get Logged-in User Calendar Events (Public / User)
 * @route   GET /api/calendar/user
 * @access  Private (User)
 */
const getUserCalendar = async (req, res, next) => {
  try {
    const events = await getUserCalendarEvents(req.user._id, req.query);
    return sendSuccess(res, 200, 'User calendar retrieved successfully', events);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get System-wide Admin Calendar (Merged Reservations & Expanded Multi-Day Blocks)
 * @route   GET /api/admin/calendar
 * @access  Private (Admin Only)
 */
const getAdminCalendar = async (req, res, next) => {
  try {
    const { startDate, endDate, hallId } = req.query;

    // Validate Hall ID if passed
    if (hallId) {
      if (!mongoose.Types.ObjectId.isValid(hallId)) {
        return sendError(res, 400, 'Invalid Hall ID format');
      }
      const hall = await Hall.findById(hallId);
      if (!hall) {
        return sendError(res, 404, 'Hall not found');
      }
    }

    // Validate Date Range
    if (startDate && endDate && endDate < startDate) {
      return sendError(res, 400, 'End date cannot be earlier than start date');
    }

    const events = await getAdminCalendarEvents(req.query);
    return sendSuccess(res, 200, 'Admin calendar retrieved successfully', events);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Convenience Endpoint for Today's Admin Calendar Schedule
 * @route   GET /api/admin/calendar/today
 * @access  Private (Admin Only)
 */
const getTodayCalendar = async (req, res, next) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const events = await getAdminCalendarEvents({
      ...req.query,
      startDate: todayStr,
      endDate: todayStr
    });
    return sendSuccess(res, 200, "Today's admin calendar retrieved successfully", events);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserCalendar,
  getAdminCalendar,
  getTodayCalendar
};
