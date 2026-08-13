import { Link } from 'react-router-dom';
import { Bell, Check } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { useNotifications } from '../context/NotificationContext';
import { timeAgo } from '../utils/format';

export default function NotificationsPage() {
  const { notifications, unread, markRead, markAllRead } = useNotifications();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifications</h1>
          <p className="text-muted text-sm mt-0.5">{unread} unread</p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" onClick={markAllRead}>
            <Check size={16} /> Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {notifications.map((n) => {
            const inner = (
              <div className="flex items-start gap-3 px-5 py-4 hover:bg-slate-50">
                <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${n.read ? 'bg-transparent' : 'bg-primary'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink">{n.title}</p>
                  <p className="text-sm text-muted">{n.message}</p>
                  <p className="text-xs text-muted mt-0.5">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      markRead(n._id);
                    }}
                    className="text-xs text-primary hover:underline shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
            return n.relatedEvent ? (
              <Link key={n._id} to={`/events/${n.relatedEvent._id || n.relatedEvent}`} onClick={() => !n.read && markRead(n._id)}>
                {inner}
              </Link>
            ) : (
              <div key={n._id}>{inner}</div>
            );
          })}
        </div>
      )}
    </div>
  );
}
