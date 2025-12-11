
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
  create: async (data) => {
    const response = await axiosClient.post('/employees', {
      code: data.code,
      user_id: data.user_id || null,
      full_name: data.full_name,
      gender: data.gender,
      dob: data.dob,
      personal_email: data.personal_email,
      personal_phone: data.personal_phone,
      employment: {
        department_id: data.department_id,
        job_title_id: data.job_title_id,
        start_date: data.start_date,
        salary: data.salary,
        work_location: data.work_location,
        employment_type: data.employment_type,
        employment_status: data.employment_status,
        report_to: data.report_to
      }
    });
    return response.data;
  },

  // Update employee
  update: async (id, data) => {
    const response = await axiosClient.patch(`/employees/${id}`, data);
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
