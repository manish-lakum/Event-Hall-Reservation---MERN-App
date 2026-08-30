const mongoose = require('mongoose');
const { Hall } = require('../models/Hall');
const { HallBlock, ALLOWED_BLOCK_REASONS } = require('../models/HallBlock');
const { checkBlockConflict, isPastDate } = require('../services/availabilityService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Create a new Hall Maintenance / Block Slot (Admin Only)
 * @route   POST /api/admin/hall-blocks
 * @access  Private (Admin Only)
 */
const createHallBlock = async (req, res, next) => {
  try {
    const {
      hallId,
      startDate,
      endDate,
      startTime,
      endTime,
      reason,
      notes
    } = req.body;

    // Validate Required Inputs
    if (!hallId || !startDate || !endDate || !startTime || !endTime) {
      return sendError(res, 400, 'Please provide all required fields: hallId, startDate, endDate, startTime, endTime');
    }

    // Validate Hall ObjectId
    if (!mongoose.Types.ObjectId.isValid(hallId)) {
      return sendError(res, 400, 'Invalid Hall ID format');
    }

    // Find Hall
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return sendError(res, 404, 'Hall not found');
    }

    // Check Past Date
    if (isPastDate(startDate)) {
      return sendError(res, 400, 'Cannot create maintenance blocks for past dates');
    }

    // Validate Date Order (endDate >= startDate)
    if (endDate < startDate) {
      return sendError(res, 400, 'End date cannot be earlier than start date');
    }

    // Validate Time Format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return sendError(res, 400, 'Time format must be HH:mm 24-hr (e.g. 10:00)');
    }

    // Validate Time Order (endTime > startTime)
    if (endTime <= startTime) {
      return sendError(res, 400, 'End time must be later than start time');
    }

    // Validate Hall Operating Hours
    if (startTime < hall.openingTime || endTime > hall.closingTime) {
      return sendError(
        res,
        400,
        `Block time slot (${startTime} - ${endTime}) is outside hall operating hours (${hall.openingTime} - ${hall.closingTime})`
      );
    }

    // Validate Reason Enum
    const formattedReason = reason ? String(reason).toUpperCase() : 'MAINTENANCE';
    if (!ALLOWED_BLOCK_REASONS.includes(formattedReason)) {
      return sendError(res, 400, `Invalid block reason. Allowed: ${ALLOWED_BLOCK_REASONS.join(', ')}`);
    }

    // Check for Overlapping Active Blocks (Returns 409 Conflict)
    const conflictCheck = await checkBlockConflict(hallId, startDate, endDate, startTime, endTime);
    if (conflictCheck.conflict) {
      return sendError(res, 409, 'Hall already has a blocked slot during the selected time');
    }

    // Create Hall Block
    const block = await HallBlock.create({
      hall: hallId,
      startDate,
      endDate,
      startTime,
      endTime,
      reason: formattedReason,
      notes: notes || '',
      createdBy: req.user._id
    });

    const populatedBlock = await HallBlock.findById(block._id)
      .populate('hall', 'hallName location hallType capacity')
      .populate('createdBy', 'name email');

    return sendSuccess(res, 201, 'Hall block created successfully', populatedBlock);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all Hall Blocks with filters (Admin Only)
 * @route   GET /api/admin/hall-blocks
 * @access  Private (Admin Only)
 */
const getAdminHallBlocks = async (req, res, next) => {
  try {
    const { hallId, reason, isActive, startDate, endDate, page = 1, limit = 10 } = req.query;

    const query = {};

    if (hallId && mongoose.Types.ObjectId.isValid(hallId)) {
      query.hall = hallId;
    }

    if (reason) {
      query.reason = String(reason).toUpperCase();
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true' || isActive === true;
    }

    if (startDate && endDate) {
      query.startDate = { $lte: endDate };
      query.endDate = { $gte: startDate };
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await HallBlock.countDocuments(query);
    const blocks = await HallBlock.find(query)
      .sort({ startDate: -1, startTime: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('hall', 'hallName location hallType capacity')
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Hall blocks retrieved successfully',
      data: blocks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single Hall Block details by ID (Admin Only)
 * @route   GET /api/admin/hall-blocks/:id
 * @access  Private (Admin Only)
 */
const getHallBlockById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Hall Block ID format');
    }

    const block = await HallBlock.findById(id)
      .populate('hall', 'hallName location hallType capacity openingTime closingTime')
      .populate('createdBy', 'name email');

    if (!block) {
      return sendError(res, 404, 'Hall block not found');
    }

    return sendSuccess(res, 200, 'Hall block details retrieved successfully', block);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Hall Block details (Admin Only)
 * @route   PATCH /api/admin/hall-blocks/:id
 * @access  Private (Admin Only)
 */
const updateHallBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Hall Block ID format');
    }

    const block = await HallBlock.findById(id);
    if (!block) {
      return sendError(res, 404, 'Hall block not found');
    }

    const { startDate, endDate, startTime, endTime, reason, notes } = req.body;

    const newStartD = startDate || block.startDate;
    const newEndD = endDate || block.endDate;
    const newStartT = startTime || block.startTime;
    const newEndT = endTime || block.endTime;

    // Validate Date Order
    if (newEndD < newStartD) {
      return sendError(res, 400, 'End date cannot be earlier than start date');
    }

    // Validate Time Order
    if (newEndT <= newStartT) {
      return sendError(res, 400, 'End time must be later than start time');
    }

    // Fetch Hall to validate operating hours
    const hall = await Hall.findById(block.hall);
    if (hall) {
      if (newStartT < hall.openingTime || newEndT > hall.closingTime) {
        return sendError(res, 400, `Updated time slot is outside hall operating hours (${hall.openingTime} - ${hall.closingTime})`);
      }
    }

    // Re-check conflict excluding current block
    const conflictCheck = await checkBlockConflict(block.hall, newStartD, newEndD, newStartT, newEndT, id);
    if (conflictCheck.conflict) {
      return sendError(res, 409, 'Hall already has a conflicting blocked slot during the updated time range');
    }

    // Update fields
    if (startDate) block.startDate = startDate;
    if (endDate) block.endDate = endDate;
    if (startTime) block.startTime = startTime;
    if (endTime) block.endTime = endTime;
    if (reason) block.reason = String(reason).toUpperCase();
    if (notes !== undefined) block.notes = notes;

    const updatedBlock = await block.save();
    const populated = await HallBlock.findById(updatedBlock._id)
      .populate('hall', 'hallName location hallType')
      .populate('createdBy', 'name email');

    return sendSuccess(res, 200, 'Hall block updated successfully', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle or update Hall Block Active Status (Admin Only)
 * @route   PATCH /api/admin/hall-blocks/:id/status
 * @access  Private (Admin Only)
 */
const toggleHallBlockStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Hall Block ID format');
    }

    const block = await HallBlock.findById(id);
    if (!block) {
      return sendError(res, 404, 'Hall block not found');
    }

    if (req.body && typeof req.body.isActive === 'boolean') {
      block.isActive = req.body.isActive;
    } else {
      block.isActive = !block.isActive;
    }

    const updatedBlock = await block.save();

    return sendSuccess(
      res,
      200,
      `Hall block status updated to ${updatedBlock.isActive ? 'Active' : 'Inactive'}`,
      updatedBlock
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Hall Block (Admin Only)
 * @route   DELETE /api/admin/hall-blocks/:id
 * @access  Private (Admin Only)
 */
const deleteHallBlock = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Hall Block ID format');
    }

    const block = await HallBlock.findById(id);
    if (!block) {
      return sendError(res, 404, 'Hall block not found');
    }

    await HallBlock.findByIdAndDelete(id);

    return sendSuccess(res, 200, 'Hall block deleted successfully', { _id: id });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHallBlock,
  getAdminHallBlocks,
  getHallBlockById,
  updateHallBlock,
  toggleHallBlockStatus,
  deleteHallBlock
};
