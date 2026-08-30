const mongoose = require('mongoose');
const { Reservation, ALLOWED_EVENT_TYPES } = require('../models/Reservation');
const { Hall } = require('../models/Hall');
const {
  verifyHallAvailability,
  checkBlockConflict,
  checkReservationConflict,
  isPastDate
} = require('../services/availabilityService');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { notifyUser, notifyAdmins } = require('../services/notificationService');

/**
 * @desc    Submit a new Hall Reservation Request (User / Admin)
 * @route   POST /api/reservations
 * @access  Private
 */
const createReservation = async (req, res, next) => {
  try {
    const {
      hallId,
      eventTitle,
      eventType,
      eventDescription,
      eventDate,
      startTime,
      endTime,
      expectedParticipants,
      requestedFacilities,
      additionalRequirements,
      additionalNotes
    } = req.body;

    // Validate Required Inputs
    if (!hallId || !eventTitle || !eventType || !eventDescription || !eventDate || !startTime || !endTime || expectedParticipants === undefined) {
      return sendError(res, 400, 'Please provide all required fields: hallId, eventTitle, eventType, eventDescription, eventDate, startTime, endTime, expectedParticipants');
    }

    // Validate Hall ObjectId
    if (!mongoose.Types.ObjectId.isValid(hallId)) {
      return sendError(res, 400, 'Invalid Hall ID format');
    }

    // Fetch Hall
    const hall = await Hall.findById(hallId);
    if (!hall) {
      return sendError(res, 404, 'Hall not found');
    }

    if (!hall.isActive) {
      return sendError(res, 400, 'Hall is currently disabled/inactive and cannot be reserved');
    }

    // Validate Past Date
    if (isPastDate(eventDate)) {
      return sendError(res, 400, 'Cannot create reservations for past dates');
    }

    // Validate Time Format (HH:mm)
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
        `Reservation time slot (${startTime} - ${endTime}) is outside hall operating hours (${hall.openingTime} - ${hall.closingTime})`
      );
    }

    // Validate Event Type Enum
    const formattedEventType = String(eventType).toUpperCase();
    if (!ALLOWED_EVENT_TYPES.includes(formattedEventType)) {
      return sendError(res, 400, `Invalid event type. Allowed: ${ALLOWED_EVENT_TYPES.join(', ')}`);
    }

    // Validate Expected Participants <= Hall Capacity
    const numParticipants = Number(expectedParticipants);
    if (isNaN(numParticipants) || numParticipants < 1) {
      return sendError(res, 400, 'Expected participants must be a positive number greater than 0');
    }
    if (numParticipants > hall.capacity) {
      return sendError(res, 400, `Expected participants (${numParticipants}) exceeds selected hall capacity (${hall.capacity})`);
    }

    // Validate Requested Facilities against Hall Provided Facilities
    let reqFacilitiesArr = [];
    if (requestedFacilities && Array.isArray(requestedFacilities)) {
      reqFacilitiesArr = [...new Set(requestedFacilities.map(f => String(f).toUpperCase()))];
      const unsupported = reqFacilitiesArr.filter(f => !hall.facilities.includes(f));
      if (unsupported.length > 0) {
        return sendError(
          res,
          400,
          `Selected hall does not provide the requested facility: ${unsupported.join(', ')}. Available facilities: ${hall.facilities.join(', ')}`
        );
      }
    }

    // Check for Duplicate Reservation Request by Same User for Same Slot
    const existingDuplicate = await Reservation.findOne({
      user: req.user._id,
      hall: hallId,
      eventDate,
      startTime,
      endTime,
      status: { $in: ['PENDING', 'APPROVED'] }
    });
    if (existingDuplicate) {
      return sendError(res, 409, 'Reservation request already exists for this slot');
    }

    // Check Maintenance Block Conflicts
    const blockConflict = await checkBlockConflict(hallId, eventDate, eventDate, startTime, endTime);
    if (blockConflict.conflict) {
      return sendError(res, 409, 'Selected time slot is unavailable due to scheduled hall maintenance');
    }

    // Check Reservation Conflicts (PENDING or APPROVED)
    const reservationConflict = await checkReservationConflict(hallId, eventDate, startTime, endTime);
    if (reservationConflict.conflict) {
      return sendError(
        res,
        409,
        `Hall is already reserved or pending approval for the selected time slot (${reservationConflict.conflictingReservation.startTime} - ${reservationConflict.conflictingReservation.endTime})`
      );
    }

    // Create Reservation with Default Status PENDING
    const reservation = await Reservation.create({
      user: req.user._id,
      hall: hallId,
      eventTitle: eventTitle.trim(),
      eventType: formattedEventType,
      eventDescription: eventDescription.trim(),
      eventDate,
      startTime,
      endTime,
      expectedParticipants: numParticipants,
      requestedFacilities: reqFacilitiesArr,
      additionalRequirements: Array.isArray(additionalRequirements) ? additionalRequirements : (additionalRequirements ? [additionalRequirements] : []),
      additionalNotes: additionalNotes ? additionalNotes.trim() : '',
      status: 'PENDING'
    });

    const populatedRes = await Reservation.findById(reservation._id)
      .populate('user', 'name email userType department collegeId phone')
      .populate('hall', 'hallName hallType location capacity image');

    // Trigger Notifications Safely
    try {
      await notifyUser({
        userId: req.user._id,
        type: 'RESERVATION_SUBMITTED',
        title: 'Reservation Submitted',
        message: `Your reservation request for '${eventTitle}' at ${hall.hallName} has been submitted and is waiting for admin approval.`,
        reservationId: reservation._id,
        hallId: hall._id
      });

      await notifyAdmins({
        type: 'NEW_RESERVATION_REQUEST',
        title: 'New Reservation Request',
        message: `New reservation request received from ${req.user.name} for '${eventTitle}' at ${hall.hallName}.`,
        reservationId: reservation._id,
        hallId: hall._id
      });
    } catch (notifErr) {
      console.error('[Notification Trigger Error]', notifErr.message);
    }

    return sendSuccess(res, 201, 'Reservation request submitted successfully', populatedRes);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get Logged-in User's Reservations
 * @route   GET /api/reservations/my
 * @access  Private (User)
 */
