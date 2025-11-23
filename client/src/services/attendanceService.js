import api from './api';

export const attendanceService = {
  // Get attendance records
  getRecords: async (params) => {
    const response = await api.get('/attendance', { params });
    return response.data;
  },

  // Get attendance by ID
  getById: async (id) => {
    const response = await api.get(`/attendance/${id}`);
    return response.data;
  },

  // Check in
  checkIn: async (employee_id) => {
    const response = await api.post('/attendance/check-in', { employee_id });
    return response.data;
  },

  // Check out
  checkOut: async (employee_id) => {
    const response = await api.post('/attendance/check-out', { employee_id });
    return response.data;
  },

  // Get attendance trends
  getTrends: async (params) => {
    const response = await api.get('/attendance/trends', { params });
    return response.data;
  },

  // Get today's attendance summary
  getTodaySummary: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  }
};
