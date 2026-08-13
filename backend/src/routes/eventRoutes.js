const express = require('express');
const eventController = require('../controllers/eventController');
const rsvpController = require('../controllers/rsvpController');
const { requireAuth, optionalAuth } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { createEventRules, updateEventRules } = require('../validators/eventValidator');
const { rsvpRules } = require('../validators/rsvpValidator');

const router = express.Router();

// Public (personalized if authenticated)
router.get('/', optionalAuth, eventController.list);
router.get('/:id', optionalAuth, eventController.getOne);

// Organizer/Admin: create
router.post('/', requireAuth, requireRole('organizer', 'admin'), createEventRules, validate, eventController.create);

// Owner organizer / admin: update & delete (ownership enforced in service)
router.put('/:id', requireAuth, requireRole('organizer', 'admin'), updateEventRules, validate, eventController.update);
router.delete('/:id', requireAuth, requireRole('organizer', 'admin'), eventController.remove);

// Owner organizer / admin: attendees
router.get('/:id/attendees', requireAuth, requireRole('organizer', 'admin'), eventController.attendees);

// RSVP (any authenticated user)
router.post('/:eventId/rsvp', requireAuth, rsvpRules, validate, rsvpController.upsert);
router.get('/:eventId/rsvp', requireAuth, rsvpController.getMine);
router.put('/:eventId/rsvp', requireAuth, rsvpRules, validate, rsvpController.upsert);
router.delete('/:eventId/rsvp', requireAuth, rsvpController.cancel);

module.exports = router;
