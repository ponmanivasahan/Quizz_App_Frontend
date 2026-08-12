import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { Trophy, Medal, Award } from 'lucide-react';

const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsApi.getLeaderboard();
      setLeaderboard(Array.isArray(data) ? data : (data.leaderboard || []));
    } catch (err) {
      setError('Failed to load leaderboard data.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRankIcon = (index) => {
    switch(index) {
      case 0: return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 1: return <Medal className="h-6 w-6 text-gray-400" />;
      case 2: return <Award className="h-6 w-6 text-amber-600" />;
      default: return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Student Leaderboard</h1>

      <div className="bg-white rounded-xl  border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : leaderboard.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Trophy className="h-12 w-12 text-gray-300 mb-4" />
            <p>No leaderboard data available yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Attempts</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Average Score</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Average %</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((student, index) => (
                  <tr key={student.id || index} className={`hover:bg-gray-50 transition ${index < 3 ? 'bg-orange-50/10' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {renderRankIcon(index)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white
                            ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-blue-600'}
                          `}>
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center font-medium">
                      {student.attemptsCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-bold">
                      {student.averageScore || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold
                        ${(student.averagePercentage || 0) >= 80 ? 'bg-green-100 text-green-800' : 
                          (student.averagePercentage || 0) >= 60 ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {student.averagePercentage || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLeaderboard;
