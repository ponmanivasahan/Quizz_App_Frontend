import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi } from '../../api/analyticsApi';
import { attemptApi } from '../../api/attemptApi';
import { quizApi } from '../../api/quizApi';
import { BookOpen, CheckCircle, TrendingUp, Award, Clock, ArrowRight } from 'lucide-react';

const StudentDashboard = () => {
  const [performance, setPerformance] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [perfData, attemptsData, quizzesData] = await Promise.all([
          analyticsApi.getMyPerformance().catch(() => null),
          attemptApi.getMyAttempts().catch(() => []),
          quizApi.getAllQuizzes().catch(() => [])
        ]);

        if (perfData) setPerformance(perfData);
        
        const attempts = Array.isArray(attemptsData) ? attemptsData : (attemptsData.attempts || []);
        setRecentAttempts(attempts.slice(0, 3)); // Just top 3 recent

        const quizzes = Array.isArray(quizzesData) ? quizzesData : (quizzesData.quizzes || []);
        const publishedQuizzes = quizzes.filter(q => q.status === 'published' || q.status === 'active');
        setAvailableQuizzes(publishedQuizzes.slice(0, 3)); // Just 3 for dashboard
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-2 font-medium">{subtitle}</p>}
        </div>
        <div className={`p-4 rounded-xl ${colorClass}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center animate-fade-in">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex justify-between items-end animate-slide-up">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Your Dashboard</h1>
          <p className="text-gray-500 font-medium mt-1">Track your progress and find your next challenge.</p>
        </div>
        <Link to="/student/quizzes" className="hidden sm:flex bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-200 items-center gap-2">
          Find Quizzes <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-slide-up stagger-1">
        <StatCard 
          title="Quizzes Taken" 
          value={performance?.totalAttempts || 0} 
          icon={CheckCircle} 
          colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200" 
        />
        <StatCard 
          title="Avg. Score" 
          value={performance?.averageScore ? performance.averageScore.toFixed(1) : '0'} 
          icon={TrendingUp} 
          colorClass="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200" 
        />
        <StatCard 
          title="Avg. Percentage" 
          value={`${performance?.averagePercentage ? Math.round(performance.averagePercentage) : 0}%`} 
          icon={Award} 
          colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200" 
        />
        <StatCard 
          title="Highest Score" 
          value={performance?.highestScore || 0} 
          icon={Award} 
          colorClass="bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-200" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-slide-up stagger-2">
        {/* Recommended Quizzes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-bold text-gray-900">Recommended For You</h2>
            <Link to="/student/quizzes" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableQuizzes.length > 0 ? availableQuizzes.map(quiz => (
              <div key={quiz.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)] hover:border-indigo-100 hover:shadow-[0_4px_20px_rgb(79,70,229,0.08)] transition-all group">
                <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                  <BookOpen className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1">{quiz.title}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{quiz.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {quiz.duration} mins
                  </span>
                  <Link to={`/student/quizzes/${quiz.id}`} className="text-sm font-semibold text-indigo-600 group-hover:text-indigo-800 flex items-center gap-1">
                    Start <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            )) : (
              <div className="col-span-full bg-white p-8 rounded-2xl border border-gray-100 text-center">
                <p className="text-gray-500 font-medium">No new quizzes available right now.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
            <Link to="/student/attempts" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">History</Link>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgb(0,0,0,0.02)] overflow-hidden">
            {recentAttempts.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {recentAttempts.map(attempt => (
                  <Link key={attempt.id} to={`/student/result/${attempt.id}`} className="flex items-center justify-between p-4 hover:bg-gray-50/80 transition-colors group">
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{attempt.quizTitle || attempt.quiz?.title || 'Quiz'}</p>
                      <p className="text-xs font-medium text-gray-500">{new Date(attempt.createdAt || attempt.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{attempt.percentage}%</p>
                      <p className={`text-xs font-semibold ${attempt.status === 'passed' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {attempt.status ? attempt.status.toUpperCase() : 'COMPLETED'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-500 text-sm font-medium">You haven't taken any quizzes yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
