import { api } from './api';

export const reservationService = {
  createReservation: async (data) => {
    return await api.post('/reservations', data);
  },

  getMyReservations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/reservations/my?${query}` : '/reservations/my';
    return await api.get(endpoint);
  },

  getReservationById: async (id) => {
    return await api.get(`/reservations/${id}`);
  },

  cancelReservation: async (id, reason = '') => {
    return await api.patch(`/reservations/${id}/cancel`, { reason });
  },

  getAdminReservations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/admin/reservations?${query}` : '/admin/reservations';
    return await api.get(endpoint);
  },

  getAdminReservationById: async (id) => {
    return await api.get(`/admin/reservations/${id}`);
  },

  approveReservation: async (id, remarks = '') => {
    return await api.patch(`/admin/reservations/${id}/approve`, { remarks });
  },

  rejectReservation: async (id, reason) => {
    return await api.patch(`/admin/reservations/${id}/reject`, { reason });
  }
};
