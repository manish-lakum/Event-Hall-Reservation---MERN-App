const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus
} = require('../controllers/adminUserController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All Admin User Management routes require JWT Protect + ADMIN Role Authorization
router.use(protect, authorizeRoles('ADMIN'));

router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.patch('/:id', updateUser);
router.patch('/:id/status', toggleUserStatus);

module.exports = router;
