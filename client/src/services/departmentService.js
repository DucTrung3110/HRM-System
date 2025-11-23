import api from './api';

export const departmentService = {
  // Get all departments
  getAll: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  // Get department tree (hierarchical)
  getTree: async () => {
    const response = await api.get('/departments/tree');
    return response.data;
  },

  // Get department by ID
  getById: async (id) => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  // Create new department
  create: async (data) => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  // Update department
  update: async (id, data) => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  // Delete department
  delete: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  // Get employees in department
  getEmployees: async (id) => {
    const response = await api.get(`/departments/${id}/employees`);
    return response.data;
  }
};
