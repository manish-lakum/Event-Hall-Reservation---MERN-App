const express = require('express');
const router = express.Router();
const {
  createHall,
  getPublicHalls,
  getHallById,
  getAdminHalls,
  updateHall,
  toggleHallStatus,
  deleteHall
} = require('../controllers/hallController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ----------------------------------------------------
// Public / User Hall Endpoints (/api/halls)
// ----------------------------------------------------
router.get('/halls', getPublicHalls);
router.get('/halls/:id', getHallById);

// ----------------------------------------------------
// Admin-Only Hall Endpoints (/api/admin/halls)
// Protected by JWT Protect + ADMIN Role Authorization
// ----------------------------------------------------
router.post('/admin/halls', protect, authorizeRoles('ADMIN'), createHall);
router.get('/admin/halls', protect, authorizeRoles('ADMIN'), getAdminHalls);
router.get('/admin/halls/:id', protect, authorizeRoles('ADMIN'), getHallById);
router.put('/admin/halls/:id', protect, authorizeRoles('ADMIN'), updateHall);
router.patch('/admin/halls/:id', protect, authorizeRoles('ADMIN'), updateHall);
router.patch('/admin/halls/:id/status', protect, authorizeRoles('ADMIN'), toggleHallStatus);
router.delete('/admin/halls/:id', protect, authorizeRoles('ADMIN'), deleteHall);

module.exports = router;
