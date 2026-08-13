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
        if (!origin || origin === corsOrigin || /^https?:\/\/172\.28\.0\.\d+:5173$/.test(origin) || /^https?:\/\/192\.168\.\d+\.\d+:5173$/.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`Socket.io CORS origin denied: ${origin}`));
        }
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
