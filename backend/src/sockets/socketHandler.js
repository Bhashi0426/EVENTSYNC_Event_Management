const logger = require('../utils/logger');
const { verifyToken } = require('../utils/jwt');

let io = null;

/**
 * Room naming:
 *   event:{eventId}  -> everyone currently viewing an event
 *   user:{userId}    -> a specific user's personal channel (notifications)
 */
function roomForEvent(eventId) {
  return `event:${eventId}`;
}
function roomForUser(userId) {
  return `user:${userId}`;
}

function initSocket(server, corsOrigin) {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Normalize configured origin and incoming origin (strip trailing slash)
        const norm = (u) => (typeof u === 'string' ? u.replace(/\/$/, '') : u);
        const allowedOrigin = norm(corsOrigin);
        const incoming = norm(origin);

        // Allow if no origin (non-browser) or matches configured origin or common dev hosts
        if (!origin) return callback(null, true);
        if (incoming === allowedOrigin) return callback(null, true);
        if (/^https?:\/\/172\.\d+\.\d+\.\d+:5173$/.test(incoming)) return callback(null, true);
        if (/^https?:\/\/192\.168\.\d+\.\d+:5173$/.test(incoming)) return callback(null, true);
        if (/^https?:\/\/localhost:5173$/.test(incoming)) return callback(null, true);
        if (/^https?:\/\/127\.0\.0\.1:5173$/.test(incoming)) return callback(null, true);

        callback(new Error(`Socket.io CORS origin denied: ${origin}`));
      },
      credentials: true,
    },
  });

  // Optional auth: if a token is provided, join the user's personal room.
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (token) {
      try {
        const payload = verifyToken(token);
        socket.userId = payload.userId;
        socket.join(roomForUser(payload.userId));
      } catch (err) {
        // Ignore invalid token; socket stays anonymous.
      }
    }

    socket.on('event:join', (eventId) => {
      if (eventId) socket.join(roomForEvent(eventId));
    });

    socket.on('event:leave', (eventId) => {
      if (eventId) socket.leave(roomForEvent(eventId));
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  return io;
}

/* Emit helpers — safe no-ops when io is not initialized (e.g. in tests). */
function emitToEvent(eventId, eventName, payload) {
  if (io) io.to(roomForEvent(eventId)).emit(eventName, payload);
}

function emitToUser(userId, eventName, payload) {
  if (io) io.to(roomForUser(userId)).emit(eventName, payload);
}

module.exports = {
  initSocket,
  getIO,
  emitToEvent,
  emitToUser,
  roomForEvent,
  roomForUser,
};
