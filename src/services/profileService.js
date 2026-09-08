import { api } from './api';

export const profileService = {
  getProfile: async () => {
    return await api.get('/profile');
  },

  updateProfile: async (data) => {
    return await api.patch('/profile', data);
  },

  changePassword: async (data) => {
    return await api.patch('/profile/change-password', data);
  }
};
