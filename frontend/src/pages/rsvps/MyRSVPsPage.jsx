import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Ticket, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { useToast } from '../../context/ToastContext';
import rsvpService from '../../services/rsvpService';
import { getErrorMessage } from '../../services/api';
import { RESPONSE_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/format';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'going', label: 'Going' },
  { key: 'maybe', label: 'Maybe' },
  { key: 'not_going', label: 'Not Going' },
];
const RESPONSE_TONE = { going: 'green', maybe: 'amber', not_going: 'red' };

export default function MyRSVPsPage() {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [rsvps, setRsvps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rsvpService.myRsvps(tab);
      // Filter out RSVPs whose event was deleted.
      setRsvps(data.filter((r) => r.event));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load your RSVPs.'));
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await rsvpService.cancel(cancelTarget.event._id);
      toast.success('RSVP cancelled.');
      setCancelTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to cancel RSVP.'));
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink mb-1">My RSVPs</h1>
      <p className="text-muted text-sm mb-6">Events you have responded to.</p>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-line mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px whitespace-nowrap transition-colors',
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading…" className="py-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : rsvps.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No RSVPs yet"
          description="You haven't RSVP'd to any events yet."
          action={
            <Link to="/events" className="btn-primary">
              Explore Events
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {rsvps.map((r) => (
            <div key={r._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge tone={RESPONSE_TONE[r.response]}>{RESPONSE_LABELS[r.response]}</Badge>
                  <Badge tone="blue">{r.event.category}</Badge>
                  {r.event.status === 'cancelled' && <Badge tone="red">Cancelled</Badge>}
                </div>
                <h3 className="font-semibold text-ink truncate">{r.event.title}</h3>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} /> {formatDate(r.event.date)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} /> {r.event.location}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link to={`/events/${r.event._id}`} className="btn-secondary">
                  <ExternalLink size={15} /> View
                </Link>
                <Button variant="ghost" onClick={() => setCancelTarget(r)} className="text-danger">
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="Cancel RSVP?"
        message={`Remove your RSVP for "${cancelTarget?.event?.title}"?`}
        confirmLabel="Cancel RSVP"
        danger
        loading={cancelling}
      />
    </div>
  );
}
