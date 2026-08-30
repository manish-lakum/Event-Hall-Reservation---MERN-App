const mongoose = require('mongoose');
const { Hall, ALLOWED_HALL_TYPES, ALLOWED_FACILITIES } = require('../models/Hall');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Create a new College Hall (Admin Only)
 * @route   POST /api/admin/halls
 * @access  Private (Admin Only)
 */
const createHall = async (req, res, next) => {
  try {
    const {
      hallName,
      hallType,
      description,
      location,
      capacity,
      openingTime,
      closingTime,
      facilities,
      image
    } = req.body;

    // Validate Required Inputs
    if (!hallName || !hallType || !description || !location || capacity === undefined || !openingTime || !closingTime) {
      return sendError(res, 400, 'Please provide all required fields: hallName, hallType, description, location, capacity, openingTime, closingTime');
    }

    // Validate Capacity
    const numCapacity = Number(capacity);
    if (isNaN(numCapacity) || numCapacity <= 0) {
      return sendError(res, 400, 'Capacity must be a positive number greater than 0');
    }

    // Validate Hall Type Enum
    const formattedType = String(hallType).toUpperCase();
    if (!ALLOWED_HALL_TYPES.includes(formattedType)) {
      return sendError(res, 400, `Invalid hall type. Allowed types: ${ALLOWED_HALL_TYPES.join(', ')}`);
    }

    // Validate Opening & Closing Times
    if (closingTime <= openingTime) {
      return sendError(res, 400, 'Closing time must be later than opening time');
    }

    // Validate Facilities if provided
    if (facilities && Array.isArray(facilities)) {
      const invalidFacs = facilities.filter(f => !ALLOWED_FACILITIES.includes(String(f).toUpperCase()));
      if (invalidFacs.length > 0) {
        return sendError(res, 400, `Invalid facility choice: ${invalidFacs.join(', ')}. Allowed: ${ALLOWED_FACILITIES.join(', ')}`);
      }
    }

    // Check for Duplicate Hall Name
    const existingHall = await Hall.findOne({ hallName: { $regex: new RegExp(`^${hallName.trim()}$`, 'i') } });
    if (existingHall) {
      return sendError(res, 400, `A hall with the name '${hallName}' already exists`);
    }

    // Create Hall
    const hall = await Hall.create({
      hallName: hallName.trim(),
      hallType: formattedType,
      description: description.trim(),
      location: location.trim(),
      capacity: numCapacity,
      openingTime,
      closingTime,
      facilities: facilities || [],
      image: image || undefined,
      createdBy: req.user._id
    });

    return sendSuccess(res, 201, 'Hall created successfully', hall);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all active halls for User/Public browsing
 * @route   GET /api/halls
 * @access  Public
 */
const getPublicHalls = async (req, res, next) => {
  try {
    const { search, hallType, minCapacity, facility, page = 1, limit = 10, sort } = req.query;

    // Base query: Only active halls
    const query = { isActive: true };

    // Search filter across hallName, location, description
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { hallName: searchRegex },
        { location: searchRegex },
        { description: searchRegex }
      ];
    }

    // Hall Type filter
    if (hallType) {
      const formattedType = String(hallType).toUpperCase();
      if (ALLOWED_HALL_TYPES.includes(formattedType)) {
        query.hallType = formattedType;
      }
    }

    // Min Capacity filter
    if (minCapacity && !isNaN(Number(minCapacity))) {
      query.capacity = { $gte: Number(minCapacity) };
    }

    // Facility filter
    if (facility) {
      const formattedFac = String(facility).toUpperCase();
      if (ALLOWED_FACILITIES.includes(formattedFac)) {
        query.facilities = formattedFac;
      }
    }

    // Sorting Options
    let sortOption = { createdAt: -1 }; // Default: Newest first
    if (sort === 'capacity_asc') sortOption = { capacity: 1 };
    else if (sort === 'capacity_desc') sortOption = { capacity: -1 };
    else if (sort === 'name_asc') sortOption = { hallName: 1 };
    else if (sort === 'name_desc') sortOption = { hallName: -1 };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Hall.countDocuments(query);
    const halls = await Hall.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Halls retrieved successfully',
      data: halls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get complete hall details by ID
 * @route   GET /api/halls/:id
 * @access  Public / User
 */
const getHallById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Hall ID format');
    }

    const hall = await Hall.findById(id).populate('createdBy', 'name email');

    if (!hall) {
      return sendError(res, 404, 'Hall not found');
    }

    // If inactive and requester is not Admin, return 404
    if (!hall.isActive && (!req.user || req.user.role !== 'ADMIN')) {
      return sendError(res, 404, 'Hall not found or currently inactive');
    }

    return sendSuccess(res, 200, 'Hall retrieved successfully', hall);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all halls (Active & Inactive) for Admin Management
 * @route   GET /api/admin/halls
 * @access  Private (Admin Only)
 */
const getAdminHalls = async (req, res, next) => {
  try {
    const { status, search, hallType, page = 1, limit = 10, sort } = req.query;

    const query = {};

    // Filter by Active / Inactive Status
    if (status === 'active') query.isActive = true;
    else if (status === 'inactive') query.isActive = false;

    // Search filter
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { hallName: searchRegex },
        { location: searchRegex },
        { description: searchRegex }
      ];
    }

    // Hall Type filter
    if (hallType) {
      const formattedType = String(hallType).toUpperCase();
      if (ALLOWED_HALL_TYPES.includes(formattedType)) {
        query.hallType = formattedType;
      }
    }

    // Sorting Options
    let sortOption = { createdAt: -1 };
    if (sort === 'capacity_asc') sortOption = { capacity: 1 };
    else if (sort === 'capacity_desc') sortOption = { capacity: -1 };
    else if (sort === 'name_asc') sortOption = { hallName: 1 };

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Hall.countDocuments(query);
    const halls = await Hall.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('createdBy', 'name email');

    const totalPages = Math.ceil(total / limitNum) || 1;

    return res.status(200).json({
      success: true,
      message: 'Admin halls retrieved successfully',
      data: halls,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update Hall specifications (Admin Only)
 * @route   PUT /api/admin/halls/:id
 * @access  Private (Admin Only)
 */
const updateHall = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Hall ID format');
    }

    const hall = await Hall.findById(id);
    if (!hall) {
      return sendError(res, 404, 'Hall not found');
    }

    const {
      hallName,
      hallType,
      description,
      location,
      capacity,
      openingTime,
      closingTime,
      facilities,
      image
    } = req.body;

    // Validate Capacity if provided
    if (capacity !== undefined) {
      const numCapacity = Number(capacity);
      if (isNaN(numCapacity) || numCapacity <= 0) {
        return sendError(res, 400, 'Capacity must be a positive number greater than 0');
      }
      hall.capacity = numCapacity;
    }

    // Validate Hall Type if provided
    if (hallType) {
      const formattedType = String(hallType).toUpperCase();
      if (!ALLOWED_HALL_TYPES.includes(formattedType)) {
        return sendError(res, 400, `Invalid hall type. Allowed types: ${ALLOWED_HALL_TYPES.join(', ')}`);
      }
      hall.hallType = formattedType;
    }

    // Validate Times if provided
    const newOpening = openingTime || hall.openingTime;
    const newClosing = closingTime || hall.closingTime;
    if (newClosing <= newOpening) {
      return sendError(res, 400, 'Closing time must be later than opening time');
    }

    // Check duplicate name if hallName is updated
    if (hallName && hallName.trim().toLowerCase() !== hall.hallName.toLowerCase()) {
      const existingName = await Hall.findOne({
        _id: { $ne: id },
        hallName: { $regex: new RegExp(`^${hallName.trim()}$`, 'i') }
      });
      if (existingName) {
        return sendError(res, 400, `A hall with the name '${hallName}' already exists`);
      }
      hall.hallName = hallName.trim();
    }

    // Update other fields
    if (description !== undefined) hall.description = description.trim();
    if (location !== undefined) hall.location = location.trim();
    if (openingTime !== undefined) hall.openingTime = openingTime;
    if (closingTime !== undefined) hall.closingTime = closingTime;
    if (image !== undefined) hall.image = image;

    if (facilities && Array.isArray(facilities)) {
      const invalidFacs = facilities.filter(f => !ALLOWED_FACILITIES.includes(String(f).toUpperCase()));
      if (invalidFacs.length > 0) {
        return sendError(res, 400, `Invalid facility choice: ${invalidFacs.join(', ')}`);
      }
      hall.facilities = facilities;
    }

    const updatedHall = await hall.save();

    return sendSuccess(res, 200, 'Hall updated successfully', updatedHall);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle Hall Active Status (Admin Only)
 * @route   PATCH /api/admin/halls/:id/status
 * @access  Private (Admin Only)
 */
const toggleHallStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Hall ID format');
    }

    const hall = await Hall.findById(id);
    if (!hall) {
      return sendError(res, 404, 'Hall not found');
    }

    // If req.body.isActive is explicitly passed, use it; otherwise toggle boolean
    if (req.body && typeof req.body.isActive === 'boolean') {
      hall.isActive = req.body.isActive;
    } else {
      hall.isActive = !hall.isActive;
    }

    const updatedHall = await hall.save();

    return sendSuccess(res, 200, `Hall status updated successfully to ${updatedHall.isActive ? 'Active' : 'Inactive'}`, updatedHall);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a Hall (Admin Only)
 * @route   DELETE /api/admin/halls/:id
 * @access  Private (Admin Only)
 */
const deleteHall = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Hall ID format');
    }

    const hall = await Hall.findById(id);
    if (!hall) {
      return sendError(res, 404, 'Hall not found');
    }

    await Hall.findByIdAndDelete(id);

    return sendSuccess(res, 200, 'Hall deleted successfully', { _id: id, hallName: hall.hallName });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createHall,
  getPublicHalls,
  getHallById,
  getAdminHalls,
  updateHall,
  toggleHallStatus,
  deleteHall
};
