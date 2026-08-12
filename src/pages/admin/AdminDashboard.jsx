import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { Users, GraduationCap, FileText, CheckSquare, TrendingUp, Award } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalQuizzes: 0,
    totalAttempts: 0,
    averageScore: 0,
    averagePercentage: 0
  });
  
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await analyticsApi.getOverview();
        setStats({
          totalUsers: data.totalUsers || 0,
          totalStudents: data.totalStudents || 0,
          totalQuizzes: data.totalQuizzes || 0,
          totalAttempts: data.totalAttempts || 0,
          averageScore: data.averageScore || 0,
          averagePercentage: data.averagePercentage || 0
        });
          if (data.recentAttempts) {
           setRecentAttempts(data.recentAttempts);
        }
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-xl  border border-gray-100 p-6 flex items-center">
      <div className={`p-4 rounded-full mr-4 ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
     return (
       <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
         {error}
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <Link to="/admin/quizzes" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition">
          Manage Quizzes
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Total Users" value={stats.totalUsers} icon={Users} colorClass="bg-blue-500" />
        <StatCard title="Total Students" value={stats.totalStudents} icon={GraduationCap} colorClass="bg-indigo-500" />
        <StatCard title="Total Quizzes" value={stats.totalQuizzes} icon={FileText} colorClass="bg-purple-500" />
        <StatCard title="Total Attempts" value={stats.totalAttempts} icon={CheckSquare} colorClass="bg-green-500" />
        <StatCard title="Avg. Score" value={stats.averageScore} icon={TrendingUp} colorClass="bg-orange-500" />
        <StatCard title="Avg. Percentage" value={`${stats.averagePercentage}%`} icon={Award} colorClass="bg-yellow-500" />
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl  border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-semibold text-gray-800">Recent Quiz Attempts</h2>
          <Link to="/admin/attempts" className="text-sm font-medium text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        
        {recentAttempts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentAttempts.map((attempt, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attempt.studentName || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attempt.quizTitle || 'Unknown Quiz'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                       <span className="font-semibold">{attempt.score}</span> / {attempt.totalMarks} ({attempt.percentage}%)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(attempt.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attempt.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {attempt.status ? attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1) : 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>No recent attempts found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
