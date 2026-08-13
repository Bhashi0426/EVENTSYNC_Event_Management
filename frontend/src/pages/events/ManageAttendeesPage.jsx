import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Users } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Select from '../../components/common/Select';
import { useSocket } from '../../context/SocketContext';
import eventService from '../../services/eventService';
import { getErrorMessage } from '../../services/api';
import { RESPONSE_LABELS } from '../../utils/constants';
import { formatDate } from '../../utils/format';

const RESPONSE_TONE = { going: 'green', maybe: 'amber', not_going: 'red' };

export default function ManageAttendeesPage() {
  const { id } = useParams();
  const { on, joinEventRoom, leaveEventRoom } = useSocket();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await eventService.attendees(id);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load attendees.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Live-refresh attendee list when RSVPs change.
  useEffect(() => {
    joinEventRoom(id);
    const offs = [
      on('rsvp:created', () => load()),
      on('rsvp:updated', () => load()),
      on('rsvp:cancelled', () => load()),
    ];
    return () => {
      leaveEventRoom(id);
      offs.forEach((off) => off && off());
    };
  }, [id, on, joinEventRoom, leaveEventRoom, load]);

  if (loading) return <Spinner label="Loading attendees…" className="py-24" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const { rsvps, stats, capacity } = data;
  const filtered = rsvps.filter((r) => {
    if (filter && r.response !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.user?.name?.toLowerCase().includes(q) || r.user?.email?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <Link to={`/events/${id}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={16} /> Back to event
      </Link>
      <h1 className="text-2xl font-bold text-ink mb-1">Manage Attendees</h1>
      <p className="text-muted text-sm mb-6">People who responded to your event.</p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Going" value={stats.going} tone="text-success" />
        <StatCard label="Maybe" value={stats.maybe} tone="text-warning" />
        <StatCard label="Not Going" value={stats.not_going} tone="text-danger" />
        <StatCard label="Capacity" value={`${stats.going}/${capacity}`} tone="text-primary" />
      </div>

      {/* Controls */}
      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          placeholder="All responses"
          options={[
            { value: 'going', label: 'Going' },
            { value: 'maybe', label: 'Maybe' },
            { value: 'not_going', label: 'Not Going' },
          ]}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No attendees found" description="No one matches your filters yet." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-muted text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-medium">RSVP</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r._id} className="border-t border-line">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={r.user?.name} src={r.user?.avatar} size="sm" />
                        <span className="font-medium text-ink">{r.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted hidden sm:table-cell">{r.user?.email}</td>
                    <td className="px-4 py-3">
                      <Badge tone={RESPONSE_TONE[r.response]}>{RESPONSE_LABELS[r.response]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted hidden md:table-cell">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className="card p-4">
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
      <p className="text-xs text-muted mt-1">{label}</p>
    </div>
  );
}
