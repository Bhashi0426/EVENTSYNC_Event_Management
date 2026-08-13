import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/runtimeEnv';

let socket = null;

/* Create (or reuse) the singleton socket connection. */
export function connectSocket(token) {
  if (socket && socket.connected) return socket;
  socket = io(SOCKET_URL, {
    withCredentials: true,
    auth: token ? { token } : {},
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinEventRoom(eventId) {
  if (socket && eventId) socket.emit('event:join', eventId);
}

export function leaveEventRoom(eventId) {
  if (socket && eventId) socket.emit('event:leave', eventId);
}

export default { connectSocket, getSocket, disconnectSocket, joinEventRoom, leaveEventRoom };
