import { api } from './api';

export const adminUserService = {
  getAllUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/admin/users?${query}` : '/admin/users';
    return await api.get(endpoint);
  },

  createUser: async (userData) => {
    return await api.post('/admin/users', userData);
  },

  getUserById: async (id) => {
    return await api.get(`/admin/users/${id}`);
  },

  updateUser: async (id, data) => {
    return await api.patch(`/admin/users/${id}`, data);
  },

  toggleUserStatus: async (id, isActive) => {
    return await api.patch(`/admin/users/${id}/status`, { isActive });
  }
};

