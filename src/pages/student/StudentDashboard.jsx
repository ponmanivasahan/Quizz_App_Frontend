import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { analyticsApi } from '../../api/analyticsApi';
import { attemptApi } from '../../api/attemptApi';
import { quizApi } from '../../api/quizApi';
import { 
  BookOpen, CheckCircle, TrendingUp, Award, Clock, ArrowRight, 
  Target, Trophy, BarChart2, Zap, User, Monitor, Star
} from 'lucide-react';
import heroImg from '../../assets/images/student_hero.jpg';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [performance, setPerformance] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [perfData, attemptsData, quizzesData, leaderboardData] = await Promise.all([
          analyticsApi.getMyPerformance().catch(() => null),
          attemptApi.getMyAttempts().catch(() => []),
          quizApi.getAllQuizzes().catch(() => []),
          analyticsApi.getLeaderboard().catch(() => null)
        ]);

        let quizzesArray = [];
        if (Array.isArray(quizzesData)) quizzesArray = quizzesData;
        else if (quizzesData?.quizzes) quizzesArray = quizzesData.quizzes;
        else if (quizzesData?.data?.quizzes) quizzesArray = quizzesData.data.quizzes;
        else if (Array.isArray(quizzesData?.data)) quizzesArray = quizzesData.data;

        const publishedQuizzes = quizzesArray.filter(q => q.status === 'published' || q.status === 'active');
        setAvailableQuizzes(publishedQuizzes.slice(0, 4));
        
        let attemptsArray = [];
        if (Array.isArray(attemptsData)) attemptsArray = attemptsData;
        else if (attemptsData?.attempts) attemptsArray = attemptsData.attempts;
        else if (attemptsData?.data?.attempts) attemptsArray = attemptsData.data.attempts;
        else if (Array.isArray(attemptsData?.data)) attemptsArray = attemptsData.data;
        
        setRecentAttempts(attemptsArray.slice(0, 4));

        if (perfData) {
          setPerformance(perfData.data || perfData.performance || perfData);
        } else {
          const passedCount = attemptsArray.filter(a => a.status === 'passed' || a.percentage >= 50).length;
          const avgScore = attemptsArray.length > 0 
            ? Math.round(attemptsArray.reduce((acc, a) => acc + (a.percentage || 0), 0) / attemptsArray.length) 
            : 0;
            
          setPerformance({
            totalAttempts: attemptsArray.length,
            averagePercentage: avgScore,
            quizzesPassed: passedCount
          });
        }

        if (leaderboardData) {
          if (leaderboardData.myRank) setUserRank(leaderboardData.myRank.rank);
          else if (leaderboardData.data && leaderboardData.data.myRank) setUserRank(leaderboardData.data.myRank.rank);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-8 animate-pulse p-4">
        <div className="h-40 bg-gray-200 rounded-3xl w-full"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-28 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-28 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-28 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-28 bg-gray-200 rounded-2xl w-full"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
      </div>
    );
  }

  const chartData = recentAttempts.slice(0, 5).reverse().map(a => a.percentage || 0);

  return (
    <div className="space-y-6 pb-8 font-sans w-full">
      
      {/* 1. WELCOME HERO */}
      <section className="bg-[#f0f4ff] rounded-2xl overflow-hidden relative animate-slide-up flex flex-col md:flex-row items-center justify-between p-6 md:p-8  border border-indigo-50">
        <div className="flex-1 z-10 max-w-xl">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            Welcome back, {user?.name?.toUpperCase() || 'STUDENT'}! <span>👋</span>
          </h1>
          <p className="text-gray-600 font-medium text-base mb-6">
            Ready to test your knowledge and improve your skills?<br/>
            Explore new assessments and track your learning progress.
          </p>
          <button 
            onClick={() => navigate('/student/quizzes')}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 text-sm"
          >
            Explore Quizzes <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="hidden md:block w-56 lg:w-72 shrink-0 mix-blend-multiply relative z-10">
          <img src={heroImg} alt="Student Learning" className="w-full h-auto object-contain drop-shadow-xl rounded-2xl" />
        </div>
      </section>

      {/* 2. QUICK STATISTICS (Horizontal Cards) */}
      <section>
        <div className="flex justify-between items-center px-1 mb-3">
          <h2 className="text-lg font-bold text-gray-900">Your Progress</h2>
          <Link to="/student/performance" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">View Detailed Analytics <ArrowRight className="w-3 h-3" /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up stagger-1">
          
          <div className="bg-white p-4 rounded-xl border border-gray-100  hover:-translate-y-1 transition-all flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Attempts</p>
              <h3 className="text-xl font-black text-gray-900 leading-none">{performance?.totalAttempts || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100  hover:-translate-y-1 transition-all flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center shrink-0">
              <BarChart2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Average Score</p>
              <h3 className="text-xl font-black text-gray-900 leading-none">{Math.round(performance?.averagePercentage || 0)}%</h3>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100  hover:-translate-y-1 transition-all flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Quizzes Passed</p>
              <h3 className="text-xl font-black text-gray-900 leading-none">{performance?.quizzesPassed || 0}</h3>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-100  hover:-translate-y-1 transition-all flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Leaderboard</p>
              <h3 className="text-xl font-black text-gray-900 leading-none">{userRank ? `#${userRank}` : '-'}</h3>
            </div>
          </div>

        </div>
      </section>

      {/* 3. MAIN GRID (2 COLUMNS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (65%) */}
        <div className="lg:col-span-8 space-y-6 animate-slide-up stagger-2">
          
          {/* Recommended For You */}
          <section>
            <div className="flex justify-between items-center px-1 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recommended For You</h2>
              <Link to="/student/quizzes" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">Browse Library <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {availableQuizzes.length > 0 ? availableQuizzes.map(quiz => (
                <div key={quiz.id} className="bg-white p-5 rounded-2xl border border-gray-100  hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] group">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                      <BookOpen className="w-5 h-5 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 mb-1 line-clamp-1">{quiz.title}</h3>
                      <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">{quiz.description || 'Test your knowledge on this topic.'}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div className="flex gap-3 text-[10px] font-bold text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {quiz.duration} mins</span>
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> {quiz.questionCount || quiz.questions?.length || 15} Qs</span>
                    </div>
                    <Link to={`/student/quizzes/${quiz.id}`} className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      View Quiz
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="col-span-full bg-white p-8 rounded-2xl border border-gray-100 text-center">
                  <p className="text-gray-500 text-sm font-medium">No new quizzes available right now.</p>
                </div>
              )}
            </div>
          </section>

          {/* Performance Overview Chart */}
          <section>
            <div className="flex justify-between items-center px-1 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Performance Overview</h2>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100  p-6 flex items-center justify-between min-h-[180px]">
              <div className="flex-1 max-w-sm">
                <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                  <BarChart2 className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {chartData.length > 0 ? "Here is your recent quiz performance trend." : "Complete some quizzes to see your performance trend. Your progress chart will appear here."}
                </p>
              </div>
              <div className="flex-1 flex items-end justify-end h-24 gap-2">
                {chartData.length > 0 ? chartData.map((val, idx) => (
                  <div key={idx} className="w-8 bg-indigo-200 rounded-t-md hover:bg-indigo-500 transition-all relative group" style={{ height: `${Math.max(15, val)}%` }}>
                     <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded transition-opacity">{val}%</div>
                  </div>
                )) : (
                  // Faded placeholder chart if no data
                  [40, 60, 30, 80, 50].map((val, idx) => (
                    <div key={idx} className="w-8 bg-gray-100 rounded-t-md opacity-50" style={{ height: `${val}%` }}></div>
                  ))
                )}
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (35%) */}
        <div className="lg:col-span-4 space-y-6 animate-slide-up stagger-3">
          
          {/* Recent Activity */}
          <section>
            <div className="flex justify-between items-center px-1 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <Link to="/student/attempts" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">History <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100  p-4">
              {recentAttempts.length > 0 ? (
                <div className="space-y-1">
                  {recentAttempts.map((attempt, idx) => (
                    <Link key={attempt.id || idx} to={`/student/result/${attempt.id}`} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${attempt.status === 'passed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                          <Monitor className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-xs text-gray-900 line-clamp-1">{attempt.quizTitle || attempt.quiz?.title || 'Quiz'}</p>
                          <p className="text-[10px] font-medium text-gray-400">{new Date(attempt.createdAt || attempt.submittedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="font-bold text-xs text-gray-900">{attempt.percentage}%</p>
                        <p className={`text-[9px] font-bold uppercase tracking-wider ${attempt.status === 'passed' ? 'text-emerald-500' : 'text-red-400'}`}>
                          {attempt.status ? attempt.status : 'Completed'}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-gray-400 text-xs font-medium">No recent activity.</p>
                </div>
              )}
            </div>
          </section>

          {/* Achievements Grid */}
          <section>
            <div className="flex justify-between items-center px-1 mb-4">
              <h2 className="text-lg font-bold text-gray-900">Achievements</h2>
              <Link to="/student/profile" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">View All <ArrowRight className="w-3 h-3" /></Link>
            </div>
            <div className="grid grid-cols-3 gap-3">
              
              <div className={`bg-white rounded-2xl p-4 border flex flex-col items-center justify-center text-center transition-all ${recentAttempts.length > 0 ? 'border-indigo-100 ' : 'border-gray-100 opacity-50 grayscale'}`}>
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                   <Star className="w-6 h-6 text-indigo-600 fill-current" />
                </div>
                <h4 className="text-[10px] font-bold text-gray-900 mb-0.5">First Step</h4>
                <p className="text-[8px] text-gray-400">Take your first quiz</p>
              </div>

              <div className={`bg-white rounded-2xl p-4 border flex flex-col items-center justify-center text-center transition-all ${recentAttempts.length >= 5 ? 'border-orange-100 ' : 'border-gray-100 opacity-50 grayscale'}`}>
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                   <Zap className="w-6 h-6 text-orange-500 fill-current" />
                </div>
                <h4 className="text-[10px] font-bold text-gray-900 mb-0.5">Keep Going</h4>
                <p className="text-[8px] text-gray-400">Complete 5 quizzes</p>
              </div>

              <div className={`bg-white rounded-2xl p-4 border flex flex-col items-center justify-center text-center transition-all ${(performance?.highestPercentage || 0) >= 90 ? 'border-blue-100 ' : 'border-gray-100 opacity-50 grayscale'}`}>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                   <Trophy className="w-6 h-6 text-blue-500 fill-current" />
                </div>
                <h4 className="text-[10px] font-bold text-gray-900 mb-0.5">High Scorer</h4>
                <p className="text-[8px] text-gray-400">Score 90% or more</p>
              </div>

            </div>
          </section>

        </div>
      </div>
      
    </div>
  );
};

export default StudentDashboard;
