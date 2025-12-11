import axiosClient from './axiosClient';

export const salaryService = {
  // Get all salary components
  getComponents: async () => {
    const response = await axiosClient.get('/salary-components');
    return response.data;
  },

  // Create salary component
  createComponent: async (data) => {
    const response = await axiosClient.post('/salary-components', data);
    return response.data;
  },

  // Update salary component
  updateComponent: async (id, data) => {
    const response = await axiosClient.patch(`/salary-components/${id}`, data);
    return response.data;
  },

  // Delete salary component
  deleteComponent: async (id) => {
    const response = await axiosClient.delete(`/salary-components/${id}`);
    return response.data;
  }
};