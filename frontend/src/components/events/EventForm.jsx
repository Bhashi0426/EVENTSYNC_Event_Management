import { useState } from 'react';
import Input from '../common/Input';
import Select from '../common/Select';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { CATEGORIES, EVENT_STATUSES } from '../../utils/constants';

/* Shared create/edit form. `initial` prefills for editing. */
export default function EventForm({ initial = {}, onSubmit, submitting, submitLabel = 'Save', showStatus = false }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    category: initial.category || 'Technology',
    description: initial.description || '',
    date: initial.date ? initial.date.slice(0, 10) : '',
    startTime: initial.startTime || '',
    endTime: initial.endTime || '',
    location: initial.location || '',
    capacity: initial.capacity || '',
    image: initial.image || '',
    status: initial.status || 'published',
  });
  const [errors, setErrors] = useState({});

  function set(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate() {
    const e = {};
    if (!form.title || form.title.trim().length < 3) e.title = 'Title must be at least 3 characters.';
    if (!form.description || form.description.trim().length < 1) e.description = 'Description is required.';
    if (!form.date) e.date = 'Date is required.';
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.startTime)) e.startTime = 'Start time is required.';
    if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(form.endTime)) e.endTime = 'End time is required.';
    if (!form.location) e.location = 'Location is required.';
    if (!form.capacity || Number(form.capacity) < 1) e.capacity = 'Capacity must be at least 1.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...form,
      capacity: Number(form.capacity),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <Input
        id="title"
        label="Title"
        placeholder="e.g. Tech Meetup 2026"
        value={form.title}
        onChange={(e) => set('title', e.target.value)}
        error={errors.title}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          id="category"
          label="Category"
          options={CATEGORIES}
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
        />
        {showStatus && (
          <Select
            id="status"
            label="Status"
            options={EVENT_STATUSES.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))}
            value={form.status}
            onChange={(e) => set('status', e.target.value)}
          />
        )}
      </div>

      <Textarea
        id="description"
        label="Description"
        rows={5}
        placeholder="Tell attendees what to expect…"
        value={form.description}
        onChange={(e) => set('description', e.target.value)}
        error={errors.description}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label" htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            className="input"
            value={form.date}
            onChange={(e) => set('date', e.target.value)}
          />
          {errors.date && <p className="mt-1 text-xs text-danger">{errors.date}</p>}
        </div>
        <div>
          <label className="label" htmlFor="startTime">Start Time</label>
          <input
            id="startTime"
            type="time"
            className="input"
            value={form.startTime}
            onChange={(e) => set('startTime', e.target.value)}
          />
          {errors.startTime && <p className="mt-1 text-xs text-danger">{errors.startTime}</p>}
        </div>
        <div>
          <label className="label" htmlFor="endTime">End Time</label>
          <input
            id="endTime"
            type="time"
            className="input"
            value={form.endTime}
            onChange={(e) => set('endTime', e.target.value)}
          />
          {errors.endTime && <p className="mt-1 text-xs text-danger">{errors.endTime}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          id="location"
          label="Location"
          placeholder="e.g. Colombo Innovation Hub"
          value={form.location}
          onChange={(e) => set('location', e.target.value)}
          error={errors.location}
        />
        <Input
          id="capacity"
          type="number"
          min="1"
          label="Capacity"
          placeholder="e.g. 100"
          value={form.capacity}
          onChange={(e) => set('capacity', e.target.value)}
          error={errors.capacity}
        />
      </div>

      <Input
        id="image"
        label="Image URL (optional)"
        placeholder="https://…"
        value={form.image}
        onChange={(e) => set('image', e.target.value)}
      />

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
