import { api } from './api';

export const hallService = {
  getHalls: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/halls?${query}` : '/halls';
    return await api.get(endpoint);
  },

  getHallById: async (id) => {
    return await api.get(`/halls/${id}`);
  },

  checkAvailability: async (hallId, date, startTime, endTime) => {
    return await api.get(`/halls/${hallId}/availability?date=${date}&startTime=${startTime}&endTime=${endTime}`);
  },

  getHallSchedule: async (hallId, date) => {
    return await api.get(`/halls/${hallId}/schedule?date=${date}`);
  },

  getAdminHalls: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/admin/halls?${query}` : '/admin/halls';
    return await api.get(endpoint);
  },

  createHall: async (hallData) => {
    return await api.post('/admin/halls', hallData);
  },

  updateHall: async (id, hallData) => {
    return await api.patch(`/admin/halls/${id}`, hallData);
  },

  toggleHallStatus: async (id, isActive) => {
    return await api.patch(`/admin/halls/${id}/status`, { isActive });
  },

  deleteHall: async (id) => {
    return await api.delete(`/admin/halls/${id}`);
  }
};