const getMyReservations = async (req, res, next) => {
  try {
    const { status, hallId, startDate, endDate, search, page = 1, limit = 10, sort } = req.query;

    const query = { user: req.user._id };

    if (status) {
      query.status = String(status).toUpperCase();
    }

    if (hallId && mongoose.Types.ObjectId.isValid(hallId)) {
      query.hall = hallId;
    }

    if (startDate && endDate) {
      query.eventDate = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.eventDate = { $gte: startDate };
    } else if (endDate) {
      query.eventDate = { $lte: endDate };
    }

    if (search) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ eventTitle: searchRegex }, { eventDescription: searchRegex }];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'date_asc') sortOption = { eventDate: 1, startTime: 1 };
    else if (sort === 'date_desc') sortOption = { eventDate: -1, startTime: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Reservation.countDocuments(query);
    const reservations = await Reservation.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('hall', 'hallName hallType location capacity image openingTime closingTime');

    return res.status(200).json({
      success: true,
      message: 'My reservations retrieved successfully',
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
 * @desc    Get Single Reservation Details by ID
 * @route   GET /api/reservations/:id
 * @access  Private (User / Admin)
 */
const getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Reservation ID format');
    }

    const reservation = await Reservation.findById(id)
      .populate('user', 'name email userType department collegeId phone')
      .populate('hall', 'hallName hallType location capacity image facilities openingTime closingTime');

    if (!reservation) {
      return sendError(res, 404, 'Reservation not found');
    }

    if (reservation.user._id.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return sendError(res, 403, 'Access denied. You can only view your own reservations');
    }

    return sendSuccess(res, 200, 'Reservation details retrieved successfully', reservation);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel a Pending or Approved Reservation (User)
 * @route   PATCH /api/reservations/:id/cancel
 * @access  Private (User)
 */
const cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 400, 'Invalid Reservation ID format');
    }

    const reservation = await Reservation.findById(id);
    if (!reservation) {
      return sendError(res, 404, 'Reservation not found');
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied. You can only cancel your own reservations');
    }

    if (reservation.status === 'CANCELLED') {
      return sendError(res, 400, 'Reservation is already cancelled');
    }

    if (reservation.status === 'REJECTED' || reservation.status === 'COMPLETED') {
      return sendError(res, 400, `Cannot cancel a reservation that is already ${reservation.status.toLowerCase()}`);
    }

    if (isPastDate(reservation.eventDate)) {
      return sendError(res, 400, 'Cannot cancel past or already completed events');
    }

    const { reason } = req.body;

    reservation.status = 'CANCELLED';
    reservation.cancellationReason = reason ? String(reason).trim() : 'Cancelled by user';
    reservation.cancelledBy = req.user._id;
    reservation.cancelledAt = new Date();

    const updatedReservation = await reservation.save();
    const populated = await Reservation.findById(updatedReservation._id)
      .populate('user', 'name email')
      .populate('hall', 'hallName location hallType');

    // Trigger Notifications Safely
    try {
      await notifyUser({
        userId: req.user._id,
        type: 'RESERVATION_CANCELLED',
        title: 'Reservation Cancelled',
        message: `Your reservation for '${populated.eventTitle}' at ${populated.hall?.hallName} was cancelled successfully.`,
        reservationId: populated._id,
        hallId: populated.hall?._id
      });

      await notifyAdmins({
        type: 'USER_CANCELLED_RESERVATION',
        title: 'User Cancelled Reservation',
        message: `Reservation '${populated.eventTitle}' for ${populated.hall?.hallName} was cancelled by user ${req.user.name}.`,
        reservationId: populated._id,
        hallId: populated.hall?._id
      });
    } catch (notifErr) {
      console.error('[Notification Trigger Error]', notifErr.message);
    }

    return sendSuccess(res, 200, 'Reservation cancelled successfully', populated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  cancelReservation
};
