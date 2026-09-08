const {
  getUserProfile,
  updateUserProfile,
  updateProfilePhoto,
  changeUserPassword
} = require('../services/userService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get Current Logged-in User Profile
 * @route   GET /api/profile
 * @access  Private (User / Admin)
 */
const getProfile = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user._id);
    return sendSuccess(res, 200, 'Profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Current Logged-in User Profile
 * @route   PATCH /api/profile
 * @access  Private (User / Admin)
 */
const updateProfile = async (req, res, next) => {
  try {
    const updatedProfile = await updateUserProfile(req.user._id, req.body);
    return sendSuccess(res, 200, 'Profile updated successfully', updatedProfile);
  } catch (error) {
    if (error.message.includes('Invalid userType') || error.message.includes('empty')) {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Upload / Update Current Logged-in User Profile Photo
 * @route   PATCH /api/profile/photo
 * @access  Private (User / Admin)
 */
const uploadPhoto = async (req, res, next) => {
  try {
    const { profilePhoto } = req.body;
    if (!profilePhoto) {
      return sendError(res, 400, 'Please select a profile photo to upload.');
    }

    const updatedUser = await updateProfilePhoto(req.user._id, profilePhoto);
    return sendSuccess(res, 200, 'Profile photo updated successfully', { user: updatedUser });
  } catch (error) {
    if (
      error.message.includes('required') ||
      error.message.includes('Invalid image format') ||
      error.message.includes('supported')
    ) {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
};

/**
 * @desc    Change Current Logged-in User Password
 * @route   PATCH /api/profile/change-password
 * @access  Private (User / Admin)
 */
const changePassword = async (req, res, next) => {
  try {
    await changeUserPassword(req.user._id, req.body);
    return sendSuccess(res, 200, 'Password changed successfully', {});
  } catch (error) {
    if (
      error.message.includes('incorrect') ||
      error.message.includes('not match') ||
      error.message.includes('different') ||
      error.message.includes('provide') ||
      error.message.includes('least 6')
    ) {
      return sendError(res, 400, error.message);
    }
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadPhoto,
  changePassword
};
