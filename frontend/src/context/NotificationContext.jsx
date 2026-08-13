import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { on } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const data = await notificationService.list();
      setNotifications(data.notifications);
      setUnread(data.unread);
    } catch (e) {
      // silent
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) refresh();
    else {
      setNotifications([]);
      setUnread(0);
    }
  }, [isAuthenticated, refresh]);

  // Real-time: prepend incoming notifications.
  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const off = on('notification:new', ({ notification }) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnread((u) => u + 1);
    });
    return off;
  }, [isAuthenticated, on]);

  const markRead = useCallback(async (id) => {
    await notificationService.markRead(id);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((u) => Math.max(0, u - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await notificationService.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  const value = { notifications, unread, refresh, markRead, markAllRead };
  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}

export default NotificationContext;
