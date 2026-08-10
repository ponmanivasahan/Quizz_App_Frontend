import axiosInstance from './axiosInstance';

export const quizApi = {
  getAllQuizzes: async () => {
    const response = await axiosInstance.get('/quizzes');
    return response.data;
  },
  getQuizById: async (id) => {
    const response = await axiosInstance.get(`/quizzes/${id}`);
    return response.data;
  },
  createQuiz: async (quizData) => {
    const response = await axiosInstance.post('/quizzes', quizData);
    return response.data;
  },
  updateQuiz: async (id, quizData) => {
    const response = await axiosInstance.put(`/quizzes/${id}`, quizData);
    return response.data;
  },
  deleteQuiz: async (id) => {
    const response = await axiosInstance.delete(`/quizzes/${id}`);
    return response.data;
  },
  getQuestions: async (quizId) => {
    const response = await axiosInstance.get(`/quizzes/${quizId}/questions`);
    return response.data;
  },
  createQuestion: async (quizId, questionData) => {
    const response = await axiosInstance.post(`/quizzes/${quizId}/questions`, questionData);
    return response.data;
  },
  updateQuestion: async (id, questionData) => {
    const response = await axiosInstance.put(`/questions/${id}`, questionData);
    return response.data;
  },
  deleteQuestion: async (id) => {
    const response = await axiosInstance.delete(`/questions/${id}`);
    return response.data;
  }
};
