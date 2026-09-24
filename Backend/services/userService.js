const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const { Reservation } = require('../models/Reservation');

const ALLOWED_USER_TYPES = ['FACULTY'];

/**
 * Fetch Logged-in User Profile
 */
const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User profile not found');
  }
  return user;
};

/**
 * Update Logged-in User Profile (Safe fields only)
 */
const updateUserProfile = async (userId, updateData) => {
  const { name, department, phone, userType, profilePhoto } = updateData;

  const safeUpdates = {};

  if (name !== undefined) {
    if (!name || String(name).trim().length === 0) {
      throw new Error('Name cannot be empty');
    }
    safeUpdates.name = String(name).trim();
  }

  if (department !== undefined) {
    safeUpdates.department = String(department).trim();
  }

  if (phone !== undefined) {
    safeUpdates.phone = String(phone).trim();
  }

  if (profilePhoto !== undefined) {
    safeUpdates.profilePhoto = String(profilePhoto).trim();
  }

  if (userType !== undefined) {
    const formattedType = String(userType).toUpperCase();
    if (!ALLOWED_USER_TYPES.includes(formattedType)) {
      throw new Error(`Invalid userType. Allowed values: ${ALLOWED_USER_TYPES.join(', ')}`);
    }
    safeUpdates.userType = formattedType;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: safeUpdates },
    { new: true, runValidators: true }
  ).select('-password');

  return updatedUser;
};

/**
 * Update Logged-in User Profile Photo
 */
const updateProfilePhoto = async (userId, profilePhoto) => {
  if (!profilePhoto || String(profilePhoto).trim().length === 0) {
    throw new Error('Profile photo is required');
  }

  const photoStr = String(profilePhoto).trim();

  // Validate format if Data URI
  if (photoStr.startsWith('data:')) {
    const isSupportedFormat = /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(photoStr);
    if (!isSupportedFormat) {
      throw new Error('Invalid image format. Only JPG, PNG, and WEBP images are supported');
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { profilePhoto: photoStr } },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new Error('User profile not found');
  }

  return updatedUser;
};

/**
 * Change Logged-in User Password
 */
const changeUserPassword = async (userId, { currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error('Please provide currentPassword, newPassword, and confirmPassword');
  }

  if (newPassword !== confirmPassword) {
    throw new Error('New password and confirm password do not match');
  }

  if (newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters long');
  }

  // Fetch user with password field explicitly selected
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new Error('User account not found');
  }

  // Verify current password
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new Error('Current password is incorrect');
  }

  // Prevent reusing current password
  const isSamePassword = await bcrypt.compare(newPassword, user.password);
  if (isSamePassword) {
    throw new Error('New password must be different from current password');
  }

  // Set new password (pre-save hook in userModel will hash it automatically)
  user.password = newPassword;
  await user.save();

  return { message: 'Password changed successfully' };
};

/**
 * Admin: Get All Users (Paginated & Filtered)
 */
const getAllUsersAdmin = async (options = {}) => {
  const { search, role, userType, department, isActive, page = 1, limit = 1000, sort } = options;

  const query = {};

  if (role) {
    query.role = String(role).toUpperCase();
  }

  if (userType) {
    query.userType = String(userType).toUpperCase();
  }

  if (department) {
    query.department = new RegExp(department.trim(), 'i');
  }

  if (isActive !== undefined && isActive !== null && isActive !== '') {
    query.isActive = isActive === 'true' || isActive === true;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: searchRegex },
      { email: searchRegex },
      { collegeId: searchRegex },
      { department: searchRegex }
    ];
  }

  let sortOption = { createdAt: -1 };
  if (sort === 'name_asc') sortOption = { name: 1 };
  else if (sort === 'name_desc') sortOption = { name: -1 };
  else if (sort === 'createdAt_asc') sortOption = { createdAt: 1 };

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 1000);
  const skip = (pageNum - 1) * limitNum;

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .select('-password');

  return {
    users,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1
    }
  };
};

/**
 * Admin: Get Single User Details + Reservation Statistics
 */
