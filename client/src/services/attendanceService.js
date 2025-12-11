import axiosClient from './axiosClient';

export const attendanceService = {
  getRecords: async (params) => {
    const response = await axiosClient.get('/attendance', { params });
    return response.data;
  },

  checkIn: async (employee_id, status = 'present') => {
    const response = await axiosClient.post('/attendance/check-in', {
      employee_id,
      status
    });
    return response.data;
  },

  checkOut: async (employee_id) => {
    const response = await axiosClient.post('/attendance/check-out', {
      employee_id
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.put(`/attendance/${id}`, data);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosClient.post('/attendance', data);
    return response.data;
  }
};
