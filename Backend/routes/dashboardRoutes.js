const express = require('express');
const router = express.Router();
const { getUserDashboard, getAdminDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// User Dashboard Endpoint (/api/dashboard/user)
router.get('/dashboard/user', protect, getUserDashboard);

// Admin Dashboard Endpoint (/api/admin/dashboard)
router.get('/admin/dashboard', protect, authorizeRoles('ADMIN'), getAdminDashboard);

module.exports = router;
