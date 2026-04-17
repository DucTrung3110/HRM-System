import axiosClient from './axiosClient';

export const leaveService = {
  getTypes: async () => {
    const response = await axiosClient.get('/leave-types');
    return response.data;
  },

  getBalances: async (employee_id) => {
    const response = await axiosClient.get(`/leave-balances/${employee_id}`);
    return response.data;
  },

  getRequests: async (params) => {
    const response = await axiosClient.get('/leaves', { params });
    return response.data;
  },

  createRequest: async (data) => {
    const response = await axiosClient.post('/leaves', {
      employee_id: data.employee_id,
      leave_type_id: data.leave_type_id,
      start_date: data.start_date,
      end_date: data.end_date,
      total_days: data.total_days,
      reason: data.reason,
      status: data.status || 'pending'
    });
    return response.data;
  },

  updateRequest: async (id, data) => {
    const response = await axiosClient.put(`/leaves/${id}`, data);
    return response.data;
  },

  approveRequest: async (id, approved_by) => {
    const response = await axiosClient.put(`/leaves/${id}/approve`, {
      approved_by: approved_by
    });
    return response.data;
  },

  rejectRequest: async (id, approved_by) => {
    const response = await axiosClient.put(`/leaves/${id}/reject`, {
      approved_by: approved_by
    });
    return response.data;
  }
};
