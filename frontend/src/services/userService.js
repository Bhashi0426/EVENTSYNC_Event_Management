import api from './api';

export const userService = {
  async list(params = {}) {
    const { data } = await api.get('/users', { params });
    return data.data; // { users, pagination }
  },
  async get(id) {
    const { data } = await api.get(`/users/${id}`);
    return data.data.user;
  },
  async update(id, payload) {
    const { data } = await api.put(`/users/${id}`, payload);
    return data.data.user;
  },
  async changeRole(id, role) {
    const { data } = await api.patch(`/users/${id}/role`, { role });
    return data.data.user;
  },
  async changeStatus(id, status) {
    const { data } = await api.patch(`/users/${id}/status`, { status });
    return data.data.user;
  },
};

export default userService;
