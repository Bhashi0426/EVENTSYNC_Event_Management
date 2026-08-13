import api from './api';

export const notificationService = {
  async list(unread = false) {
    const { data } = await api.get('/notifications', { params: unread ? { unread: 'true' } : {} });
    return data.data; // { notifications, unread }
  },
  async markRead(id) {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.data.notification;
  },
  async markAllRead() {
    await api.patch('/notifications/read-all');
  },
};

export default notificationService;
