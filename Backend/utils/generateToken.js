const jwt = require('jsonwebtoken');

/**
 * Generate a Signed JSON Web Token (JWT)
 * @param {string} userId - User Mongoose ObjectId
 * @param {string} role - User role (USER / ADMIN)
 * @returns {string} Signed JWT Token string
 */
const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(
    { userId, role },
    secret,
    { expiresIn }
  );
};

module.exports = generateToken;
