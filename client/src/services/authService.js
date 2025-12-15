
import axiosClient from './axiosClient';

const ADMIN_EMAIL = 'admin.nguyen@congty.vn';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await axiosClient.post('/login', {
      email,
      password
    });
    
    // Store token in localStorage
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
    }
    
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('user_email');
    localStorage.removeItem('role');
    localStorage.removeItem('user_role');
    window.location.href = '/login';
  },

  // Health check (GET)
  healthCheck: async () => {
    const response = await axiosClient.get('/health');
    return response.data;
  },

  // Health check (POST)
  healthCheckPost: async () => {
    const response = await axiosClient.post('/health');
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },

  // Get current token
  getToken: () => {
    return localStorage.getItem('auth_token');
  },

  // Get current user role
  getUserRole: () => {
    return localStorage.getItem('user_role') || 'employee';
  },

  // Check if current user is admin
  isAdmin: () => {
    const role = localStorage.getItem('user_role');
    return role === 'admin';
  },

  // Check if current user is employee (non-admin)
  isEmployee: () => {
    const role = localStorage.getItem('user_role');
    return role === 'employee';
  },

  // Get current user email
  getUserEmail: () => {
    return localStorage.getItem('user_email') || '';
  },

  // Get current user data
  getUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  }
};
