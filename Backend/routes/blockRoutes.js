const express = require('express');
const router = express.Router();
const {
  createHallBlock,
  getAdminHallBlocks,
  getHallBlockById,
  updateHallBlock,
  toggleHallBlockStatus,
  deleteHallBlock
} = require('../controllers/blockController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// ----------------------------------------------------
// Admin-Only Hall Block Endpoints (/api/admin/hall-blocks)
// Protected by JWT Protect + ADMIN Role Authorization
// ----------------------------------------------------
router.post('/', protect, authorizeRoles('ADMIN'), createHallBlock);
router.get('/', protect, authorizeRoles('ADMIN'), getAdminHallBlocks);
router.get('/:id', protect, authorizeRoles('ADMIN'), getHallBlockById);
router.patch('/:id', protect, authorizeRoles('ADMIN'), updateHallBlock);
router.put('/:id', protect, authorizeRoles('ADMIN'), updateHallBlock);
router.patch('/:id/status', protect, authorizeRoles('ADMIN'), toggleHallBlockStatus);
router.delete('/:id', protect, authorizeRoles('ADMIN'), deleteHallBlock);

module.exports = router;
