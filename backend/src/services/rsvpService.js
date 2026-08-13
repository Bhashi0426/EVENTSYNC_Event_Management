const mongoose = require('mongoose');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const ApiError = require('../utils/ApiError');
const { emitToEvent } = require('../sockets/socketHandler');
const notificationService = require('./notificationService');
const eventService = require('./eventService');

/**
 * Atomically reserve one "going" seat. Uses a single-document conditional
 * update: the increment only applies while goingCount < capacity. Because
 * single-document updates in MongoDB are atomic, two concurrent requests for
 * the final seat cannot both succeed — the loser matches no document.
 * Returns true if a seat was reserved, false if the event is full.
 */
async function reserveSeat(eventId) {
  const reserved = await Event.findOneAndUpdate(
    {
      _id: eventId,
      status: { $ne: 'cancelled' },
      $expr: { $lt: ['$goingCount', '$capacity'] },
    },
    { $inc: { goingCount: 1 } },
    { new: true }
  );
  return reserved; // Event doc or null
}

async function releaseSeat(eventId) {
  return Event.findOneAndUpdate(
    { _id: eventId, goingCount: { $gt: 0 } },
    { $inc: { goingCount: -1 } },
    { new: true }
  );
}

/**
 * Create or update the current user's RSVP for an event.
 * Handles capacity reservation for "going" transitions.
 */
async function setRSVP(eventId, user, response) {
  if (!mongoose.isValidObjectId(eventId)) throw ApiError.badRequest('Invalid event id.');

  const event = await Event.findById(eventId);
  if (!event) throw ApiError.notFound('Event not found.');
  if (event.status === 'cancelled') {
    throw ApiError.badRequest('This event has been cancelled.');
  }

  const existing = await RSVP.findOne({ event: eventId, user: user._id });
  const prev = existing ? existing.response : null;
  const wasGoing = prev === 'going';
  const wantGoing = response === 'going';

  // Reserve / release seats based on the transition.
  let reservedEvent = null;
  if (wantGoing && !wasGoing) {
    reservedEvent = await reserveSeat(eventId);
    if (!reservedEvent) {
      throw ApiError.conflict('Event has reached maximum capacity.');
    }
  } else if (!wantGoing && wasGoing) {
    await releaseSeat(eventId);
  }

  // Persist the RSVP; roll back the reservation if the write fails.
  let rsvp;
  try {
    if (existing) {
      existing.response = response;
      rsvp = await existing.save();
    } else {
      rsvp = await RSVP.create({ event: eventId, user: user._id, response });
    }
  } catch (err) {
    if (reservedEvent) await releaseSeat(eventId);
    if (err.code === 11000) {
      throw ApiError.conflict('You have already responded to this event.');
    }
    throw err;
  }

  const isNew = !existing;
  await afterRSVPChange(eventId, event, user, response, isNew);

  return rsvp.populate('user', 'name email avatar');
}

async function cancelRSVP(eventId, user) {
  if (!mongoose.isValidObjectId(eventId)) throw ApiError.badRequest('Invalid event id.');

  const existing = await RSVP.findOne({ event: eventId, user: user._id });
  if (!existing) throw ApiError.notFound('You have not responded to this event.');

  if (existing.response === 'going') {
    await releaseSeat(eventId);
  }
  await existing.deleteOne();

  const stats = await eventService.getEventStats(eventId);
  const event = await Event.findById(eventId).select('goingCount capacity title organizer');
  emitToEvent(eventId, 'rsvp:cancelled', {
    eventId,
    userId: user._id.toString(),
    stats,
    goingCount: event ? event.goingCount : stats.going,
  });
  emitToEvent(eventId, 'attendee:updated', { eventId, stats, goingCount: event ? event.goingCount : stats.going });

  return true;
}

/**
 * Emit real-time updates and create notifications after an RSVP change.
 */
async function afterRSVPChange(eventId, event, user, response, isNew) {
  const stats = await eventService.getEventStats(eventId);
  const fresh = await Event.findById(eventId).select('goingCount capacity');
  const goingCount = fresh ? fresh.goingCount : stats.going;

  const socketEvent = isNew ? 'rsvp:created' : 'rsvp:updated';
  emitToEvent(eventId, socketEvent, {
    eventId,
    userId: user._id.toString(),
    response,
    stats,
    goingCount,
  });
  emitToEvent(eventId, 'attendee:updated', { eventId, stats, goingCount });

  // Notify the organizer when someone joins (going) their event.
  if (response === 'going' && isNew) {
    notificationService.createNotification({
      user: event.organizer,
      type: 'RSVP_CREATED',
      title: 'New RSVP',
      message: `${user.name} is going to ${event.title}.`,
      relatedEvent: eventId,
    }).catch(() => {});

    // Capacity warning at >= 90% full.
    if (fresh && fresh.capacity > 0 && goingCount >= Math.ceil(fresh.capacity * 0.9)) {
      notificationService.createNotification({
        user: event.organizer,
        type: 'EVENT_CAPACITY',
        title: 'Event almost full',
        message: `${event.title} is almost full (${goingCount}/${fresh.capacity}).`,
        relatedEvent: eventId,
      }).catch(() => {});
    }
  }

  // Confirmation notification to the participant.
  notificationService.createNotification({
    user: user._id,
    type: isNew ? 'RSVP_CREATED' : 'RSVP_UPDATED',
    title: 'RSVP confirmed',
    message: `Your RSVP for ${event.title} is now "${response.replace('_', ' ')}".`,
    relatedEvent: eventId,
  }).catch(() => {});
}

async function getUserRSVPForEvent(eventId, userId) {
  return RSVP.findOne({ event: eventId, user: userId });
}

async function getMyRSVPs(userId, responseFilter) {
  const filter = { user: userId };
  if (responseFilter && RSVP.RESPONSES.includes(responseFilter)) {
    filter.response = responseFilter;
  }
  return RSVP.find(filter)
    .populate({
      path: 'event',
      populate: { path: 'organizer', select: 'name email avatar' },
    })
    .sort({ createdAt: -1 });
}

module.exports = {
  reserveSeat,
  releaseSeat,
  setRSVP,
  cancelRSVP,
  getUserRSVPForEvent,
  getMyRSVPs,
};
