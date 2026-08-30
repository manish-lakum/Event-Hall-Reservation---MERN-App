const express = require('express');
const router = express.Router();
const { checkAvailability, getSchedule } = require('../controllers/availabilityController');

// Public / User Hall Availability & Schedule Endpoints
router.get('/:id/availability', checkAvailability);
router.get('/:id/schedule', getSchedule);

module.exports = router;
