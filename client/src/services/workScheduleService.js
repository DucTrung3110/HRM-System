
import axiosClient from './axiosClient';

export const workScheduleService = {
  // Get work schedules with filters
  getAll: async (params) => {
    const response = await axiosClient.get('/work-schedules', { params });
    return response.data;
  },

  // Create work schedule
  create: async (data) => {
    const response = await axiosClient.post('/work-schedules', data);
    return response.data;
  },

  // Update work schedule
  update: async (id, data) => {
    const response = await axiosClient.patch(`/work-schedules/${id}`, data);
    return response.data;
  },

  // Delete work schedule
  delete: async (id) => {
    const response = await axiosClient.delete(`/work-schedules/${id}`);
    return response.data;
  }
};
