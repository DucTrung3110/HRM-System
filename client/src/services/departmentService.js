
import axiosClient from './axiosClient';

export const departmentService = {
  // Get all departments
  getAll: async () => {
    const response = await axiosClient.get('/departments');
    return response.data;
  },

  // Get department by ID
  getById: async (id) => {
    const response = await axiosClient.get(`/departments/${id}`);
    return response.data;
  },

  // Create new department
  create: async (data) => {
    const response = await axiosClient.post('/departments', {
      code: data.code,
      name: data.name,
      manager_id: data.manager_id,
      parent_id: data.parent_id,
      is_active: data.is_active ?? 1
    });
    return response.data;
  },

  // Update department
  update: async (id, data) => {
    const response = await axiosClient.patch(`/departments/${id}`, data);
    return response.data;
  },

  // Delete department
  delete: async (id) => {
    const response = await axiosClient.delete(`/departments/${id}`);
    return response.data;
  }
};
