const express = require('express');
const rsvpController = require('../controllers/rsvpController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/me/rsvps
router.get('/rsvps', requireAuth, rsvpController.myRsvps);

module.exports = router;
