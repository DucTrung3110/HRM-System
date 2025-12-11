
import axiosClient from './axiosClient';

export const workShiftService = {
  // Get all work shifts
  getAll: async () => {
    const response = await axiosClient.get('/work-shifts');
    return response.data;
  },

  // Create work shift
  create: async (data) => {
    const response = await axiosClient.post('/work-shifts', data);
    return response.data;
  },

  // Update work shift
  update: async (id, data) => {
    const response = await axiosClient.patch(`/work-shifts/${id}`, data);
    return response.data;
  },

  // Delete work shift
  delete: async (id) => {
    const response = await axiosClient.delete(`/work-shifts/${id}`);
    return response.data;
  }
};
