const eventService = require('../services/eventService');
const rsvpService = require('../services/rsvpService');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const result = await eventService.listEvents(req.query);
    return sendSuccess(res, 200, result);
  } catch (err) {
    return next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const event = await eventService.getEventById(req.params.id);
    const stats = await eventService.getEventStats(req.params.id);

    // Include the requesting user's current RSVP (if any).
    let myRsvp = null;
    if (req.user) {
      const rsvp = await rsvpService.getUserRSVPForEvent(req.params.id, req.user._id);
      myRsvp = rsvp ? rsvp.response : null;
    }

    return sendSuccess(res, 200, { event, stats, myRsvp });
  } catch (err) {
    return next(err);
  }
}

async function create(req, res, next) {
  try {
    const event = await eventService.createEvent(req.body, req.user._id);
    return sendSuccess(res, 201, { event });
  } catch (err) {
    return next(err);
  }
}

async function update(req, res, next) {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body, req.user);
    return sendSuccess(res, 200, { event });
  } catch (err) {
    return next(err);
  }
}

async function remove(req, res, next) {
  try {
    await eventService.deleteEvent(req.params.id, req.user);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

async function attendees(req, res, next) {
  try {
    const result = await eventService.getAttendees(req.params.id, req.user);
    return sendSuccess(res, 200, result);
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, getOne, create, update, remove, attendees };
