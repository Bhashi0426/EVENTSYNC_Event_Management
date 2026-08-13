const { body } = require('express-validator');
const Event = require('../models/Event');

const createEventRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required.')
    .isLength({ min: 3, max: 140 }).withMessage('Title must be 3-140 characters.'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required.')
    .isLength({ max: 5000 }).withMessage('Description is too long.'),
  body('category')
    .optional()
    .isIn(Event.CATEGORIES).withMessage('Invalid category.'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Date must be a valid date.'),
  body('startTime')
    .notEmpty().withMessage('Start time is required.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be HH:mm.'),
  body('endTime')
    .notEmpty().withMessage('End time is required.')
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be HH:mm.'),
  body('location')
    .trim()
    .notEmpty().withMessage('Location is required.')
    .isLength({ max: 200 }).withMessage('Location is too long.'),
  body('capacity')
    .notEmpty().withMessage('Capacity is required.')
    .isInt({ min: 1 }).withMessage('Capacity must be at least 1.'),
  body('status')
    .optional()
    .isIn(Event.STATUSES).withMessage('Invalid status.'),
  body('image').optional().isString(),
];

const updateEventRules = [
  body('title').optional().trim().isLength({ min: 3, max: 140 }).withMessage('Title must be 3-140 characters.'),
  body('description').optional().trim().isLength({ max: 5000 }).withMessage('Description is too long.'),
  body('category').optional().isIn(Event.CATEGORIES).withMessage('Invalid category.'),
  body('date').optional().isISO8601().withMessage('Date must be a valid date.'),
  body('startTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Start time must be HH:mm.'),
  body('endTime').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('End time must be HH:mm.'),
  body('location').optional().trim().isLength({ max: 200 }).withMessage('Location is too long.'),
  body('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1.'),
  body('status').optional().isIn(Event.STATUSES).withMessage('Invalid status.'),
  body('image').optional().isString(),
  body('version')
    .notEmpty().withMessage('Version is required for optimistic concurrency.')
    .isInt({ min: 1 }).withMessage('Version must be a positive integer.'),
];

module.exports = { createEventRules, updateEventRules };
