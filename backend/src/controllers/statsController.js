const User = require('../models/User');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const { sendSuccess } = require('../utils/response');

/* Admin-only platform overview. */
async function overview(req, res, next) {
  try {
    const now = new Date();
    const [totalUsers, totalEvents, upcomingEvents, totalRsvps] = await Promise.all([
      User.countDocuments({}),
      Event.countDocuments({}),
      Event.countDocuments({ date: { $gte: now }, status: 'published' }),
      RSVP.countDocuments({}),
    ]);
    return sendSuccess(res, 200, { totalUsers, totalEvents, upcomingEvents, totalRsvps });
  } catch (err) {
    return next(err);
  }
}

module.exports = { overview };
