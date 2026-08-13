import api from './api';

export const rsvpService = {
  async setRSVP(eventId, response) {
    const { data } = await api.post(`/events/${eventId}/rsvp`, { response });
    return data.data.rsvp;
  },
  async getMine(eventId) {
    const { data } = await api.get(`/events/${eventId}/rsvp`);
    return data.data.rsvp;
  },
  async cancel(eventId) {
    await api.delete(`/events/${eventId}/rsvp`);
  },
  async myRsvps(response) {
    const params = response && response !== 'all' ? { response } : {};
    const { data } = await api.get('/me/rsvps', { params });
    return data.data.rsvps;
  },
};

export default rsvpService;
