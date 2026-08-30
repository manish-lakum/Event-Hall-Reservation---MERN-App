const {
  getAllUsersAdmin,
  getUserByIdAdmin,
  updateUserAdmin,
  toggleUserStatusAdmin
} = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get All Users with Filters & Search (Admin Only)
 * @route   GET /api/admin/users
 * @access  Private (Admin Only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const result = await getAllUsersAdmin(req.query);
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: result.users,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Single User Details + Reservation Statistics (Admin Only)
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin Only)
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getUserByIdAdmin(id);
    return sendSuccess(res, 200, 'User details retrieved successfully', result);
  } catch (error) {
    if (error.message.includes('Invalid User ID')) return sendError(res, 400, error.message);
    if (error.message.includes('not found')) return sendError(res, 404, error.message);
    next(error);
  }
};

/**
 * @desc    Update User Profile (Admin Only)
 * @route   PATCH /api/admin/users/:id
 * @access  Private (Admin Only)
 */
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedUser = await updateUserAdmin(id, req.body);
    return sendSuccess(res, 200, 'User updated successfully', updatedUser);
  } catch (error) {
    if (error.message.includes('Invalid User ID') || error.message.includes('Invalid userType')) {
      return sendError(res, 400, error.message);
    }
    if (error.message.includes('already in use')) {
      return sendError(res, 409, error.message);
    }
    if (error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Toggle User Active / Inactive Status (Admin Only)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin Only)
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined || isActive === null) {
      return sendError(res, 400, 'isActive status boolean is required');
    }

    const updatedUser = await toggleUserStatusAdmin(id, req.user._id, isActive);
    return sendSuccess(res, 200, 'User status updated successfully', updatedUser);
  } catch (error) {
    if (error.message.includes('cannot deactivate their own account') || error.message.includes('Invalid User ID')) {
      return sendError(res, 400, error.message);
    }
    if (error.message.includes('not found')) {
      return sendError(res, 404, error.message);
    }
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus
};
