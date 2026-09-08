const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadPhoto, changePassword } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// All profile endpoints require JWT authentication
router.use(protect);

router.get('/', getProfile);
router.put('/', updateProfile);
router.patch('/', updateProfile);
router.put('/photo', uploadPhoto);
router.patch('/photo', uploadPhoto);
router.put('/me/profile-photo', uploadPhoto);
router.patch('/me/profile-photo', uploadPhoto);
router.put('/change-password', changePassword);
router.patch('/change-password', changePassword);

module.exports = router;
