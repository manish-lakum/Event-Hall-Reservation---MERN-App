const { getUserDashboardData, getAdminDashboardData } = require('../services/dashboardService');
const { sendSuccess } = require('../utils/responseHandler');

/**
 * @desc    Get Logged-in User Dashboard Analytics & Recent Items
 * @route   GET /api/dashboard/user
 * @access  Private (User)
 */
const getUserDashboard = async (req, res, next) => {
  try {
    const dashboardData = await getUserDashboardData(req.user._id);
    return sendSuccess(res, 200, 'User dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get System-wide Admin Dashboard Analytics, Charts & Today's Schedule
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin Only)
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const dashboardData = await getAdminDashboardData();
    return sendSuccess(res, 200, 'Admin dashboard data retrieved successfully', dashboardData);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserDashboard,
  getAdminDashboard
};
