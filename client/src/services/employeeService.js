import api from './api';

export const employeeService = {
  // Get all employees
  getAll: async (params) => {
    const response = await api.get('/employees', { params });
    return response.data;
  },

  // Get employee by ID
  getById: async (id) => {
    const response = await api.get(`/employees/${id}`);
    return response.data;
  },

  // Create new employee
  create: async (data) => {
    const response = await api.post('/employees', data);
    return response.data;
  },

  // Update employee
  update: async (id, data) => {
    const response = await api.put(`/employees/${id}`, data);
    return response.data;
  },

  // Delete employee
  delete: async (id) => {
    const response = await api.delete(`/employees/${id}`);
    return response.data;
  },

  // Get employee statistics
  getStats: async () => {
    const response = await api.get('/employees/stats');
    return response.data;
  }
};
