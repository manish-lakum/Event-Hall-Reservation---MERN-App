const express = require('express');
const router = express.Router();
const { sendSuccess } = require('../utils/responseHandler');

/**
 * @desc    API Health Check Endpoint
 * @route   GET /api/health
 * @access  Public
 */
router.get('/', (req, res) => {
  return sendSuccess(res, 200, 'Event Hall Reservation API is running', {
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
