const rsvpService = require('../services/rsvpService');
const { sendSuccess } = require('../utils/response');

async function upsert(req, res, next) {
  try {
    const existing = await rsvpService.getUserRSVPForEvent(req.params.eventId, req.user._id);
    const rsvp = await rsvpService.setRSVP(req.params.eventId, req.user, req.body.response);
    return sendSuccess(res, existing ? 200 : 201, { rsvp });
  } catch (err) {
    return next(err);
  }
}

async function getMine(req, res, next) {
  try {
    const rsvp = await rsvpService.getUserRSVPForEvent(req.params.eventId, req.user._id);
    return sendSuccess(res, 200, { rsvp });
  } catch (err) {
    return next(err);
  }
}

async function cancel(req, res, next) {
  try {
    await rsvpService.cancelRSVP(req.params.eventId, req.user);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function myRsvps(req, res, next) {
  try {
    const rsvps = await rsvpService.getMyRSVPs(req.user._id, req.query.response);
    return sendSuccess(res, 200, { rsvps });
  } catch (err) {
    return next(err);
  }
}

module.exports = { upsert, getMine, cancel, myRsvps };
