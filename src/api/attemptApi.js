import axiosInstance from './axiosInstance';

export const attemptApi = {
  getAllAttempts: async () => {
    const response = await axiosInstance.get('/attempts');
    return response.data;
  },
  getAttemptById: async (id) => {
    const response = await axiosInstance.get(`/attempts/${id}`);
    return response.data;
  },
  getMyAttempts: async () => {
    const response = await axiosInstance.get('/attempts/my');
    return response.data;
  },
  startAttempt: async (quizId) => {
    const response = await axiosInstance.post(`/attempts/start/${quizId}`);
    return response.data;
  },
  submitAttempt: async (attemptId, data) => {
    const response = await axiosInstance.post(`/attempts/${attemptId}/submit`, data);
    return response.data;
  },
  getAttemptReview: async (attemptId) => {
    const response = await axiosInstance.get(`/attempts/${attemptId}/review`);
    return response.data;
  }
};
