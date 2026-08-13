const mongoose = require('mongoose');

const TYPES = [
  'RSVP_CREATED',
  'RSVP_UPDATED',
  'EVENT_UPDATED',
  'EVENT_CANCELLED',
  'EVENT_CAPACITY',
];

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    relatedEvent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.statics.TYPES = TYPES;

module.exports = mongoose.model('Notification', notificationSchema);
