import axiosClient from './axiosClient';

export const roleService = {
  // Get all roles
  getAll: async () => {
    const response = await axiosClient.get('/roles');
    return response.data;
  }
};