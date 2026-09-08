import { api } from './api';

export const dashboardService = {
  getUserDashboard: async () => {
    return await api.get('/dashboard/user');
  },

  getAdminDashboard: async () => {
    return await api.get('/admin/dashboard');
  }
};
