import { api } from './api';

export const calendarService = {
  getUserCalendar: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/calendar/user?${query}` : '/calendar/user';
    return await api.get(endpoint);
  },

  getAdminCalendar: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/admin/calendar?${query}` : '/admin/calendar';
    return await api.get(endpoint);
  },

  getTodayCalendar: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/admin/calendar/today?${query}` : '/admin/calendar/today';
    return await api.get(endpoint);
  }
};
