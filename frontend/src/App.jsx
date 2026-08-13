import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { OfflineProvider } from './context/OfflineContext';

import ProtectedRoute from './routes/ProtectedRoute';
import PublicRoute from './routes/PublicRoute';
import AppLayout from './components/layout/AppLayout';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EventsPage from './pages/events/EventsPage';
import EventDetailsPage from './pages/events/EventDetailsPage';
import CreateEventPage from './pages/events/CreateEventPage';
import EditEventPage from './pages/events/EditEventPage';
import ManageAttendeesPage from './pages/events/ManageAttendeesPage';
import MyEventsPage from './pages/events/MyEventsPage';
import MyRSVPsPage from './pages/rsvps/MyRSVPsPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminEventsPage from './pages/admin/AdminEventsPage';
import NotFoundPage from './pages/NotFoundPage';

/* Wraps authenticated app-shell providers (socket/notifications/offline). */
function AppShell({ children }) {
  return (
    <SocketProvider>
      <NotificationProvider>
        <OfflineProvider>{children}</OfflineProvider>
      </NotificationProvider>
    </SocketProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          {/* Public */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* Authenticated app */}
          <Route
            element={
              <ProtectedRoute>
                <AppShell>
                  <AppLayout />
                </AppShell>
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/create" element={<ProtectedRoute roles={['organizer', 'admin']}><CreateEventPage /></ProtectedRoute>} />
            <Route path="/events/:id" element={<EventDetailsPage />} />
            <Route path="/events/:id/edit" element={<ProtectedRoute roles={['organizer', 'admin']}><EditEventPage /></ProtectedRoute>} />
            <Route path="/events/:id/attendees" element={<ProtectedRoute roles={['organizer', 'admin']}><ManageAttendeesPage /></ProtectedRoute>} />
            <Route path="/my-events" element={<ProtectedRoute roles={['organizer', 'admin']}><MyEventsPage /></ProtectedRoute>} />
            <Route path="/my-rsvps" element={<MyRSVPsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute roles={['admin']}><AdminEventsPage /></ProtectedRoute>} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}
