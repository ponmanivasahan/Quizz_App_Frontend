import axiosInstance from './axiosInstance';

export const analyticsApi = {
  getOverview: async () => {
    try {
      const response = await axiosInstance.get('/analytics/overview');
      return response.data;
    } catch (error) {
      // If the backend doesn't have this endpoint yet, return default empty data
      if (error.response && error.response.status === 404) {
        console.warn('Analytics API not found on backend. Returning default data.');
        return {
          totalUsers: 0,
          totalStudents: 0,
          totalQuizzes: 0,
          totalAttempts: 0,
          averageScore: 0,
          averagePercentage: 0,
          recentAttempts: []
        };
      }
      throw error;
    }
  },
  getQuizAnalytics: async (quizId) => {
    try {
      const response = await axiosInstance.get(`/analytics/quiz/${quizId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) return {};
      throw error;
    }
  },
  getMyPerformance: async () => {
    try {
      const response = await axiosInstance.get('/analytics/my-performance');
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) return null;
      throw error;
    }
  },
  getLeaderboard: async () => {
    try {
      const response = await axiosInstance.get('/leaderboard');
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn('Leaderboard API not found on backend. Returning default data.');
        return [];
      }
      throw error;
    }
  }
};
