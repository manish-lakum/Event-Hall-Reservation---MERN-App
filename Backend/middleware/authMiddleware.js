const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { sendError } = require('../utils/responseHandler');

/**
 * Authentication Middleware: Verify JWT and attach User to Request
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract Bearer token
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return sendError(res, 401, 'Access denied. No authentication token provided.');
      }

      // Verify Token Signature
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

      // Fetch User from Database (Exclude Password)
      const user = await User.findById(decoded.userId).select('-password');

      if (!user) {
        return sendError(res, 401, 'User account associated with this token no longer exists.');
      }

      // Check Active Account Status
      if (!user.isActive) {
        return sendError(res, 403, 'Account has been deactivated. Contact Campus Administrator.');
      }

      // Attach User to Request Context
      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return sendError(res, 401, 'Authentication token has expired. Please log in again.');
      }
      return sendError(res, 401, 'Invalid authentication token.');
    }
  } else {
    return sendError(res, 401, 'Access denied. Authorization header with Bearer token required.');
  }
};

module.exports = { protect };
