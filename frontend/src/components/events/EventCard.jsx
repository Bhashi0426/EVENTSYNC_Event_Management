import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import Badge from '../common/Badge';
import { formatDate, formatTimeRange } from '../../utils/format';

const CATEGORY_TONES = {
  Technology: 'blue',
  Business: 'amber',
  Health: 'green',
  Music: 'red',
};

export default function EventCard({ event }) {
  const going = event.goingCount || 0;
  const full = going >= event.capacity;
  const organizerName = event.organizer?.name || 'Organizer';

  return (
    <div className="card overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <div className="h-36 bg-gradient-to-br from-primary/80 to-primary-dark relative">
        {event.image ? (
          <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-white/90 text-3xl font-bold">
            {event.title?.[0] || 'E'}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge tone={CATEGORY_TONES[event.category] || 'gray'} className="bg-white/90">
            {event.category}
          </Badge>
        </div>
        {event.status === 'cancelled' && (
          <div className="absolute top-3 right-3">
            <Badge tone="red" className="bg-white/90">
              Cancelled
            </Badge>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-ink line-clamp-1">{event.title}</h3>
        <p className="text-xs text-muted mt-0.5">by {organizerName}</p>

        <div className="mt-3 space-y-1.5 text-sm text-muted flex-1">
          <div className="flex items-center gap-2">
            <Calendar size={15} /> {formatDate(event.date)}
          </div>
          <div className="flex items-center gap-2">
            <Clock size={15} /> {formatTimeRange(event.startTime, event.endTime)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={15} /> <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={15} />
            <span className={full ? 'text-danger font-medium' : ''}>
              {going} / {event.capacity} going {full && '· Full'}
            </span>
          </div>
        </div>

        <Link to={`/events/${event._id}`} className="btn-primary w-full mt-4">
          View Event
        </Link>
      </div>
    </div>
  );
}
