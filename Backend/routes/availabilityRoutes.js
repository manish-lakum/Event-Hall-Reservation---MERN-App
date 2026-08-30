const express = require('express');
const router = express.Router();
const { checkAvailability, getSchedule } = require('../controllers/availabilityController');
const { verifyHallAvailability } = require('../services/availabilityService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Public / User Hall Availability & Schedule Endpoints
router.get('/:id/availability', checkAvailability);
router.get('/:id/schedule', getSchedule);

// POST handler for check availability
router.post('/check-availability', async (req, res, next) => {
  try {
    const { hallId, date, startTime, endTime } = req.body;
    const check = await verifyHallAvailability(hallId, date, startTime, endTime);

    if (!check.available && check.statusCode === 400) {
      return sendError(res, 400, check.errorMsg);
    }
    if (!check.available && check.statusCode === 404) {
      return sendError(res, 404, check.errorMsg);
    }

    return sendSuccess(res, 200, check.result.available ? 'Hall is available' : 'Hall is not available', check.result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
