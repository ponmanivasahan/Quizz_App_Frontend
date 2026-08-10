import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    // Based on backend response: { success: true, data: { id, name, email, role, token } }
    const responseData = response.data.data || response.data;
    
    const { token, ...user } = responseData;

    // Hardcode admin role for the requested test account
    if (user.email === 'admin123@gmail.com') {
      user.role = 'admin';
    }

    return { token, user };
  },
  register: async (userData) => {
    const response = await axiosInstance.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  }
};
