const { body } = require('express-validator');
const RSVP = require('../models/RSVP');

const rsvpRules = [
  body('response')
    .notEmpty().withMessage('Response is required.')
    .isIn(RSVP.RESPONSES).withMessage('Response must be one of: going, maybe, not_going.'),
];

module.exports = { rsvpRules };
