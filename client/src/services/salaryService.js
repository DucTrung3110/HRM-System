import api from './api';

export const salaryService = {
  // Get employee salary details
  getEmployeeSalary: async (employee_id) => {
    const response = await api.get(`/salaries/employee/${employee_id}`);
    return response.data;
  },

  // Get all salaries
  getAll: async (params) => {
    const response = await api.get('/salaries', { params });
    return response.data;
  },

  // Get all salary components
  getComponents: async () => {
    const response = await api.get('/salaries/components');
    return response.data;
  },

  // Create salary component for employee
  createEmployeeSalary: async (data) => {
    const response = await api.post('/salaries', data);
    return response.data;
  },

  // Update salary component
  updateEmployeeSalary: async (id, data) => {
    const response = await api.put(`/salaries/${id}`, data);
    return response.data;
  },

  // Delete salary component
  deleteEmployeeSalary: async (id) => {
    const response = await api.delete(`/salaries/${id}`);
    return response.data;
  },

  // Calculate total salary
  calculateTotal: async (employee_id, date) => {
    const response = await api.get(`/salaries/calculate/${employee_id}`, {
      params: { date }
    });
    return response.data;
  }
};
