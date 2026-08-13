import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Users, ArrowLeft, Pencil, Trash2, UserCog, WifiOff,
} from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import RSVPButtons from '../../components/rsvp/RSVPButtons';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { useOffline } from '../../context/OfflineContext';
import eventService from '../../services/eventService';
import rsvpService from '../../services/rsvpService';
import { getErrorMessage } from '../../services/api';
import { formatDate, formatTimeRange } from '../../utils/format';

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { on, joinEventRoom, leaveEventRoom } = useSocket();
  const { online, queueRSVP } = useOffline();

  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState({ going: 0, maybe: 0, not_going: 0 });
  const [myRsvp, setMyRsvp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showFull, setShowFull] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.get(id);
      setEvent(data.event);
      setStats(data.stats);
      setMyRsvp(data.myRsvp);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load event.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time: join the event room and react to live updates.
  useEffect(() => {
    joinEventRoom(id);
    const offs = [
      on('attendee:updated', (p) => {
        if (p.eventId === id) {
          setStats(p.stats);
          setEvent((e) => (e ? { ...e, goingCount: p.goingCount } : e));
        }
      }),
      on('event:updated', (p) => {
        if (p.event && p.event._id === id) {
          setEvent(p.event);
          toast.info('This event was just updated.');
        }
      }),
      on('event:cancelled', (p) => {
        if ((p.event && p.event._id === id) || p.eventId === id) {
          setEvent((e) => (e ? { ...e, status: 'cancelled' } : e));
          toast.info('This event was cancelled.');
        }
      }),
    ];
    return () => {
      leaveEventRoom(id);
      offs.forEach((off) => off && off());
    };
  }, [id, on, joinEventRoom, leaveEventRoom, toast]);

  const going = event?.goingCount ?? stats.going;
  const full = event ? going >= event.capacity : false;
  const isOwner = event && user && event.organizer?._id === user._id;
  const canManage = isOwner || user?.role === 'admin';
  const cancelled = event?.status === 'cancelled';

  async function handleRSVP(response) {
    if (cancelled) return;
    if (response === 'going' && full && myRsvp !== 'going') {
      setShowFull(true);
      return;
    }

    // Offline: queue and optimistically reflect the choice.
    if (!online) {
      queueRSVP(id, response, event.title);
      setMyRsvp(response);
      toast.success('Saved locally. Will sync when you\'re back online.');
      return;
    }

    setRsvpLoading(true);
    const prev = myRsvp;
    try {
      await rsvpService.setRSVP(id, response);
      setMyRsvp(response);
      toast.success('RSVP updated.');
      // stats will also arrive via socket; refresh as a fallback.
      const data = await eventService.get(id);
      setStats(data.stats);
      setEvent(data.event);
    } catch (err) {
      setMyRsvp(prev);
      if (err.response && err.response.status === 409) {
        setShowFull(true);
      } else {
        toast.error(getErrorMessage(err, 'Unable to update RSVP.'));
      }
    } finally {
      setRsvpLoading(false);
    }
  }

  async function handleCancelRSVP() {
    setRsvpLoading(true);
    try {
      await rsvpService.cancel(id);
      setMyRsvp(null);
      toast.success('RSVP cancelled.');
      const data = await eventService.get(id);
      setStats(data.stats);
      setEvent(data.event);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to cancel RSVP.'));
    } finally {
      setRsvpLoading(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await eventService.remove(id);
      toast.success('Event deleted successfully.');
      navigate('/events');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete event.'));
      setDeleting(false);
    }
  }

  if (loading) return <Spinner label="Loading event…" className="py-24" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!event) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/events" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={16} /> Back to events
      </Link>

      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary/80 to-primary-dark relative">
          {event.image ? (
            <img src={event.image} alt={event.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-white text-5xl font-bold">
              {event.title[0]}
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge tone="blue">{event.category}</Badge>
                {cancelled && <Badge tone="red">Cancelled</Badge>}
              </div>
              <h1 className="text-2xl font-bold text-ink">{event.title}</h1>
            </div>

            {canManage && (
              <div className="flex items-center gap-2">
                <Link to={`/events/${id}/attendees`} className="btn-secondary">
                  <UserCog size={16} /> Attendees
                </Link>
                <Link to={`/events/${id}/edit`} className="btn-secondary">
                  <Pencil size={16} /> Edit
                </Link>
                <Button variant="danger" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={16} /> Delete
                </Button>
              </div>
            )}
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 text-sm">
              <Calendar size={18} className="text-primary" />
              <span className="text-ink">{formatDate(event.date, 'EEEE, MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock size={18} className="text-primary" />
              <span className="text-ink">{formatTimeRange(event.startTime, event.endTime)}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={18} className="text-primary" />
              <span className="text-ink">{event.location}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Users size={18} className="text-primary" />
              <span className={full ? 'text-danger font-medium' : 'text-ink'}>
                {going} / {event.capacity} going {full && '· Full'}
              </span>
            </div>
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-line">
            <Avatar name={event.organizer?.name} src={event.organizer?.avatar} />
            <div>
              <p className="text-sm font-medium text-ink">{event.organizer?.name}</p>
              <p className="text-xs text-muted">Organizer</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-ink mb-2">About this event</h2>
            <p className="text-sm text-muted whitespace-pre-line leading-relaxed">{event.description}</p>
          </div>
        </div>
      </div>

      {/* RSVP panel */}
      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">Your RSVP</h2>
          {!online && (
            <span className="text-xs text-warning flex items-center gap-1">
              <WifiOff size={13} /> Offline mode
            </span>
          )}
        </div>

        {cancelled ? (
          <p className="text-sm text-muted">This event has been cancelled. RSVPs are closed.</p>
        ) : (
          <>
            <RSVPButtons
              value={myRsvp}
              onSelect={handleRSVP}
              disabled={rsvpLoading}
              fullForGoing={full}
            />
            {myRsvp && (
              <button
                onClick={handleCancelRSVP}
                disabled={rsvpLoading}
                className="mt-3 text-sm text-danger hover:underline disabled:opacity-50"
              >
                Cancel my RSVP
              </button>
            )}
          </>
        )}

        {/* Live counts */}
        <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-line">
          <Stat label="Going" value={stats.going} tone="text-success" />
          <Stat label="Maybe" value={stats.maybe} tone="text-warning" />
          <Stat label="Not Going" value={stats.not_going} tone="text-danger" />
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Delete Event?"
        message="This action cannot be undone. All RSVPs for this event will also be removed."
        confirmLabel="Delete"
        danger
        loading={deleting}
      />

      <Modal
        open={showFull}
        onClose={() => setShowFull(false)}
        title="Event Full"
        size="sm"
        footer={<Button onClick={() => setShowFull(false)}>Close</Button>}
      >
        <p className="text-sm text-muted">
          Sorry, this event has reached its maximum capacity. You can still RSVP as “Maybe”.
        </p>
      </Modal>
    </div>
  );
}

function Stat({ label, value, tone }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}
