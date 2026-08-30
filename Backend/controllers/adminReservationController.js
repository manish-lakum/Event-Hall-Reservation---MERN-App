const mongoose = require('mongoose');
const { Reservation } = require('../models/Reservation');
const { Hall } = require('../models/Hall');
const User = require('../models/userModel');
const {
  checkBlockConflict,
  checkReservationConflict,
  isPastDate
} = require('../services/availabilityService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { notifyUser } = require('../services/notificationService');

/**
 * @desc    Get all reservations for Admin Management with filters & search
 * @route   GET /api/admin/reservations
 * @access  Private (Admin Only)
 */
const getAllReservations = async (req, res, next) => {
  try {
    const {
      status,
      hallId,
      userId,
      userType,
      eventType,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sort
    } = req.query;

    const query = {};

    if (status) {
      query.status = String(status).toUpperCase();
    }

    if (hallId && mongoose.Types.ObjectId.isValid(hallId)) {
      query.hall = hallId;
    }

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.user = userId;
    }

    if (eventType) {
      query.eventType = String(eventType).toUpperCase();
    }

    if (startDate && endDate) {
      query.eventDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.eventDate = { $gte: startDate };
    } else if (endDate) {
      query.eventDate = { $lte: endDate };
    }

    // Filter by userType if provided
    if (userType) {
      const usersWithType = await User.find({ userType: String(userType).toUpperCase() }).select('_id');
      const userIds = usersWithType.map(u => u._id);
      query.user = { $in: userIds };
    }

    // Search filter across eventTitle, user name, user email, hall name
    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      const matchingUsers = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }]
      }).select('_id');
      const matchingUserIds = matchingUsers.map(u => u._id);

      const matchingHalls = await Hall.find({ hallName: searchRegex }).select('_id');
      const matchingHallIds = matchingHalls.map(h => h._id);

      query.$or = [
        { eventTitle: searchRegex },
        { eventDescription: searchRegex },
        { user: { $in: matchingUserIds } },
        { hall: { $in: matchingHallIds } }
      ];
    }

    // Sorting Options
    let sortOption = { createdAt: -1 }; // Default: newest request first
    if (sort === 'createdAt_asc') sortOption = { createdAt: 1 };
    else if (sort === 'eventDate_asc') sortOption = { eventDate: 1, startTime: 1 };
    else if (sort === 'eventDate_desc') sortOption = { eventDate: -1, startTime: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Reservation.countDocuments(query);
    const reservations = await Reservation.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email userType department collegeId phone')
      .populate('hall', 'hallName hallType location capacity image')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('cancelledBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Admin reservations retrieved successfully',
      data: reservations,
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
 * @desc    Get complete reservation details by ID (Admin Only)
 * @route   GET /api/admin/reservations/:id
 * @access  Private (Admin Only)
 */
const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Reservation ID format');
    }

    const reservation = await Reservation.findById(id)
      .populate('user', 'name email userType department collegeId phone')
      .populate('hall', 'hallName hallType location capacity openingTime closingTime facilities image')
      .populate('approvedBy', 'name email')
      .populate('rejectedBy', 'name email')
      .populate('cancelledBy', 'name email');

    if (!reservation) {
      return sendError(res, 404, 'Reservation not found');
    }

    return sendSuccess(res, 200, 'Reservation details retrieved successfully', reservation);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Approve a Pending Reservation (Admin Only)
 * @route   PATCH /api/admin/reservations/:id/approve
 * @access  Private (Admin Only)
 */
const approveReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Reservation ID format');
    }

    const reservation = await Reservation.findById(id).populate('hall');
    if (!reservation) {
      return sendError(res, 404, 'Reservation not found');
    }

    // 1. Status Transition Validation (Only PENDING -> APPROVED allowed)
    if (reservation.status === 'CANCELLED') {
      return sendError(res, 400, 'Cancelled reservation cannot be approved');
    }
    if (reservation.status === 'APPROVED') {
      return sendError(res, 400, 'Reservation is already approved');
    }
    if (reservation.status === 'REJECTED') {
      return sendError(res, 400, 'Rejected reservation cannot be approved');
    }
    if (reservation.status === 'COMPLETED') {
      return sendError(res, 400, 'Completed reservation cannot be approved');
    }

    // 2. Past Date Safety Check
    if (isPastDate(reservation.eventDate)) {
      return sendError(res, 400, 'Past reservation cannot be approved');
    }

    // 3. Hall Active Safety Check
    const hall = reservation.hall;
    if (!hall || !hall.isActive) {
      return sendError(res, 400, 'Hall is currently disabled/inactive and cannot be approved');
    }

    // 4. Maintenance Block Conflict Check
    const blockConflict = await checkBlockConflict(
      hall._id,
      reservation.eventDate,
      reservation.eventDate,
      reservation.startTime,
      reservation.endTime
    );
    if (blockConflict.conflict) {
      return sendError(
        res,
        409,
        'Cannot approve. Selected time slot overlaps with a scheduled hall maintenance block'
      );
    }

    // 5. Approved Reservation Conflict Check (excluding current reservation ID)
    const approvedConflict = await Reservation.findOne({
      _id: { $ne: reservation._id },
      hall: hall._id,
      eventDate: reservation.eventDate,
      status: 'APPROVED',
      startTime: { $lt: reservation.endTime },
      endTime: { $gt: reservation.startTime }
    });

    if (approvedConflict) {
      return sendError(
        res,
        409,
        'Another reservation has already been approved for this hall and time slot'
      );
    }

    // 6. Atomic MongoDB Update (Guarantees current status is PENDING)
    const remarks = req.body.remarks ? String(req.body.remarks).trim() : reservation.adminRemarks;

    const updatedReservation = await Reservation.findOneAndUpdate(
      { _id: id, status: 'PENDING' },
      {
        $set: {
          status: 'APPROVED',
          approvedBy: req.user._id,
          approvedAt: new Date(),
          adminRemarks: remarks
        }
      },
      { new: true }
    )
      .populate('user', 'name email userType department collegeId')
      .populate('hall', 'hallName hallType location capacity')
      .populate('approvedBy', 'name email');

    if (!updatedReservation) {
      return sendError(res, 400, 'Failed to approve. Reservation is no longer in PENDING status');
    }

    // Trigger Notification Safely
    try {
      await notifyUser({
        userId: updatedReservation.user._id,
        type: 'RESERVATION_APPROVED',
        title: 'Reservation Approved',
        message: `Your reservation for '${updatedReservation.eventTitle}' at ${updatedReservation.hall?.hallName} on ${updatedReservation.eventDate} from ${updatedReservation.startTime} to ${updatedReservation.endTime} has been approved.`,
        reservationId: updatedReservation._id,
        hallId: updatedReservation.hall?._id,
        metadata: { eventDate: updatedReservation.eventDate, startTime: updatedReservation.startTime, endTime: updatedReservation.endTime }
      });
    } catch (notifErr) {
      console.error('[Notification Trigger Error]', notifErr.message);
    }

    return sendSuccess(res, 200, 'Reservation approved successfully', updatedReservation);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject a Pending Reservation (Admin Only)
 * @route   PATCH /api/admin/reservations/:id/reject
 * @access  Private (Admin Only)
 */
const rejectReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Reservation ID format');
    }

    const { reason } = req.body;
    if (!reason || String(reason).trim().length === 0) {
      return sendError(res, 400, 'Rejection reason is required');
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return sendError(res, 404, 'Reservation not found');
    }

    // Status Transition Validation (Only PENDING -> REJECTED allowed)
    if (reservation.status === 'CANCELLED') {
      return sendError(res, 400, 'Cancelled reservation cannot be rejected');
    }
    if (reservation.status === 'REJECTED') {
      return sendError(res, 400, 'Reservation is already rejected');
    }
    if (reservation.status === 'APPROVED') {
      return sendError(res, 400, 'Approved reservation cannot be rejected');
    }
    if (reservation.status === 'COMPLETED') {
      return sendError(res, 400, 'Completed reservation cannot be rejected');
    }

    // Atomic MongoDB Update
    const updatedReservation = await Reservation.findOneAndUpdate(
      { _id: id, status: 'PENDING' },
      {
        $set: {
          status: 'REJECTED',
          rejectedBy: req.user._id,
          rejectedAt: new Date(),
          adminRemarks: String(reason).trim()
        }
      },
      { new: true }
    )
      .populate('user', 'name email userType department collegeId')
      .populate('hall', 'hallName hallType location capacity')
      .populate('rejectedBy', 'name email');

    if (!updatedReservation) {
      return sendError(res, 400, 'Failed to reject. Reservation is no longer in PENDING status');
    }

    // Trigger Notification Safely
    try {
      await notifyUser({
        userId: updatedReservation.user._id,
        type: 'RESERVATION_REJECTED',
        title: 'Reservation Rejected',
        message: `Your reservation request for '${updatedReservation.eventTitle}' was rejected. Reason: ${updatedReservation.adminRemarks}`,
        reservationId: updatedReservation._id,
        hallId: updatedReservation.hall?._id,
        metadata: { reason: updatedReservation.adminRemarks }
      });
    } catch (notifErr) {
      console.error('[Notification Trigger Error]', notifErr.message);
    }

    return sendSuccess(res, 200, 'Reservation rejected successfully', updatedReservation);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllReservations,
  getReservationById,
  approveReservation,
  rejectReservation
};
