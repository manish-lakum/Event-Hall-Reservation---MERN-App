const { sendSuccess } = require('../utils/responseHandler');

const getHello = (req, res) => {
  return sendSuccess(res, 200, 'Welcome to the over Event Reservation.');
};

module.exports = { getHello };