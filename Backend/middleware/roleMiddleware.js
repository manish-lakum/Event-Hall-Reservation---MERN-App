const { sendError } = require('../utils/responseHandler');

/**
 * Role Authorization Middleware
 * Restricts access to routes based on allowed User Roles (e.g. 'ADMIN')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, 'Unauthorized request.');
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };
