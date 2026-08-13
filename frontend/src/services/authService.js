import api from './api';

export const authService = {
  async register(payload) {
    const { data } = await api.post('/auth/register', payload);
    return data.data; // { user, token }
  },
  async login(payload) {
    const { data } = await api.post('/auth/login', payload);
    return data.data; // { user, token }
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data.data.user;
  },
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Ignore — we clear local state regardless.
    }
  },
};

export default authService;
