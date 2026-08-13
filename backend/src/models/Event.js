const mongoose = require('mongoose');

const CATEGORIES = [
  'Technology',
  'Business',
  'Education',
  'Health',
  'Sports',
  'Music',
  'Arts',
  'Community',
  'Other',
];
const STATUSES = ['draft', 'published', 'cancelled', 'completed'];

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 3,
      maxlength: 140,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: CATEGORIES,
      default: 'Other',
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    startTime: {
      type: String, // "HH:mm"
      required: true,
    },
    endTime: {
      type: String, // "HH:mm"
      required: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
      maxlength: 200,
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
    },
    image: {
      type: String,
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'published',
      index: true,
    },
    // Denormalized "going" counter kept in sync atomically with RSVPs.
    // Used to enforce capacity under concurrency without scanning RSVPs.
    goingCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Optimistic concurrency control version (separate from Mongoose __v).
    version: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

eventSchema.statics.CATEGORIES = CATEGORIES;
eventSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Event', eventSchema);
