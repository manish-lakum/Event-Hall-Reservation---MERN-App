const express = require('express');
const router = express.Router();
const {
  getSummaryReport,
  getReservationReport,
  getReservationList,
  getHallReport,
  getEventReport,
  getUserReport,
  getMonthlyReport,
  getReportDashboard
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All Admin Report APIs require JWT Protection + ADMIN Role Authorization
router.use(protect, authorizeRoles('ADMIN'));

router.get('/summary', getSummaryReport);
router.get('/reservations/list', getReservationList);
router.get('/reservations', getReservationReport);
router.get('/halls', getHallReport);
router.get('/events', getEventReport);
router.get('/users', getUserReport);
router.get('/monthly', getMonthlyReport);
router.get('/dashboard', getReportDashboard);

module.exports = router;
