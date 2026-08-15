import React, { useEffect, useState } from 'react';
import { attemptApi } from '../../api/attemptApi';
import { 
  Search, Filter, BookOpen, CheckCircle, XCircle, 
  Clock, Target, Award, TrendingUp, ArrowRight, Eye, List, AlertCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const fetchAttempts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const responseData = await attemptApi.getMyAttempts();
        
        let attemptsArray = [];
        if (Array.isArray(responseData)) {
          attemptsArray = responseData;
        } else if (responseData && typeof responseData === 'object') {
          if (Array.isArray(responseData.attempts)) {
            attemptsArray = responseData.attempts;
          } else if (Array.isArray(responseData.data)) {
            attemptsArray = responseData.data;
          } else if (responseData.data && Array.isArray(responseData.data.attempts)) {
            attemptsArray = responseData.data.attempts;
          }
        }
        
        setAttempts(attemptsArray);
      } catch (err) {
        console.error('Failed to load attempts:', err);
        setError('Unable to load your attempts. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  // --- Calculations for Summary Cards ---
  const totalAttempts = attempts.length;
  const completedAttempts = attempts.filter(a => a.status === 'passed' || a.status === 'failed');
  const passedAttempts = attempts.filter(a => a.status === 'passed').length;
  
  const validPercentages = completedAttempts
    .map(a => Number(a.percentage))
    .filter(p => !isNaN(p));

  const averageScore = validPercentages.length > 0 
    ? Math.round(validPercentages.reduce((a, b) => a + b, 0) / validPercentages.length)
    : 0;

  const bestScore = validPercentages.length > 0 
    ? Math.max(...validPercentages)
    : 0;

  // --- Helpers ---
  const isInvalidDate = (dateString) => {
    if (!dateString) return true;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return true;
    if (date.getFullYear() === 1970) return true;
    return false;
  };

  const getPerformanceMessage = (percentage, status) => {
    if (status === 'failed') return "Keep practicing";
    if (percentage >= 90) return "Excellent performance";
    if (percentage >= 75) return "Good progress";
    if (percentage >= 60) return "Fair effort";
    return "Needs improvement";
  };

  // --- Filtering & Sorting ---
  const filteredAndSortedAttempts = attempts
    .filter(attempt => {
      const quizTitle = (attempt.quizTitle || attempt.quiz?.title || 'Quiz').toLowerCase();
      const matchesSearch = quizTitle.includes(searchTerm.toLowerCase());
      
      const normalizedStatus = attempt.status || 'in_progress';
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest' || sortOrder === 'oldest') {
        const dateA = new Date(a.createdAt || a.submittedAt || 0).getTime();
        const dateB = new Date(b.createdAt || b.submittedAt || 0).getTime();
        return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
      }
      if (sortOrder === 'highest' || sortOrder === 'lowest') {
        const scoreA = Number(a.percentage) || 0;
        const scoreB = Number(b.percentage) || 0;
        return sortOrder === 'highest' ? scoreB - scoreA : scoreA - scoreB;
      }
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Attempts</h1>
        <p className="text-gray-500 font-medium mt-2 text-lg">
          Track your quiz attempts, scores, and progress. Review your performance and keep improving.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-slide-up stagger-1">
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg"><Target className="w-5 h-5 text-indigo-600" /></div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Attempts</p>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalAttempts}</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg"><TrendingUp className="w-5 h-5 text-blue-600" /></div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Average Score</p>
          </div>
          <p className="text-3xl font-black text-gray-900">{averageScore}%</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg"><CheckCircle className="w-5 h-5 text-emerald-600" /></div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Quizzes Passed</p>
          </div>
          <p className="text-3xl font-black text-gray-900">{passedAttempts}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg"><Award className="w-5 h-5 text-amber-600" /></div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Best Score</p>
          </div>
          <p className="text-3xl font-black text-gray-900">{bestScore}%</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col md:flex-row gap-4 animate-slide-up stagger-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search your quiz attempts..."
            className="pl-11 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="pl-10 pr-10 py-3 w-full sm:w-auto bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>

          <select
            className="px-5 py-3 w-full sm:w-auto bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Score</option>
            <option value="lowest">Lowest Score</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="animate-slide-up stagger-3">
        {error ? (
          <div className="bg-red-50 border border-red-100 p-8 rounded-2xl text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-red-900 mb-2">Unable to load attempts</h3>
            <p className="text-red-700 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col md:flex-row gap-6 animate-pulse">
                <div className="flex-1 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                  <div className="h-2 bg-gray-100 rounded-full w-2/3 mt-6"></div>
                </div>
                <div className="w-full md:w-48 h-12 bg-gray-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : attempts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No quiz attempts yet</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto mb-8">
              Take your first quiz and your results will appear here. Track your learning journey step by step.
            </p>
            <Link 
              to="/student/quizzes" 
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              Explore Quizzes <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : filteredAndSortedAttempts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No matching attempts</h3>
            <p className="text-gray-500">Try adjusting your filters or search terms.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedAttempts.map((attempt) => {
              const status = attempt.status || 'in_progress';
              const isInProgress = status === 'in_progress';
              const isPassed = status === 'passed';
              const isFailed = status === 'failed';
              
              const title = attempt.quizTitle || attempt.quiz?.title || 'Unknown Quiz';
              const attemptNum = attempt.attemptNumber || 1;
              const maxAttempts = attempt.quiz?.maximumAttempts;
              const attemptText = maxAttempts ? `Attempt ${attemptNum} of ${maxAttempts}` : `Attempt ${attemptNum}`;
              
              const rawDate = attempt.createdAt || attempt.submittedAt;
              const dateText = isInvalidDate(rawDate) 
                ? (isInProgress ? 'Started recently' : 'Date unavailable') 
                : new Date(rawDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

              const score = attempt.score !== undefined ? attempt.score : '—';
              const totalMarks = attempt.totalMarks !== undefined ? attempt.totalMarks : '—';
              const percentage = attempt.percentage !== undefined ? attempt.percentage : 0;
              const hasScore = attempt.score !== undefined;

              return (
                <div 
                  key={attempt.id} 
                  className="bg-white rounded-2xl border border-gray-100 p-5 md:p-7 flex flex-col lg:flex-row gap-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-gray-200 transition-all duration-300 hover:-translate-y-0.5 group"
                >
                  
                  {/* Left: Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-indigo-500" />
                          {title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-gray-500">
                          <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded text-xs tracking-wider uppercase">
                            {attemptText}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" /> {dateText}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {isPassed && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
                            <CheckCircle className="w-4 h-4" /> Passed
                          </span>
                        )}
                        {isFailed && (
                          <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
                            <XCircle className="w-4 h-4" /> Failed
                          </span>
                        )}
                        {isInProgress && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5">
                            <span className="relative flex h-3 w-3 mr-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                            </span>
                            In Progress
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Score visualization (Only if not in progress and has score) */}
                    {!isInProgress ? (
                      <div className="mt-6 max-w-lg">
                        <div className="flex justify-between text-sm font-bold mb-2">
                          <span className="text-gray-900">{percentage}% <span className="text-gray-400 font-medium ml-1">({score} / {totalMarks} pts)</span></span>
                          <span className="text-gray-500">{getPerformanceMessage(percentage, status)}</span>
                        </div>
                        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ease-out ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
                        <p className="text-amber-800 font-medium text-sm flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Your attempt hasn't been submitted yet. Continue where you left off.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center border-t lg:border-t-0 lg:border-l border-gray-100 pt-5 lg:pt-0 lg:pl-6 min-w-[200px]">
                    {isInProgress ? (
                      <Link 
                        to={`/student/quiz/`}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 shadow-sm shadow-amber-500/20 transition-all hover:-translate-y-0.5"
                      >
                        Continue Quiz <ArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <>
                        <Link 
                          to={`/student/result/`}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                        >
                          <Eye className="w-4 h-4" /> View Result
                        </Link>
                        <Link 
                          to={`/student/review/`}
                          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          <List className="w-4 h-4" /> Review Answers
                        </Link>
                      </>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default StudentAttempts;
