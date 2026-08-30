const express = require('express');
const router = express.Router();
const { getUserCalendar, getAdminCalendar, getTodayCalendar } = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// User Calendar Endpoint (/api/calendar/user)
router.get('/calendar/user', protect, getUserCalendar);

// Admin Calendar Endpoints (/api/admin/calendar & /api/admin/calendar/today)
router.get('/admin/calendar/today', protect, authorizeRoles('ADMIN'), getTodayCalendar);
router.get('/admin/calendar', protect, authorizeRoles('ADMIN'), getAdminCalendar);

module.exports = router;
