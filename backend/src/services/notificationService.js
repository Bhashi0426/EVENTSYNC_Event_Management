const Notification = require('../models/Notification');
const { emitToUser } = require('../sockets/socketHandler');

/**
 * Create a notification and push it in real time to the target user's room.
 */
async function createNotification({ user, type, title, message, relatedEvent = null }) {
  const notification = await Notification.create({
    user,
    type,
    title,
    message,
    relatedEvent,
  });

  emitToUser(user.toString(), 'notification:new', { notification });
  return notification;
}

async function listForUser(userId, { unreadOnly = false, limit = 50 } = {}) {
  const filter = { user: userId };
  if (unreadOnly) filter.read = false;
  return Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('relatedEvent', 'title date');
}

async function unreadCount(userId) {
  return Notification.countDocuments({ user: userId, read: false });
}

async function markRead(userId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );
}

async function markAllRead(userId) {
  await Notification.updateMany({ user: userId, read: false }, { read: true });
}

module.exports = {
  createNotification,
  listForUser,
  unreadCount,
  markRead,
  markAllRead,
};
