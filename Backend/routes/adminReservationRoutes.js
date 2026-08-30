const express = require('express');
const router = express.Router();
const {
  getAllReservations,
  getReservationById,
  approveReservation,
  rejectReservation
} = require('../controllers/adminReservationController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ----------------------------------------------------
// Admin-Only Reservation Management Endpoints (/api/admin/reservations)
// Protected by JWT Protect + ADMIN Role Authorization
// ----------------------------------------------------
router.get('/', protect, authorizeRoles('ADMIN'), getAllReservations);
router.get('/:id', protect, authorizeRoles('ADMIN'), getReservationById);
router.put('/:id/approve', protect, authorizeRoles('ADMIN'), approveReservation);
router.patch('/:id/approve', protect, authorizeRoles('ADMIN'), approveReservation);
router.put('/:id/reject', protect, authorizeRoles('ADMIN'), rejectReservation);
router.patch('/:id/reject', protect, authorizeRoles('ADMIN'), rejectReservation);

module.exports = router;
