const mongoose = require('mongoose');
const { Hall } = require('../models/Hall');
const { HallBlock } = require('../models/HallBlock');
const { Reservation } = require('../models/Reservation');

/**
 * Check if two time slots overlap in 24-hr HH:mm format.
 * Condition: startA < endB AND endA > startB
 * Adjacent/Touching bounds (e.g., 10:00-12:00 and 12:00-13:00) return FALSE (no overlap).
 */
const checkSlotOverlap = (startA, endA, startB, endB) => {
  return startA < endB && endA > startB;
};

/**
 * Check if two date ranges overlap (YYYY-MM-DD format).
 */
const checkDateRangeOverlap = (startDateA, endDateA, startDateB, endDateB) => {
  return startDateA <= endDateB && endDateA >= startDateB;
};

/**
 * Check if date string is a past date before today (00:00:00)
 */
const isPastDate = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(`${dateStr}T00:00:00`);
  return targetDate < today;
};

/**
 * Comprehensive Hall Availability Service (Maintenance Blocks + PENDING & APPROVED Reservations)
 */
const verifyHallAvailability = async (hallId, targetDate, startTime, endTime) => {
  // 1. Validate Mongoose ObjectId
  if (!mongoose.Types.ObjectId.isValid(hallId)) {
    return { available: false, statusCode: 400, errorMsg: 'Invalid Hall ID format' };
  }

  // 2. Fetch Hall
  const hall = await Hall.findById(hallId);
  if (!hall) {
    return { available: false, statusCode: 404, errorMsg: 'Hall not found' };
  }

  // 3. Verify Hall is Active
  if (!hall.isActive) {
    return { available: false, statusCode: 400, errorMsg: 'Hall is currently disabled/inactive' };
  }

  // 4. Validate Date Format (YYYY-MM-DD)
  if (!targetDate || !/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return { available: false, statusCode: 400, errorMsg: 'Invalid or missing date. Format: YYYY-MM-DD' };
  }

  // 5. Validate Past Date
  if (isPastDate(targetDate)) {
    return { available: false, statusCode: 400, errorMsg: 'Cannot check availability for past dates' };
  }

  // 6. Validate Time Formats (HH:mm)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!startTime || !timeRegex.test(startTime) || !endTime || !timeRegex.test(endTime)) {
    return { available: false, statusCode: 400, errorMsg: 'Invalid or missing time slot. Format: HH:mm 24-hr (e.g. 10:00)' };
  }

  // 7. Validate Start Time < End Time
  if (endTime <= startTime) {
    return { available: false, statusCode: 400, errorMsg: 'End time must be later than start time' };
  }

  // 8. Validate Hall Operating Hours
  if (startTime < hall.openingTime || endTime > hall.closingTime) {
    return {
      available: false,
      statusCode: 400,
      errorMsg: `Requested time slot (${startTime} - ${endTime}) is outside hall operating hours (${hall.openingTime} - ${hall.closingTime})`
    };
  }

  // 9. Check Maintenance / Blocked Slots
  const activeBlocks = await HallBlock.find({
    hall: hallId,
    isActive: true
  });

  for (const block of activeBlocks) {
    if (targetDate >= block.startDate && targetDate <= block.endDate) {
      if (checkSlotOverlap(startTime, endTime, block.startTime, block.endTime)) {
        return {
          available: false,
          statusCode: 200,
          result: {
            available: false,
            reason: `Hall is blocked for ${block.reason.toLowerCase()}${block.notes ? `: ${block.notes}` : ''}`,
            blockedSlot: {
              blockId: block._id,
              reason: block.reason,
              startDate: block.startDate,
              endDate: block.endDate,
              startTime: block.startTime,
              endTime: block.endTime
            }
          }
        };
      }
    }
  }

  // 10. Check Existing Active Reservations (PENDING or APPROVED)
  const activeReservations = await Reservation.find({
    hall: hallId,
    eventDate: targetDate,
    status: { $in: ['PENDING', 'APPROVED'] }
  });

  for (const resItem of activeReservations) {
    if (checkSlotOverlap(startTime, endTime, resItem.startTime, resItem.endTime)) {
      return {
        available: false,
        statusCode: 200,
        result: {
          available: false,
          reason: `Hall has a ${resItem.status.toLowerCase()} reservation for '${resItem.eventTitle}' (${resItem.startTime} - ${resItem.endTime})`,
          reservedSlot: {
            reservationId: resItem._id,
            eventTitle: resItem.eventTitle,
            status: resItem.status,
            eventDate: resItem.eventDate,
            startTime: resItem.startTime,
            endTime: resItem.endTime
          }
        }
      };
    }
  }

  // Slot Available!
  return {
    available: true,
    statusCode: 200,
    result: {
      available: true,
      hallId: hall._id,
      hallName: hall.hallName,
      date: targetDate,
      startTime,
      endTime
    }
  };
};

/**
 * Check if a proposed HallBlock overlaps with an existing active block for the same hall.
 */
const checkBlockConflict = async (hallId, startDate, endDate, startTime, endTime, excludeBlockId = null) => {
  const query = {
    hall: hallId,
    isActive: true
  };

  if (excludeBlockId) {
    query._id = { $ne: excludeBlockId };
  }

  const existingBlocks = await HallBlock.find(query);

  for (const block of existingBlocks) {
    if (checkDateRangeOverlap(startDate, endDate, block.startDate, block.endDate)) {
      if (checkSlotOverlap(startTime, endTime, block.startTime, block.endTime)) {
        return {
          conflict: true,
          conflictingBlock: block
        };
      }
    }
  }

  return { conflict: false };
};

/**
 * Check if a proposed Reservation overlaps with an existing PENDING/APPROVED reservation for the same hall.
 */
const checkReservationConflict = async (hallId, eventDate, startTime, endTime, excludeReservationId = null) => {
  const query = {
    hall: hallId,
    eventDate,
    status: { $in: ['PENDING', 'APPROVED'] }
  };

  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const existingReservations = await Reservation.find(query);

  for (const resItem of existingReservations) {
    if (checkSlotOverlap(startTime, endTime, resItem.startTime, resItem.endTime)) {
      return {
        conflict: true,
        conflictingReservation: resItem
      };
    }
  }

  return { conflict: false };
};

module.exports = {
  checkSlotOverlap,
  checkDateRangeOverlap,
  isPastDate,
  verifyHallAvailability,
  checkBlockConflict,
  checkReservationConflict
};
