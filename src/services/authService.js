import { api } from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data?.token) {
      localStorage.setItem('aitm_token', res.data.token);
      localStorage.setItem('aitm_user', JSON.stringify(res.data.user));
      localStorage.setItem('aitm_role', res.data.user.role === 'ADMIN' ? 'Admin' : 'User');
    }
    return res;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    const userData = res.data?.user || res.data;
    if (res.success && userData) {
      localStorage.setItem('aitm_user', JSON.stringify(userData));
      localStorage.setItem('aitm_role', userData.role === 'ADMIN' ? 'Admin' : 'User');
    }
    return { ...res, data: userData };
  },

  logout: () => {
    localStorage.removeItem('aitm_token');
    localStorage.removeItem('aitm_user');
    localStorage.removeItem('aitm_role');
  }
};
