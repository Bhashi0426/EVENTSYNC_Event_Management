import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, CalendarPlus } from 'lucide-react';
import EventCard from '../../components/events/EventCard';
import { EventCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { useAuth } from '../../context/AuthContext';
import eventService from '../../services/eventService';
import { getErrorMessage } from '../../services/api';

export default function MyEventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.list({ organizer: user._id, limit: 50, sort: 'newest' });
      setEvents(data.events);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your events.'));
    } finally {
      setLoading(false);
    }
  }, [user._id]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">My Events</h1>
          <p className="text-muted text-sm mt-0.5">Events you organize.</p>
        </div>
        <Link to="/events/create" className="btn-primary">
          <Plus size={16} /> Create Event
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : events.length === 0 ? (
        <EmptyState
          icon={CalendarPlus}
          title="You haven't created any events"
          description="Create your first event to start collecting RSVPs."
          action={
            <Link to="/events/create" className="btn-primary">
              <Plus size={16} /> Create Event
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
