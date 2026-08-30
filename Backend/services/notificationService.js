const Notification = require('../models/Notification');
const User = require('../models/userModel');
const { Reservation } = require('../models/Reservation');

const formatDateLocal = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Base Helper: Create Single Notification Document safely
 */
const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error('[Notification Error] Failed to create notification:', error.message);
    return null; // Return null safely so caller business logic isn't interrupted
  }
};

/**
 * Notify Specific User
 */
const notifyUser = async ({ userId, type, title, message, reservationId = null, hallId = null, metadata = {} }) => {
  return await createNotification({
    recipient: userId,
    recipientRole: 'USER',
    type,
    title,
    message,
    reservation: reservationId,
    hall: hallId,
    metadata
  });
};

/**
 * Notify All Active Admins
 */
const notifyAdmins = async ({ type, title, message, reservationId = null, hallId = null, metadata = {} }) => {
  try {
    const activeAdmins = await User.find({ role: 'ADMIN', isActive: true }).select('_id');
    if (!activeAdmins || activeAdmins.length === 0) return [];

    const notifications = [];
    for (const admin of activeAdmins) {
      const n = await createNotification({
        recipient: admin._id,
        recipientRole: 'ADMIN',
        type,
        title,
        message,
        reservation: reservationId,
        hall: hallId,
        metadata
      });
      if (n) notifications.push(n);
    }
    return notifications;
  } catch (error) {
    console.error('[Notification Error] Failed to notify admins:', error.message);
    return [];
  }
};

/**
 * Get User/Admin Notifications List (Paginated & Filtered)
 */
const getUserNotifications = async (userId, options = {}) => {
  const { isRead, type, page = 1, limit = 10 } = options;

  const query = { recipient: userId };

  if (isRead !== undefined && isRead !== null && isRead !== '') {
    query.isRead = isRead === 'true' || isRead === true;
  }

  if (type) {
    query.type = String(type).toUpperCase();
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 10);
  const skip = (pageNum - 1) * limitNum;

  const total = await Notification.countDocuments(query);
  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum)
    .populate('reservation', 'eventTitle eventDate startTime endTime status')
    .populate('hall', 'hallName location hallType');

  return {
    notifications,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Get Unread Notification Count
 */
const getUnreadCount = async (userId) => {
  const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });
  return { unreadCount };
};

/**
 * Mark Single Notification as Read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  )
    .populate('reservation', 'eventTitle eventDate startTime endTime status')
    .populate('hall', 'hallName location hallType');

  return notification;
};

/**
 * Mark All Notifications as Read for User
 */
const markAllAsRead = async (userId) => {
  const now = new Date();
  const result = await Notification.updateMany(
    { recipient: userId, isRead: false },
    { $set: { isRead: true, readAt: now } }
  );

  return { modifiedCount: result.modifiedCount };
};

/**
 * Delete Single Notification
 */
const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOneAndDelete({ _id: notificationId, recipient: userId });
  return notification;
};

/**
 * Background Reminder Job: Notify users 1 day before APPROVED reservations
 */
const runUpcomingReservationReminderJob = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = formatDateLocal(tomorrow);

    const upcomingApproved = await Reservation.find({
      eventDate: tomorrowStr,
      status: 'APPROVED'
    }).populate('hall', 'hallName location');

    let reminderCount = 0;

    for (const res of upcomingApproved) {
      // Prevent Duplicate Reminders
      const existingReminder = await Notification.findOne({
        recipient: res.user,
        reservation: res._id,
        type: 'UPCOMING_RESERVATION'
      });

      if (!existingReminder) {
        await notifyUser({
          userId: res.user,
          type: 'UPCOMING_RESERVATION',
          title: 'Upcoming Reservation Reminder',
          message: `Reminder: Your reservation for ${res.hall?.hallName || 'Hall'} is scheduled for tomorrow (${res.eventDate}) from ${res.startTime} to ${res.endTime}.`,
          reservationId: res._id,
          hallId: res.hall?._id,
          metadata: { eventDate: res.eventDate, startTime: res.startTime, endTime: res.endTime }
        });
        reminderCount++;
      }
    }

    console.log(`[Reminder Job] Executed for ${tomorrowStr}. Reminders sent: ${reminderCount}`);
    return { date: tomorrowStr, reminderCount };
  } catch (error) {
    console.error('[Reminder Job Error]', error.message);
    return { error: error.message };
  }
};

module.exports = {
  createNotification,
  notifyUser,
  notifyAdmins,
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  runUpcomingReservationReminderJob
};
