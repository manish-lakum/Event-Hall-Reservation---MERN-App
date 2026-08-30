const User = require('../models/userModel');
const generateToken = require('../utils/generateToken');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Register a new user account
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, userType, department, collegeId, phone } = req.body;

    // Validate Required Inputs
    if (!name || !email || !password) {
      return sendError(res, 400, 'Please provide name, email, and password');
    }

    // Check for Duplicate Email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 400, 'User account with this email address already exists');
    }

    // Create User Instance
    const user = await User.create({
      name,
      email,
      password,
      role: 'USER', // Default registration role is USER
      userType: userType || 'STUDENT',
      department: department || 'General',
      collegeId: collegeId || '',
      phone: phone || ''
    });

    // Generate JWT Token
    const token = generateToken(user._id, user.role);

    // Format User Response Object (Excludes password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType,
      department: user.department,
      collegeId: user.collegeId,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return sendSuccess(res, 201, 'User registered successfully', {
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & return JWT token
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate Input
    if (!email || !password) {
      return sendError(res, 400, 'Please provide both email and password');
    }

    // Find User and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Check Account Status
    if (!user.isActive) {
      return sendError(res, 403, 'Your account has been deactivated. Please contact Admin.');
    }

    // Verify Password Match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password');
    }

    // Generate JWT Token
    const token = generateToken(user._id, user.role);

    // Format User Response Object
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      userType: user.userType,
      department: user.department,
      collegeId: user.collegeId,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt
    };

    return sendSuccess(res, 200, 'Login successful', {
      token,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private (Protected by JWT)
 */
const getMe = async (req, res, next) => {
  try {
    // req.user is attached by authMiddleware protect function
    return sendSuccess(res, 200, 'User profile retrieved successfully', {
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};
