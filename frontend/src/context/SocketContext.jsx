import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { connectSocket, disconnectSocket, joinEventRoom, leaveEventRoom } from '../services/socket';
import { useAuth } from './AuthContext';
import { TOKEN_KEY } from '../utils/constants';

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem(TOKEN_KEY);
      socketRef.current = connectSocket(token);
    }
    return () => {
      if (!isAuthenticated) {
        disconnectSocket();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated]);

  // Subscribe helper that auto-cleans up.
  const on = useCallback((eventName, handler) => {
    const socket = socketRef.current;
    if (!socket) return () => {};
    socket.on(eventName, handler);
    return () => socket.off(eventName, handler);
  }, []);

  const value = {
    socket: socketRef,
    on,
    joinEventRoom,
    leaveEventRoom,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}

export default SocketContext;
