import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  // If there's a specific logout endpoint or user info endpoint
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
};
