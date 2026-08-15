import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { 
  Trophy, Medal, Award, Search, Filter, ChevronLeft, ChevronRight,
  User, CheckCircle, TrendingUp, BookOpen, Clock, X
} from 'lucide-react';

const AdminLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Sorting
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('highest_pct');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await analyticsApi.getLeaderboard();
      setLeaderboard(Array.isArray(data) ? data : (data.leaderboard || []));
    } catch (err) {
      console.error(err);
      setError('Unable to load leaderboard. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Calculations for Summary ---
  const totalStudents = leaderboard.length;
  const totalAttempts = leaderboard.reduce((sum, s) => sum + (s.attemptsCount || 0), 0);
  const validAvgs = leaderboard.map(s => Number(s.averagePercentage)).filter(n => !isNaN(n));
  const overallAverage = validAvgs.length > 0 
    ? Math.round(validAvgs.reduce((a, b) => a + b, 0) / validAvgs.length)
    : 0;
  const passingStudents = validAvgs.filter(score => score >= 70).length;
  const passRate = totalStudents > 0 ? Math.round((passingStudents / totalStudents) * 100) : 0;

  // --- Filtering & Sorting ---
  const filteredAndSorted = leaderboard
    .filter(student => {
      const search = searchTerm.toLowerCase();
      return (
        (student.name || '').toLowerCase().includes(search) ||
        (student.email || '').toLowerCase().includes(search)
      );
    })
    .sort((a, b) => {
      if (sortOrder === 'highest_pct') return (b.averagePercentage || 0) - (a.averagePercentage || 0);
      if (sortOrder === 'lowest_pct') return (a.averagePercentage || 0) - (b.averagePercentage || 0);
      if (sortOrder === 'most_attempts') return (b.attemptsCount || 0) - (a.attemptsCount || 0);
      return 0;
    });

  // --- Pagination ---
  const totalPages = Math.ceil(filteredAndSorted.length / itemsPerPage);
  const paginatedData = filteredAndSorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Reset page on filter/sort change ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  const topThree = [...leaderboard].sort((a, b) => (b.averagePercentage || 0) - (a.averagePercentage || 0)).slice(0, 3);

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'S';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Leaderboard</h1>
        <p className="text-gray-500 font-medium mt-2">
          Monitor student performance and quiz rankings.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up stagger-1">
        {[
          { label: 'Total Students', value: totalStudents, icon: User, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Completed Attempts', value: totalAttempts, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Average Score', value: `${overallAverage}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pass Rate', value: `${passRate}%`, icon: CheckCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg ${card.bg}`}><card.icon className={`w-5 h-5 ${card.color}`} /></div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{card.label}</p>
            </div>
            <p className="text-3xl font-black text-gray-900">{isLoading ? '-' : card.value}</p>
          </div>
        ))}
      </div>

      {/* Podium */}
      {!isLoading && topThree.length > 0 && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm animate-slide-up stagger-2">
          <h2 className="text-xl font-bold text-gray-900 mb-10 text-center">Top Performers</h2>
          <div className="flex justify-center items-end gap-2 sm:gap-6 h-48">
            
            {/* Rank 2 */}
            {topThree[1] && (
              <div className="flex flex-col items-center w-28 sm:w-32">
                <div className="w-12 h-12 bg-gray-200 text-gray-700 font-bold rounded-full flex items-center justify-center mb-2 shadow-inner">
                  {getInitials(topThree[1].name)}
                </div>
                <p className="text-sm font-bold text-gray-900 truncate w-full text-center">{topThree[1].name}</p>
                <p className="text-xs text-gray-500 mb-3">{topThree[1].averagePercentage}%</p>
                <div className="w-full bg-gradient-to-t from-gray-300 to-gray-200 h-24 rounded-t-lg flex justify-center pt-4">
                  <span className="text-gray-500 font-black text-xl">#2</span>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {topThree[0] && (
              <div className="flex flex-col items-center w-32 sm:w-40 z-10 -mb-4">
                <Trophy className="w-8 h-8 text-yellow-400 mb-2 drop-shadow-md" />
                <div className="w-16 h-16 bg-yellow-400 text-yellow-900 font-black text-xl rounded-full flex items-center justify-center mb-2 shadow-lg ring-4 ring-yellow-100">
                  {getInitials(topThree[0].name)}
                </div>
                <p className="text-base font-black text-gray-900 truncate w-full text-center">{topThree[0].name}</p>
                <p className="text-sm font-bold text-indigo-600 mb-3">{topThree[0].averagePercentage}%</p>
                <div className="w-full bg-gradient-to-t from-yellow-400 to-yellow-300 h-32 rounded-t-lg flex justify-center pt-4 shadow-lg">
                  <span className="text-yellow-700 font-black text-2xl">#1</span>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {topThree[2] && (
              <div className="flex flex-col items-center w-28 sm:w-32">
                <div className="w-12 h-12 bg-amber-600 text-white font-bold rounded-full flex items-center justify-center mb-2 shadow-inner">
                  {getInitials(topThree[2].name)}
                </div>
                <p className="text-sm font-bold text-gray-900 truncate w-full text-center">{topThree[2].name}</p>
                <p className="text-xs text-gray-500 mb-3">{topThree[2].averagePercentage}%</p>
                <div className="w-full bg-gradient-to-t from-amber-700 to-amber-600 h-20 rounded-t-lg flex justify-center pt-4">
                  <span className="text-amber-200 font-black text-xl">#3</span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 animate-slide-up stagger-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students by name or email..."
            className="pl-11 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <select
            className="px-5 py-3 w-full sm:w-auto bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="highest_pct">Highest Percentage</option>
            <option value="lowest_pct">Lowest Percentage</option>
            <option value="most_attempts">Most Attempts</option>
          </select>
        </div>
      </div>

      {/* Table Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up stagger-4">
        {error ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <p className="text-red-600 font-bold mb-4">{error}</p>
            <button 
              onClick={fetchLeaderboard}
              className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4 p-6">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No completed quiz attempts yet.</h3>
            <p className="text-gray-500">Student rankings will appear after students complete quizzes.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-16">Rank</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Attempts</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[150px]">Performance</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {paginatedData.map((student, index) => {
                    // Absolute rank based on overall sorted leaderboard
                    const absoluteRank = filteredAndSorted.findIndex(s => s.id === student.id) + 1;
                    const pct = student.averagePercentage || 0;
                    
                    return (
                      <tr key={student.id || index} className="hover:bg-blue-50/30 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            absoluteRank === 1 ? 'bg-yellow-100 text-yellow-700' :
                            absoluteRank === 2 ? 'bg-gray-200 text-gray-700' :
                            absoluteRank === 3 ? 'bg-amber-100 text-amber-700' :
                            'bg-gray-50 text-gray-500'
                          }`}>
                            #{absoluteRank}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold flex items-center justify-center">
                              {getInitials(student.name)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 text-center">
                          {student.attemptsCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700 text-center">
                          {student.averageScore || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-full max-w-[120px] h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-700 w-10">{pct}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button 
                            onClick={() => setSelectedStudent(student)}
                            className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Showing <span className="font-bold text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-gray-900">{Math.min(currentPage * itemsPerPage, filteredAndSorted.length)}</span> of <span className="font-bold text-gray-900">{filteredAndSorted.length}</span> students
                </span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Student Performance Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold text-xl flex items-center justify-center">
                  {getInitials(selectedStudent.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-sm text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Performance Overview</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase">Total Attempts</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{selectedStudent.attemptsCount || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-500 uppercase">Average %</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{selectedStudent.averagePercentage || 0}%</p>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Overall Status</p>
                <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl bg-white">
                  <span className="font-semibold text-gray-700">Average Score</span>
                  <span className="font-bold text-gray-900">{selectedStudent.averageScore || 0} pts</span>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLeaderboard;
