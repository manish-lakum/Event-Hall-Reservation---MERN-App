const {
  getSummaryReport: fetchSummary,
  getReservationReport: fetchReservationReport,
  getReservationListReport: fetchReservationList,
  getHallUsageReport: fetchHallReport,
  getEventReport: fetchEventReport,
  getUserReport: fetchUserReport,
  getMonthlyReport: fetchMonthlyReport,
  getReportDashboard: fetchReportDashboard
} = require('../services/reportService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    GET Admin Report Summary Statistics
 * @route   GET /api/admin/reports/summary
 * @access  Private (Admin Only)
 */
const getSummaryReport = async (req, res, next) => {
  try {
    const data = await fetchSummary(req.query);
    return sendSuccess(res, 200, 'Report summary retrieved successfully', data);
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('cannot be before')) {
      return sendError(res, 400, error.message);
    }
    if (error.statusCode === 404 || error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * @desc    GET Admin Reservation Report & Distribution
 * @route   GET /api/admin/reports/reservations
 * @access  Private (Admin Only)
 */
const getReservationReport = async (req, res, next) => {
  try {
    const data = await fetchReservationReport(req.query);
    return sendSuccess(res, 200, 'Reservation report retrieved successfully', data);
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('cannot be before')) {
      return sendError(res, 400, error.message);
    }
    if (error.statusCode === 404 || error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * @desc    GET Admin Raw Reservation Report Table List
 * @route   GET /api/admin/reports/reservations/list
 * @access  Private (Admin Only)
 */
const getReservationList = async (req, res, next) => {
  try {
    const result = await fetchReservationList(req.query, req.query);
    return res.status(200).json({
      success: true,
      message: 'Reservation report list retrieved successfully',
      data: result.reservations,
      pagination: result.pagination
    });
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('cannot be before')) {
      return sendError(res, 400, error.message);
    }
    if (error.statusCode === 404 || error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * @desc    GET Admin Hall Usage & Utilization Report
 * @route   GET /api/admin/reports/halls
 * @access  Private (Admin Only)
 */
const getHallReport = async (req, res, next) => {
  try {
    const data = await fetchHallReport(req.query, req.query.limit);
    return sendSuccess(res, 200, 'Hall report retrieved successfully', data);
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('cannot be before')) {
      return sendError(res, 400, error.message);
    }
    if (error.statusCode === 404 || error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * @desc    GET Admin Event Type Report
 * @route   GET /api/admin/reports/events
 * @access  Private (Admin Only)
 */
const getEventReport = async (req, res, next) => {
  try {
    const data = await fetchEventReport(req.query);
    return sendSuccess(res, 200, 'Event report retrieved successfully', data);
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('cannot be before')) {
      return sendError(res, 400, error.message);
    }
    if (error.statusCode === 404 || error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * @desc    GET Admin User Type & Department Report
 * @route   GET /api/admin/reports/users
 * @access  Private (Admin Only)
 */
const getUserReport = async (req, res, next) => {
  try {
    const data = await fetchUserReport(req.query);
    return sendSuccess(res, 200, 'User report retrieved successfully', data);
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('cannot be before')) {
      return sendError(res, 400, error.message);
    }
    if (error.statusCode === 404 || error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * @desc    GET Admin Rolling Monthly Report
 * @route   GET /api/admin/reports/monthly
 * @access  Private (Admin Only)
 */
const getMonthlyReport = async (req, res, next) => {
  try {
    const data = await fetchMonthlyReport(req.query);
    return sendSuccess(res, 200, 'Monthly report retrieved successfully', data);
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('cannot be before')) {
      return sendError(res, 400, error.message);
    }
    if (error.statusCode === 404 || error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * @desc    GET Admin Analytics Consolidated Dashboard Payload
 * @route   GET /api/admin/reports/dashboard
 * @access  Private (Admin Only)
 */
const getReportDashboard = async (req, res, next) => {
  try {
    const data = await fetchReportDashboard(req.query);
    return sendSuccess(res, 200, 'Report dashboard data retrieved successfully', data);
  } catch (error) {
    if (error.message.includes('Invalid') || error.message.includes('cannot be before')) {
      return sendError(res, 400, error.message);
    }
    if (error.statusCode === 404 || error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

module.exports = {
  getSummaryReport,
  getReservationReport,
  getReservationList,
  getHallReport,
  getEventReport,
  getUserReport,
  getMonthlyReport,
  getReportDashboard
};
