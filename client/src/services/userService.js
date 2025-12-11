
import axiosClient from './axiosClient';

export const userService = {
  // Get all users
  getAll: async () => {
    const response = await axiosClient.get('/users');
    return response.data;
  },

  // Create user
  create: async (data) => {
    const response = await axiosClient.post('/users', data);
    return response.data;
  },

  // Update user
  update: async (id, data) => {
    const response = await axiosClient.patch(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id) => {
    const response = await axiosClient.delete(`/users/${id}`);
    return response.data;
  }
};
