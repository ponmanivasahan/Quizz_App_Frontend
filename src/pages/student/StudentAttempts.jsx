import React, { useEffect, useState } from 'react';
import { attemptApi } from '../../api/attemptApi';
import { Eye, Search, Filter, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAttempts = async () => {
      setIsLoading(true);
      try {
        const data = await attemptApi.getMyAttempts();
        setAttempts(Array.isArray(data) ? data : (data.attempts || []));
      } catch (error) {
        console.error('Failed to load attempts:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const filteredAttempts = attempts.filter(attempt => {
    const quizTitle = (attempt.quizTitle || attempt.quiz?.title || '').toLowerCase();
    const searchMatches = quizTitle.includes(searchTerm.toLowerCase());
    const statusMatches = statusFilter === 'all' || attempt.status === statusFilter;
    return searchMatches && statusMatches;
  });

  return (
    <div className="space-y-6 pb-10">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Attempts</h1>
        <p className="text-gray-500 font-medium mt-1">Review your past quiz performances and results.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row gap-4 animate-slide-up stagger-1">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by quiz name..."
            className="pl-11 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-11 pr-8 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-700 appearance-none min-w-[160px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden animate-slide-up stagger-2">
        {isLoading ? (
          <div className="p-16 flex justify-center animate-fade-in">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredAttempts.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">No attempts found matching your criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quiz</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {filteredAttempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {attempt.quizTitle || attempt.quiz?.title || 'Unknown Quiz'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                      {attempt.score} <span className="text-gray-400 font-normal">/ {attempt.totalMarks}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${attempt.percentage >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${Math.min(100, Math.max(0, attempt.percentage))}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-700">{attempt.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {new Date(attempt.createdAt || attempt.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${
                        attempt.status === 'passed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 
                        attempt.status === 'failed' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {attempt.status ? attempt.status.toUpperCase() : 'COMPLETED'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link 
                        to={`/student/result/${attempt.id}`}
                        className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors"
                        title="View Result"
                      >
                        <Eye className="h-5 w-5" />
                      </Link>
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

export default StudentAttempts;
