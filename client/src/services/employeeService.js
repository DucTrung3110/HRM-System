
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
    // If data already has nested employment object, use it directly
    // Otherwise build the payload from flat data
    let payload;
    
    if (data.employment) {
      // Data is already properly structured from the view
      payload = {
        code: data.code,
        user_id: data.user_id || null,
        full_name: data.full_name,
        gender: data.gender || null,
        dob: data.dob || null,
        personal_email: data.personal_email || null,
        personal_phone: data.personal_phone || null,
        address: data.address || null,
        bank_name: data.bank_name || null,
        bank_account: data.bank_account || null,
        employment: data.employment
      };
    } else {
      // Build from flat data (legacy support)
      payload = {
        code: data.code,
        user_id: data.user_id || null,
        full_name: data.full_name,
        gender: data.gender || null,
        dob: data.dob || null,
        personal_email: data.personal_email || null,
        personal_phone: data.personal_phone || null,
        employment: {
          department_id: data.department_id || null,
          job_title_id: data.job_title_id || null,
          start_date: data.start_date || null,
          salary: data.salary || null,
          work_location: data.work_location || null,
          employment_type: data.employment_type || 'fulltime',
          employment_status: data.employment_status || 'active',
          report_to: data.report_to || null
        }
      };
    }
    
    const response = await axiosClient.post('/employees', payload);
    return response.data;
  },

  // Update employee
  // IMPORTANT: Laravel backend expects employment data nested in 'employment' object for history tracking
  update: async (id, data) => {
    const employmentFields = ['department_id', 'job_title_id', 'start_date', 'end_date', 'salary', 
                              'work_location', 'employment_type', 'employment_status', 'report_to'];
    
    let payload = { ...data };
    
    // Case 1: Data already has nested employment object - use it directly
    if (data.employment && typeof data.employment === 'object') {
      // Already properly structured, just forward it
      const response = await axiosClient.patch(`/employees/${id}`, payload);
      return response.data;
    }
    
    // Case 2: Data has flat employment fields - build nested structure
    const hasEmploymentFields = employmentFields.some(field => data[field] !== undefined);
    
    if (hasEmploymentFields) {
      const employment = {};
      employmentFields.forEach(field => {
        if (data[field] !== undefined) {
          employment[field] = data[field];
          delete payload[field];
        }
      });
      payload.employment = employment;
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
