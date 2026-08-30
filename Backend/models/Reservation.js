const mongoose = require('mongoose');

const ALLOWED_EVENT_TYPES = [
  'SEMINAR',
  'WORKSHOP',
  'GUEST_LECTURE',
  'SPORTS',
  'CULTURAL',
  'CLUB_EVENT',
  'DEPARTMENT_EVENT',
  'MEETING',
  'PRESENTATION',
  'COLLEGE_FUNCTION',
  'OTHER'
];

const ALLOWED_RESERVATION_STATUSES = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED'
];

const reservationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: [true, 'Hall reference is required']
    },
    eventTitle: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Event title cannot exceed 200 characters']
    },
    eventType: {
      type: String,
      required: [true, 'Event type is required'],
      enum: {
        values: ALLOWED_EVENT_TYPES,
        message: 'Invalid event type. Allowed: SEMINAR, WORKSHOP, GUEST_LECTURE, SPORTS, CULTURAL, CLUB_EVENT, DEPARTMENT_EVENT, MEETING, PRESENTATION, COLLEGE_FUNCTION, OTHER'
      },
      uppercase: true
    },
    eventDescription: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
      maxlength: [2000, 'Event description cannot exceed 2000 characters']
    },
    eventDate: {
      type: String,
      required: [true, 'Event date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Event date must be in YYYY-MM-DD format']
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm 24-hr format']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm 24-hr format']
    },
    expectedParticipants: {
      type: Number,
      required: [true, 'Expected participants count is required'],
      min: [1, 'Expected participants must be at least 1']
    },
    requestedFacilities: {
      type: [String],
      default: []
    },
    additionalRequirements: {
      type: [String],
      default: []
    },
    additionalNotes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_RESERVATION_STATUSES,
        message: 'Invalid reservation status'
      },
      default: 'PENDING',
      uppercase: true
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: ''
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: ''
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: {
      type: Date
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: {
      type: Date
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast availability & user query lookups
reservationSchema.index({ hall: 1, eventDate: 1, status: 1 });
reservationSchema.index({ user: 1, status: 1 });
reservationSchema.index({ eventDate: 1, startTime: 1, endTime: 1 });

// Pre-save validation: endTime > startTime
reservationSchema.pre('save', function (next) {
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    return next(new Error('End time must be later than start time'));
  }
  if (Array.isArray(this.requestedFacilities)) {
    this.requestedFacilities = [...new Set(this.requestedFacilities.map(f => f.toUpperCase()))];
  }
  next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = {
  Reservation,
  ALLOWED_EVENT_TYPES,
  ALLOWED_RESERVATION_STATUSES
};
