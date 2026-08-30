const mongoose = require('mongoose');

const ALLOWED_BLOCK_REASONS = [
  'MAINTENANCE',
  'EXAMINATION',
  'COLLEGE_FUNCTION',
  'CLEANING',
  'TECHNICAL_WORK',
  'ADMINISTRATIVE_USE',
  'OTHER'
];

const hallBlockSchema = new mongoose.Schema(
  {
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      required: [true, 'Hall reference is required']
    },
    startDate: {
      type: String,
      required: [true, 'Start date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format']
    },
    endDate: {
      type: String,
      required: [true, 'End date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format']
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
    reason: {
      type: String,
      required: [true, 'Reason for block is required'],
      enum: {
        values: ALLOWED_BLOCK_REASONS,
        message: 'Invalid block reason. Allowed: MAINTENANCE, EXAMINATION, COLLEGE_FUNCTION, CLEANING, TECHNICAL_WORK, ADMINISTRATIVE_USE, OTHER'
      },
      uppercase: true,
      default: 'MAINTENANCE'
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creating admin user reference is required']
    }
  },
  {
    timestamps: true
  }
);

// Validation Hooks: Ensure endDate >= startDate & endTime > startTime
hallBlockSchema.pre('save', function (next) {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    return next(new Error('End date cannot be earlier than start date'));
  }
  if (this.startTime && this.endTime && this.endTime <= this.startTime) {
    return next(new Error('End time must be later than start time'));
  }
  next();
});

const HallBlock = mongoose.model('HallBlock', hallBlockSchema);

module.exports = {
  HallBlock,
  ALLOWED_BLOCK_REASONS
};