const getUserByIdAdmin = async (targetUserId) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new Error('Invalid User ID format');
  }

  const user = await User.findById(targetUserId).select('-password');
  if (!user) {
    throw new Error('User account not found');
  }

  // Calculate user's reservation statistics
  const totalReservations = await Reservation.countDocuments({ user: targetUserId });
  const pendingReservations = await Reservation.countDocuments({ user: targetUserId, status: 'PENDING' });
  const approvedReservations = await Reservation.countDocuments({ user: targetUserId, status: 'APPROVED' });
  const cancelledReservations = await Reservation.countDocuments({ user: targetUserId, status: 'CANCELLED' });

  return {
    user,
    stats: {
      totalReservations,
      pendingReservations,
      approvedReservations,
      cancelledReservations
    }
  };
};

/**
 * Admin: Update User Profile Details
 */
const updateUserAdmin = async (targetUserId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new Error('Invalid User ID format');
  }

  const { name, email, userType, department, collegeId, phone } = updateData;
  const safeUpdates = {};

  if (name !== undefined) safeUpdates.name = String(name).trim();
  if (department !== undefined) safeUpdates.department = String(department).trim();
  if (collegeId !== undefined) safeUpdates.collegeId = String(collegeId).trim();
  if (phone !== undefined) safeUpdates.phone = String(phone).trim();

  if (userType !== undefined) {
    const formattedType = String(userType).toUpperCase();
    if (!ALLOWED_USER_TYPES.includes(formattedType)) {
      throw new Error(`Invalid userType. Allowed values: ${ALLOWED_USER_TYPES.join(', ')}`);
    }
    safeUpdates.userType = formattedType;
  }

  if (email !== undefined) {
    const emailStr = String(email).trim().toLowerCase();
    const existingEmail = await User.findOne({ _id: { $ne: targetUserId }, email: emailStr });
    if (existingEmail) {
      throw new Error('Email is already in use by another account');
    }
    safeUpdates.email = emailStr;
  }

  const updatedUser = await User.findByIdAndUpdate(
    targetUserId,
    { $set: safeUpdates },
    { new: true, runValidators: true }
  ).select('-password');

  if (!updatedUser) {
    throw new Error('User account not found');
  }

  return updatedUser;
};

/**
 * Admin: Toggle User Active Status (with Self-Deactivation Protection)
 */
const toggleUserStatusAdmin = async (targetUserId, currentAdminId, isActive) => {
  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new Error('Invalid User ID format');
  }

  // Prevent Admin from deactivating their own account
  if (String(targetUserId) === String(currentAdminId) && (isActive === false || isActive === 'false')) {
    throw new Error('Admin users cannot deactivate their own account');
  }

  const updatedUser = await User.findByIdAndUpdate(
    targetUserId,
    { $set: { isActive: Boolean(isActive) } },
    { new: true }
  ).select('-password');

  if (!updatedUser) {
    throw new Error('User account not found');
  }

  return updatedUser;
};

/**
 * Admin: Create New User Account
 */
const createUserAdmin = async (userData) => {
  const { name, email, password, role, userType, department, collegeId, phone } = userData;

  if (!name || !String(name).trim()) {
    throw new Error('Please provide full name');
  }

  if (!email || !String(email).trim()) {
    throw new Error('Please provide email address');
  }

  if (!password || String(password).length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const emailStr = String(email).trim().toLowerCase();
  const existingUser = await User.findOne({ email: emailStr });
  if (existingUser) {
    throw new Error('User account with this email address already exists');
  }

  let formattedType = 'FACULTY';
  if (userType) {
    formattedType = String(userType).toUpperCase();
    if (!ALLOWED_USER_TYPES.includes(formattedType)) {
      throw new Error(`Invalid userType. Allowed values: ${ALLOWED_USER_TYPES.join(', ')}`);
    }
  }

  let formattedRole = 'USER';
  if (role) {
    formattedRole = String(role).toUpperCase();
    if (!['USER', 'ADMIN'].includes(formattedRole)) {
      throw new Error('Invalid role. Allowed values: USER, ADMIN');
    }
  }

  const newUser = await User.create({
    name: String(name).trim(),
    email: emailStr,
    password: String(password),
    role: formattedRole,
    userType: formattedType,
    department: department ? String(department).trim() : 'General',
    collegeId: collegeId ? String(collegeId).trim() : '',
    phone: phone ? String(phone).trim() : ''
  });

  const createdUser = await User.findById(newUser._id).select('-password');
  return createdUser;
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  updateProfilePhoto,
  changeUserPassword,
  getAllUsersAdmin,
  getUserByIdAdmin,
  updateUserAdmin,
  toggleUserStatusAdmin,
  createUserAdmin
};

