import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Pencil, Trash2, ExternalLink, Plus } from 'lucide-react';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';
import Select from '../../components/common/Select';
import Pagination from '../../components/common/Pagination';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import EventForm from '../../components/events/EventForm';
import { useToast } from '../../context/ToastContext';
import eventService from '../../services/eventService';
import { getErrorMessage } from '../../services/api';
import { EVENT_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/format';
import useDebounce from '../../hooks/useDebounce';

const STATUS_TONE = { draft: 'gray', published: 'green', cancelled: 'red', completed: 'blue' };

export default function AdminEventsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const [data, setData] = useState({ events: [], pagination: { totalPages: 1 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10, sort: 'newest' };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter) params.status = statusFilter;
      const result = await eventService.list(params);
      setData(result);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load events.'));
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  async function handleDelete() {
    setDeleting(true);
    try {
      await eventService.remove(deleteTarget._id);
      toast.success('Event deleted successfully.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to delete event.'));
    } finally {
      setDeleting(false);
    }
  }

  async function handleCreate(data) {
    setCreating(true);
    try {
      await eventService.create(data);
      toast.success('Event created successfully.');
      setShowCreate(false);
      load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to create event.'));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink mb-1">Event Management</h1>
          <p className="text-muted text-sm">View, edit, and remove any event on the platform.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary whitespace-nowrap inline-flex items-center gap-2">
          <Plus size={16} /> Create Event
        </button>
      </div>

      <div className="card p-4 mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            className="input pl-10"
            placeholder="Search events…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          placeholder="All statuses"
          options={EVENT_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-48"
        />
      </div>

      {loading ? (
        <Spinner label="Loading events…" className="py-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : data.events.length === 0 ? (
        <EmptyState title="No events found" description="Try adjusting your filters." />
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-muted text-left">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium hidden md:table-cell">Organizer</th>
                    <th className="px-4 py-3 font-medium hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3 font-medium">Going</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.events.map((e) => (
                    <tr key={e._id} className="border-t border-line">
                      <td className="px-4 py-3">
                        <p className="font-medium text-ink line-clamp-1">{e.title}</p>
                        <p className="text-xs text-muted line-clamp-1">{e.location}</p>
                      </td>
                      <td className="px-4 py-3 text-muted hidden md:table-cell">{e.organizer?.name}</td>
                      <td className="px-4 py-3 text-muted hidden sm:table-cell">{formatDate(e.date)}</td>
                      <td className="px-4 py-3 text-ink">
                        {e.goingCount || 0}/{e.capacity}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={STATUS_TONE[e.status]}>{e.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/events/${e._id}`} className="btn-ghost !px-2" title="View">
                            <ExternalLink size={16} />
                          </Link>
                          <Link to={`/events/${e._id}/edit`} className="btn-ghost !px-2" title="Edit">
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(e)}
                            className="btn-ghost !px-2 text-danger"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={data.pagination.totalPages} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Event?"
        message={`"${deleteTarget?.title}" and all its RSVPs will be permanently removed.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Event"
        footer={
          <button onClick={() => setShowCreate(false)} className="btn-ghost">
            Cancel
          </button>
        }
        size="lg"
      >
        <EventForm onSubmit={handleCreate} submitting={creating} submitLabel="Create Event" />
      </Modal>
    </div>
  );
}
