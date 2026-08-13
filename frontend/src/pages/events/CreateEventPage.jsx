import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import EventForm from '../../components/events/EventForm';
import { useToast } from '../../context/ToastContext';
import eventService from '../../services/eventService';
import { getErrorMessage } from '../../services/api';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(payload) {
    setSubmitting(true);
    try {
      const event = await eventService.create(payload);
      toast.success('Event created successfully.');
      navigate(`/events/${event._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Unable to create event.'));
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/my-events" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ArrowLeft size={16} /> Back
      </Link>
      <h1 className="text-2xl font-bold text-ink mb-1">Create Event</h1>
      <p className="text-muted text-sm mb-6">Fill in the details to publish a new event.</p>

      <div className="card p-6">
        <EventForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create Event" showStatus />
      </div>
    </div>
  );
}
