import axiosInstance from './axiosInstance';

export const userApi = {
  getAllUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },
  getUserById: async (id) => {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id, userData) => {
    const response = await axiosInstance.put(`/users/${id}`, userData);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  }
};
