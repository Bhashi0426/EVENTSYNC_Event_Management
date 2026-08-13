const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/response');

async function list(req, res, next) {
  try {
    const unreadOnly = req.query.unread === 'true';
    const [notifications, unread] = await Promise.all([
      notificationService.listForUser(req.user._id, { unreadOnly }),
      notificationService.unreadCount(req.user._id),
    ]);
    return sendSuccess(res, 200, { notifications, unread });
  } catch (err) {
    return next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const notification = await notificationService.markRead(req.user._id, req.params.id);
    return sendSuccess(res, 200, { notification });
  } catch (err) {
    return next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllRead(req.user._id);
    return sendSuccess(res, 200, { message: 'All notifications marked as read.' });
  } catch (err) {
    return next(err);
  }
}

module.exports = { list, markRead, markAllRead };
