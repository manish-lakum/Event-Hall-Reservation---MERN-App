/**
 * Standardized JSON API Response Helpers
 */

exports.sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const responsePayload = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    responsePayload.data = data;
  }

  return res.status(statusCode).json(responsePayload);
};

exports.sendError = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const responsePayload = {
    success: false,
    message
  };

  if (errors !== null && errors !== undefined) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
};
