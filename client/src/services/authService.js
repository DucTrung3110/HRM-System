
import axiosClient from './axiosClient';

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
  }
};
