import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { Trophy, Medal, Star } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const StudentLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRankData, setMyRankData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const responseData = await analyticsApi.getLeaderboard();
        
        let lbArray = [];
        if (Array.isArray(responseData)) {
          lbArray = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // Check common wrapper patterns
          if (Array.isArray(responseData.leaderboard)) {
            lbArray = responseData.leaderboard;
          } else if (Array.isArray(responseData.data)) {
            lbArray = responseData.data;
          } else if (responseData.data && Array.isArray(responseData.data.leaderboard)) {
            lbArray = responseData.data.leaderboard;
          }
          
          // Extract myRank
          if (responseData.myRank) {
            setMyRankData(responseData.myRank);
          } else if (responseData.data && responseData.data.myRank) {
            setMyRankData(responseData.data.myRank);
          }
        }
        
        setLeaderboard(lbArray);
      } catch (error) {
        console.error('Failed to load leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center animate-fade-in">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      <div className="text-center animate-slide-up">
        <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Global Leaderboard</h1>
        <p className="text-gray-500 font-medium mt-2">See how you stack up against your peers.</p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center animate-fade-in">
          <p className="text-gray-500 font-medium">No leaderboard data available yet.</p>
        </div>
      ) : (
        <>
          {/* Podium for Top 3 */}
          <div className="flex flex-col sm:flex-row justify-center items-end gap-4 sm:gap-6 pt-10 pb-16 animate-slide-up stagger-1">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="w-full sm:w-1/3 flex flex-col items-center order-2 sm:order-1">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full border-4 border-gray-300 flex items-center justify-center shadow-lg relative z-10">
                    <span className="text-2xl font-bold text-gray-500">{topThree[1].name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="absolute -bottom-3 -right-2 bg-gray-200 text-gray-600 rounded-full p-1 border-2 border-white z-20">
                    <Medal className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white w-full rounded-t-2xl border-t border-l border-r border-gray-200 pt-6 pb-4 px-4 text-center shadow-[0_-10px_40px_rgb(0,0,0,0.05)] h-32 flex flex-col justify-between relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">2nd</div>
                  <div>
                    <h3 className="font-bold text-gray-900 truncate">{topThree[1].name}</h3>
                    <p className="text-xs font-semibold text-gray-500">{topThree[1].totalAttempts || topThree[1].attempts} Quizzes</p>
                  </div>
                  <p className="text-xl font-black text-indigo-600">{Math.round(topThree[1].averagePercentage || 0)}%</p>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="w-full sm:w-1/3 flex flex-col items-center order-1 sm:order-2 z-10">
                <div className="relative mb-4">
                  <div className="w-24 h-24 bg-amber-50 rounded-full border-4 border-amber-400 flex items-center justify-center shadow-xl relative z-10">
                    <span className="text-3xl font-bold text-amber-500">{topThree[0].name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="absolute -bottom-4 -right-2 bg-amber-100 text-amber-600 rounded-full p-1.5 border-2 border-white z-20 ">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                  </div>
                </div>
                <div className="bg-gradient-to-b from-amber-50 to-white w-full rounded-t-2xl border-t border-l border-r border-amber-200 pt-6 pb-4 px-4 text-center shadow-[0_-10px_40px_rgb(251,191,36,0.15)] h-40 flex flex-col justify-between relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-xs font-bold px-3 py-0.5 rounded-full ">1st Place</div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg truncate">{topThree[0].name}</h3>
                    <p className="text-xs font-semibold text-gray-500">{topThree[0].totalAttempts || topThree[0].attempts} Quizzes</p>
                  </div>
                  <p className="text-3xl font-black text-amber-600">{Math.round(topThree[0].averagePercentage || 0)}%</p>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="w-full sm:w-1/3 flex flex-col items-center order-3 sm:order-3">
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-orange-50 rounded-full border-4 border-orange-300 flex items-center justify-center shadow-lg relative z-10">
                    <span className="text-2xl font-bold text-orange-500">{topThree[2].name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="absolute -bottom-3 -right-2 bg-orange-100 text-orange-600 rounded-full p-1 border-2 border-white z-20">
                    <Medal className="w-5 h-5" />
                  </div>
                </div>
                <div className="bg-white w-full rounded-t-2xl border-t border-l border-r border-gray-200 pt-6 pb-4 px-4 text-center shadow-[0_-10px_40px_rgb(0,0,0,0.05)] h-28 flex flex-col justify-between relative">
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">3rd</div>
                  <div>
                    <h3 className="font-bold text-gray-900 truncate">{topThree[2].name}</h3>
                  </div>
                  <p className="text-xl font-black text-indigo-600">{Math.round(topThree[2].averagePercentage || 0)}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Current User Rank Highlight */}
          {myRankData && (
             <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-center justify-between animate-fade-in  shadow-indigo-100/50">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                   #{myRankData.rank || '?'}
                 </div>
                 <div>
                   <h4 className="font-bold text-indigo-900">Your Ranking</h4>
                   <p className="text-sm font-medium text-indigo-700/80">Keep going to reach the top!</p>
                 </div>
               </div>
               <div className="text-right">
                 <p className="font-bold text-indigo-900">{Math.round(myRankData.averagePercentage || 0)}%</p>
                 <p className="text-xs font-semibold text-indigo-700/80">Avg. Score: {myRankData.averageScore || 0}</p>
               </div>
             </div>
          )}

          {/* List for the rest */}
          {rest.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden animate-slide-up stagger-2">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-20">Rank</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Attempts</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Avg Score</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Average %</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-50">
                    {rest.map((student, index) => {
                      const rank = index + 4;
                      const isMe = user?.id === student.id || user?.email === student.email;
                      
                      return (
                        <tr key={index} className={`${isMe ? 'bg-indigo-50/50' : 'hover:bg-gray-50/50'} transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-bold text-gray-400">#{rank}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                {student.name?.charAt(0).toUpperCase()}
                              </div>
                              <span className={`font-semibold ${isMe ? 'text-indigo-700' : 'text-gray-900'}`}>
                                {student.name} {isMe && <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">You</span>}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                            {student.totalAttempts || student.attempts || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                            {student.averageScore !== undefined ? Number(student.averageScore).toFixed(1) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <span className="font-bold text-gray-900">{Math.round(student.averagePercentage || 0)}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentLeaderboard;
