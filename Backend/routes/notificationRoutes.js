const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All notification routes require JWT authentication
router.use(protect);

// Specific Named Sub-routes (Declared before /:id)
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);

// Root Collection Route
router.get('/', getNotifications);

// Parameterized Single Resource Routes
router.get('/:id', getNotificationById);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

module.exports = router;
