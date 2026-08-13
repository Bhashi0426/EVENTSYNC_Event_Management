const mongoose = require('mongoose');

const RESPONSES = ['going', 'maybe', 'not_going'];

const rsvpSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    response: {
      type: String,
      enum: RESPONSES,
      required: true,
    },
  },
  { timestamps: true }
);

// A user may hold only one RSVP per event.
rsvpSchema.index({ event: 1, user: 1 }, { unique: true });

rsvpSchema.statics.RESPONSES = RESPONSES;

module.exports = mongoose.model('RSVP', rsvpSchema);
