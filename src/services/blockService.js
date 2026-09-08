import { api } from './api';

export const blockService = {
  getHallBlocks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const endpoint = query ? `/admin/hall-blocks?${query}` : '/admin/hall-blocks';
    return await api.get(endpoint);
  },

  getHallBlockById: async (id) => {
    return await api.get(`/admin/hall-blocks/${id}`);
  },

  createHallBlock: async (data) => {
    return await api.post('/admin/hall-blocks', data);
  },

  updateHallBlock: async (id, data) => {
    return await api.patch(`/admin/hall-blocks/${id}`, data);
  },

  toggleBlockStatus: async (id, isActive) => {
    return await api.patch(`/admin/hall-blocks/${id}/status`, { isActive });
  },

  deleteHallBlock: async (id) => {
    return await api.delete(`/admin/hall-blocks/${id}`);
  }
};
