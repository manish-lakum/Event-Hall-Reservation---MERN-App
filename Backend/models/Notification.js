const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient user ID is required'],
      index: true
    },
    recipientRole: {
      type: String,
      enum: {
        values: ['USER', 'ADMIN'],
        message: '{VALUE} is not a valid recipient role'
      },
      default: 'USER'
    },
    type: {
      type: String,
      enum: {
        values: [
          'RESERVATION_SUBMITTED',
          'RESERVATION_APPROVED',
          'RESERVATION_REJECTED',
          'RESERVATION_CANCELLED',
          'UPCOMING_RESERVATION',
          'NEW_RESERVATION_REQUEST',
          'USER_CANCELLED_RESERVATION',
          'SYSTEM'
        ],
        message: '{VALUE} is not a valid notification type'
      },
      required: [true, 'Notification type is required']
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reservation',
      default: null,
      index: true
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hall',
      default: null
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Useful Compound Indexes for Fast Queries & Duplicate Prevention
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, reservation: 1, type: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
