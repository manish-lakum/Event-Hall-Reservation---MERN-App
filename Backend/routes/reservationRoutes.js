const express = require('express');
const router = express.Router();
const {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation
} = require('../controllers/reservationController');
const { protect } = require('../middleware/authMiddleware');

// ----------------------------------------------------
// User Reservation Endpoints (/api/reservations)
// All endpoints require JWT authentication
// ----------------------------------------------------
router.post('/', protect, createReservation);
router.get('/my', protect, getMyReservations);
router.get('/:id', protect, getReservationById);
router.patch('/:id/cancel', protect, cancelReservation);

module.exports = router;
