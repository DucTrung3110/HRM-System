import api from './api';

export const leaveService = {
  // Get leave requests
  getRequests: async (params) => {
    const response = await api.get('/leaves', { params });
    return response.data;
  },

  // Get leave request by ID
  getRequestById: async (id) => {
    const response = await api.get(`/leaves/${id}`);
    return response.data;
  },

  // Create leave request
  createRequest: async (data) => {
    const response = await api.post('/leaves', data);
    return response.data;
  },

  // Update leave request
  updateRequest: async (id, data) => {
    const response = await api.put(`/leaves/${id}`, data);
    return response.data;
  },

  // Approve leave request
  approveRequest: async (id, approved_by) => {
    const response = await api.put(`/leaves/${id}/approve`, { approved_by });
    return response.data;
  },

  // Reject leave request
  rejectRequest: async (id, approved_by, reason) => {
    const response = await api.put(`/leaves/${id}/reject`, { approved_by, reason });
    return response.data;
  },

  // Get leave balances
  getBalances: async (employee_id, year) => {
    const response = await api.get(`/leaves/balances/${employee_id}`, {
      params: { year }
    });
    return response.data;
  },

  // Get leave types
  getTypes: async () => {
    const response = await api.get('/leaves/types');
    return response.data;
  }
};
