const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// All profile endpoints require JWT authentication
router.use(protect);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.patch('/change-password', changePassword);

module.exports = router;
