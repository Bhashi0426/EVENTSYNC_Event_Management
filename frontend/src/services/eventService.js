import api from './api';

export const eventService = {
  async list(params = {}) {
    const { data } = await api.get('/events', { params });
    return data.data; // { events, pagination }
  },
  async get(id) {
    const { data } = await api.get(`/events/${id}`);
    return data.data; // { event, stats, myRsvp }
  },
  async create(payload) {
    const { data } = await api.post('/events', payload);
    return data.data.event;
  },
  async update(id, payload) {
    const { data } = await api.put(`/events/${id}`, payload);
    return data.data.event;
  },
  async remove(id) {
    await api.delete(`/events/${id}`);
  },
  async attendees(id) {
    const { data } = await api.get(`/events/${id}/attendees`);
    return data.data; // { rsvps, stats, capacity }
  },
};

export default eventService;
