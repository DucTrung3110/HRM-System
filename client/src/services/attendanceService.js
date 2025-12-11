import axiosClient from './axiosClient';

export const attendanceService = {
  getRecords: async (params) => {
    const response = await axiosClient.get('/attendance', { params });
    return response.data;
  },

  checkIn: async (employee_id, status = 'present') => {
    const response = await axiosClient.post('/attendance/checkin', {
      employee_id,
      status
    });
    return response.data;
  },

  checkOut: async (id, status = 'present') => {
    const response = await axiosClient.post('/attendance/checkout', {
      id,
      status
    });
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosClient.patch(`/attendance/${id}`, {
      record_date: data.record_date,
      check_in_time: data.check_in_time,
      check_out_time: data.check_out_time,
      total_work_hours: data.total_work_hours,
      late_minutes: data.late_minutes,
      early_leave_minutes: data.early_leave_minutes,
      overtime_hours: data.overtime_hours,
      status: data.status
    });
    return response.data;
  }
};
