import api from './api';

export const roleService = {
  // Get all roles
  getAll: async () => {
    const response = await api.get('/roles');
    return response.data;
  },

  // Get role by ID
  getById: async (id) => {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  // Create role
  create: async (data) => {
    const response = await api.post('/roles', data);
    return response.data;
  },

  // Update role
  update: async (id, data) => {
    const response = await api.put(`/roles/${id}`, data);
    return response.data;
  },

  // Delete role
  delete: async (id) => {
    const response = await api.delete(`/roles/${id}`);
    return response.data;
  },

  // Get users with specific role
  getUsersByRole: async (role_id) => {
    const response = await api.get(`/roles/${role_id}/users`);
    return response.data;
  },

  // Assign role to user
  assignRole: async (user_id, role_id) => {
    const response = await api.post('/roles/assign', { user_id, role_id });
    return response.data;
  }
};
