const mongoose = require('mongoose');
const Event = require('../models/Event');
const RSVP = require('../models/RSVP');
const ApiError = require('../utils/ApiError');
const { emitToEvent } = require('../sockets/socketHandler');
const notificationService = require('./notificationService');

/**
 * Build a MongoDB filter from query params:
 * search, category, date, location, status, availability.
 */
function buildFilter(query) {
  const filter = {};

  if (query.search) {
    const rx = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ title: rx }, { description: rx }, { location: rx }];
  }
  if (query.category) filter.category = query.category;
  if (query.location) filter.location = new RegExp(query.location.trim(), 'i');
  if (query.status) filter.status = query.status;
  if (query.organizer) filter.organizer = query.organizer;

  if (query.date) {
    // Match events on a specific calendar day.
    const start = new Date(query.date);
    if (!Number.isNaN(start.getTime())) {
      const end = new Date(start);
      end.setHours(23, 59, 59, 999);
      start.setHours(0, 0, 0, 0);
      filter.date = { $gte: start, $lte: end };
    }
  }

  return filter;
}

async function listEvents(query = {}) {
  const filter = buildFilter(query);

  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 9, 1), 50);
  const skip = (page - 1) * limit;

  const sortMap = {
    date_asc: { date: 1 },
    date_desc: { date: -1 },
    newest: { createdAt: -1 },
    title: { title: 1 },
  };
  const sort = sortMap[query.sort] || { date: 1 };

  let queryBuilder = Event.find(filter)
    .populate('organizer', 'name email avatar')
    .sort(sort);

  // availability=available -> only events with open seats
  // (applied in-memory after fetch when requested, since it depends on goingCount vs capacity)
  const availabilityFilter = query.availability;

  let events = await queryBuilder.lean();

  if (availabilityFilter === 'available') {
    events = events.filter((e) => e.goingCount < e.capacity);
  } else if (availabilityFilter === 'full') {
    events = events.filter((e) => e.goingCount >= e.capacity);
  }

  const total = events.length;
  const paged = events.slice(skip, skip + limit);

  return {
    events: paged,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

async function getEventById(id) {
  if (!mongoose.isValidObjectId(id)) throw ApiError.badRequest('Invalid event id.');
  const event = await Event.findById(id).populate('organizer', 'name email avatar');
  if (!event) throw ApiError.notFound('Event not found.');
  return event;
}

async function getEventStats(eventId) {
  const counts = await RSVP.aggregate([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    { $group: { _id: '$response', count: { $sum: 1 } } },
  ]);
  const stats = { going: 0, maybe: 0, not_going: 0 };
  for (const c of counts) stats[c._id] = c.count;
  return stats;
}

async function createEvent(data, organizerId) {
  const event = await Event.create({
    ...data,
    organizer: organizerId,
    goingCount: 0,
    version: 1,
  });
  return event.populate('organizer', 'name email avatar');
}

function assertCanManage(event, user) {
  // organizer may be a populated document or a raw ObjectId.
  const organizerId = event.organizer && event.organizer._id
    ? event.organizer._id.toString()
    : event.organizer.toString();
  const isOwner = organizerId === user._id.toString();
  if (user.role !== 'admin' && !isOwner) {
    throw ApiError.forbidden('You can only manage your own events.');
  }
}

/**
 * Optimistic concurrency update. The client must send the version it last saw.
 * If the stored version differs, a 409 conflict with latestVersion is returned.
 */
async function updateEvent(id, data, user) {
  const event = await getEventById(id);
  assertCanManage(event, user);

  const clientVersion = parseInt(data.version, 10);
  if (Number.isNaN(clientVersion)) {
    throw ApiError.badRequest('Version is required for updates.');
  }
  if (clientVersion !== event.version) {
    throw ApiError.conflict('This event was modified by another user.', {
      extra: { latestVersion: event.version },
    });
  }

  const updatable = [
    'title', 'description', 'category', 'date', 'startTime',
    'endTime', 'location', 'capacity', 'image', 'status',
  ];
  const updates = {};
  for (const key of updatable) {
    if (data[key] !== undefined) updates[key] = data[key];
  }

  const wasCancelled = updates.status === 'cancelled' && event.status !== 'cancelled';

  // Atomic guarded update: only succeeds if version still matches.
  const updated = await Event.findOneAndUpdate(
    { _id: id, version: clientVersion },
    { $set: updates, $inc: { version: 1 } },
    { new: true, runValidators: true }
  ).populate('organizer', 'name email avatar');

  if (!updated) {
    // Version changed between read and write.
    const fresh = await Event.findById(id).select('version');
    throw ApiError.conflict('This event was modified by another user.', {
      extra: { latestVersion: fresh ? fresh.version : event.version },
    });
  }

  // Real-time + notifications to attendees.
  emitToEvent(id, 'event:updated', { event: updated });
  await notifyAttendees(id, updated, wasCancelled);
  if (wasCancelled) emitToEvent(id, 'event:cancelled', { event: updated });

  return updated;
}

async function notifyAttendees(eventId, event, cancelled) {
  const rsvps = await RSVP.find({ event: eventId, response: { $in: ['going', 'maybe'] } }).select('user');
  const type = cancelled ? 'EVENT_CANCELLED' : 'EVENT_UPDATED';
  const title = cancelled ? 'Event cancelled' : 'Event updated';
  const message = cancelled
    ? `${event.title} was cancelled.`
    : `${event.title} was updated.`;

  await Promise.all(
    rsvps.map((r) =>
      notificationService.createNotification({
        user: r.user,
        type,
        title,
        message,
        relatedEvent: eventId,
      })
    )
  );
}

async function deleteEvent(id, user) {
  const event = await getEventById(id);
  assertCanManage(event, user);

  await RSVP.deleteMany({ event: id });
  await Event.findByIdAndDelete(id);

  emitToEvent(id, 'event:cancelled', { eventId: id });
  return true;
}

async function getAttendees(id, user) {
  const event = await getEventById(id);
  // Organizers (owner) and admins may view attendees.
  assertCanManage(event, user);

  const rsvps = await RSVP.find({ event: id })
    .populate('user', 'name email avatar')
    .sort({ createdAt: 1 });

  const stats = await getEventStats(id);
  return { rsvps, stats, capacity: event.capacity };
}

module.exports = {
  buildFilter,
  listEvents,
  getEventById,
  getEventStats,
  createEvent,
  updateEvent,
  deleteEvent,
  getAttendees,
  assertCanManage,
};
