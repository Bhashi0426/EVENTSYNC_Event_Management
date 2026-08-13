import api from './api';

export const statsService = {
  async overview() {
    const { data } = await api.get('/stats/overview');
    return data.data; // { totalUsers, totalEvents, upcomingEvents, totalRsvps }
  },
};

export default statsService;
