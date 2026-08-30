const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const {
  getUserNotifications,
  getUnreadCount: fetchUnreadCount,
  markAsRead: markSingleRead,
  markAllAsRead: markAllRead,
  deleteNotification: removeNotification
} = require('../services/notificationService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get Notifications for Logged-in User
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res, next) => {
  try {
    const result = await getUserNotifications(req.user._id, req.query);
    return res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result.notifications,
      pagination: result.pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Unread Notification Count
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res, next) => {
  try {
    const data = await fetchUnreadCount(req.user._id);
    return sendSuccess(res, 200, 'Unread notification count retrieved successfully', data);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Notification Details by ID
 * @route   GET /api/notifications/:id
 * @access  Private
 */
const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Notification ID format');
    }

    const notification = await Notification.findById(id)
      .populate('reservation', 'eventTitle eventDate startTime endTime status')
      .populate('hall', 'hallName location hallType');

    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    // Security Check: Cross-user access prevention
    if (notification.recipient.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied. You can only access your own notifications.');
    }

    return sendSuccess(res, 200, 'Notification details retrieved successfully', notification);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark Single Notification as Read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Notification ID format');
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied. You can only update your own notifications.');
    }

    const updated = await markSingleRead(id, req.user._id);
    return sendSuccess(res, 200, 'Notification marked as read', updated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark All Notifications as Read
 * @route   PATCH /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res, next) => {
  try {
    const result = await markAllRead(req.user._id);
    return sendSuccess(res, 200, 'All notifications marked as read', result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete Notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Notification ID format');
    }

    const notification = await Notification.findById(id);
    if (!notification) {
      return sendError(res, 404, 'Notification not found');
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied. You can only delete your own notifications.');
    }

    await removeNotification(id, req.user._id);
    return sendSuccess(res, 200, 'Notification deleted successfully', { id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification
};
