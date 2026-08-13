import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EventForm from '../../components/events/EventForm';
import Spinner from '../../components/common/Spinner';
import ErrorState from '../../components/common/ErrorState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useToast } from '../../context/ToastContext';
import eventService from '../../services/eventService';
import { getErrorMessage } from '../../services/api';

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [conflict, setConflict] = useState(null); // { latestVersion }
  const [formKey, setFormKey] = useState(0); // force-remount form on discard

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await eventService.get(id);
      setEvent(data.event);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load event.'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      const updated = await eventService.update(id, { ...payload, version: event.version });
      toast.success('Event updated successfully.');
      navigate(`/events/${id}`);
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setConflict({ latestVersion: err.response.data.latestVersion });
      } else {
        toast.error(getErrorMessage(err, 'Unable to update event.'));
      }
      setSubmitting(false);
    }
  }

  async function handleViewLatest() {
    setConflict(null);
    setSubmitting(false);
    await load(); // reload the latest version
    setFormKey((k) => k + 1); // reset the form to latest data
    toast.info('Loaded the latest version of this event.');
  }

  if (loading) return <Spinner label="Loading event…" className="py-24" />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!event) return null;

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/events/${id}`} className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={16} /> Back to event
      </Link>
      <h1 className="text-2xl font-bold text-ink mb-1">Edit Event</h1>
      <p className="text-muted text-sm mb-6">Update the details of your event.</p>

      <div className="card p-6">
        <EventForm
          key={formKey}
          initial={event}
          onSubmit={handleSubmit}
          submitting={submitting}
          submitLabel="Save Changes"
          showStatus
        />
      </div>

      {/* Optimistic-concurrency conflict modal */}
      <Modal
        open={!!conflict}
        onClose={() => setConflict(null)}
        title="Event Updated"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={handleViewLatest}>
              View Latest
            </Button>
            <Button variant="danger" onClick={() => navigate(`/events/${id}`)}>
              Discard My Changes
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Another user modified this event while you were editing it (their version is{' '}
          {conflict?.latestVersion}). You can load the latest version and re-apply your changes, or
          discard your edits.
        </p>
      </Modal>
    </div>
  );
}
