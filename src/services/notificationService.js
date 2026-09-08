import { api } from './api';

export const notificationService = {
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/notifications?${query}` : '/notifications';
    return await api.get(endpoint);
  },

  getUnreadCount: async () => {
    return await api.get('/notifications/unread-count');
  },

  getNotificationById: async (id) => {
    return await api.get(`/notifications/${id}`);
  },

  markAsRead: async (id) => {
    return await api.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return await api.patch('/notifications/read-all');
  },

  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`);
  }
};
