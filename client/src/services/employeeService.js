
import axiosClient from './axiosClient';

export const employeeService = {
  // Get all employees
  getAll: async (params) => {
    const response = await axiosClient.get('/employees', { params });
    return response.data;
  },

  // Get employee by ID
  getById: async (id) => {
    const response = await axiosClient.get(`/employees/${id}`);
    return response.data;
  },

  // Create new employee
  // IMPORTANT: Laravel backend requires employment data nested in 'employment' object
    // Backend is Express + Drizzle, which expects flattened fields
    let payload = { ...data };
    
    // If the frontend generated a nested employment object, flatten it
    if (payload.employment && typeof payload.employment === 'object') {
      Object.assign(payload, payload.employment);
      delete payload.employment;
    }
    
    try {
      const response = await axiosClient.post('/employees', payload);
      return response.data;
    } catch (error) {
      console.error('API Error details:', error.response?.data);
      throw error;
    }
  },

  // Update employee
  // IMPORTANT: Laravel backend expects employment data nested in 'employment' object for history tracking
  update: async (id, data) => {
    let payload = { ...data };
    
    // Flatten if necessary
    if (payload.employment && typeof payload.employment === 'object') {
      Object.assign(payload, payload.employment);
      delete payload.employment;
    }
    
    const response = await axiosClient.patch(`/employees/${id}`, payload);
    return response.data;
  },

  // Delete employee
  delete: async (id) => {
    const response = await axiosClient.delete(`/employees/${id}`);
    return response.data;
  },

  // Get employment histories for an employee
  getHistories: async (employeeId) => {
    const response = await axiosClient.get(`/employees/${employeeId}/histories`);
    return response.data;
  },

  // Create employment history
  createHistory: async (employeeId, data) => {
    const response = await axiosClient.post(`/employees/${employeeId}/histories`, data);
    return response.data;
  },

  // Get employee salaries
  getSalaries: async (employeeId) => {
    const response = await axiosClient.get(`/employees/${employeeId}/salaries`);
    return response.data;
  },

  // Create employee salary
  createSalary: async (employeeId, data) => {
    const response = await axiosClient.post(`/employees/${employeeId}/salaries`, data);
    return response.data;
  },

  // Update employee salary
  updateSalary: async (employeeId, salaryId, data) => {
    const response = await axiosClient.patch(`/employees/${employeeId}/salaries/${salaryId}`, data);
    return response.data;
  },

  // Delete employee salary
  deleteSalary: async (employeeId, salaryId) => {
    const response = await axiosClient.delete(`/employees/${employeeId}/salaries/${salaryId}`);
    return response.data;
  }
};
