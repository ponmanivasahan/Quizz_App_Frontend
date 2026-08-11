import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { attemptApi } from '../../api/attemptApi';
import { analyticsApi } from '../../api/analyticsApi';
import { Link } from 'react-router-dom';
import { 
  User, Mail, Shield, Calendar, Award, Target, Trophy, CheckCircle, 
  Clock, ChevronDown, ChevronUp, AlertCircle, HelpCircle, 
  MessageCircleQuestion, Headphones, X, Check, BarChart2, BookOpen, Edit, Key, LogOut
} from 'lucide-react';

const FAQs = [
  {
    q: "How many attempts can I take for a quiz?",
    a: "This depends on the specific quiz configuration set by your instructor. Most quizzes allow 1 to 3 attempts. You can see the remaining attempts before starting a quiz."
  },
  {
    q: "How is my quiz score calculated?",
    a: "Your score is the sum of points for every correctly answered question. The percentage is calculated based on the total possible points."
  },
  {
    q: "What happens if my quiz timer expires?",
    a: "If the timer runs out while you are taking a quiz, your current answers will be automatically submitted and saved."
  },
  {
    q: "Can I leave a quiz while it is in progress?",
    a: "If you leave an active quiz, your progress might not be saved and the attempt could be marked as incomplete. Always try to finish your quiz once started."
  },
  {
    q: "Where can I see my previous attempts?",
    a: "You can view all your previous attempts in the 'My Attempts' section of your student portal, or right here under 'Recent Quiz Activity'."
  }
];

const StudentProfile = () => {
  const { user, logout } = useContext(AuthContext);
  
  // Data States
  const [attempts, setAttempts] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI States
  const [activeFaq, setActiveFaq] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Report Form States
  const [reportForm, setReportForm] = useState({ type: 'Quiz Problem', subject: '', description: '' });
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [attemptsData, perfData] = await Promise.all([
          attemptApi.getMyAttempts(),
          analyticsApi.getMyPerformance().catch(() => null)
        ]);

        // Robust array extraction
        let attemptsArray = [];
        if (Array.isArray(attemptsData)) attemptsArray = attemptsData;
        else if (attemptsData?.attempts) attemptsArray = attemptsData.attempts;
        else if (attemptsData?.data?.attempts) attemptsArray = attemptsData.data.attempts;
        else if (Array.isArray(attemptsData?.data)) attemptsArray = attemptsData.data;

        setAttempts(attemptsArray);
        
        if (perfData) {
          setPerformance(perfData.data || perfData.performance || perfData);
        } else {
          // Calculate manually if performance API fails/doesn't exist
          const passedCount = attemptsArray.filter(a => a.status === 'passed' || a.percentage >= 50).length;
          const avgScore = attemptsArray.length > 0 
            ? Math.round(attemptsArray.reduce((acc, a) => acc + (a.percentage || 0), 0) / attemptsArray.length) 
            : 0;
          const highestScore = attemptsArray.length > 0
            ? Math.max(...attemptsArray.map(a => a.percentage || 0))
            : 0;
            
          setPerformance({
            totalAttempts: attemptsArray.length,
            averagePercentage: avgScore,
            highestPercentage: highestScore,
            quizzesPassed: passedCount
          });
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleReportSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingReport(true);
    setReportError('');
    
    // Simulate API call for support
    setTimeout(() => {
      setIsSubmittingReport(false);
      // Simulate that the backend doesn't have an active support ticketing system yet
      setReportError("Support request functionality is currently unavailable on the server.");
      
      // If it was successful, we would do:
      // setReportSuccess(true);
      // setTimeout(() => setShowReportModal(false), 2000);
    }, 1500);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const recentAttempts = attempts.slice(0, 5); // Get latest 5
  
  // Calculate historical chart data points (last 10 attempts)
  const chartData = attempts.slice(0, 10).reverse().map(a => a.percentage || 0);

  return (
    <div className="space-y-12 pb-20 font-sans w-full">
      
      {/* 1. EXISTING PROFILE CARD */}
      <section className="animate-slide-up">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 font-medium mt-1">Manage your account settings and preferences.</p>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          
          <div className="px-8 pb-10 relative">
            <div className="absolute -top-16 border-4 border-white rounded-full bg-white shadow-lg">
              <div className="w-28 h-28 bg-indigo-100 rounded-full flex items-center justify-center text-4xl font-bold text-indigo-600">
                {user?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
            </div>
            
            <div className="pt-16 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{user?.name || 'Student Name'}</h2>
                <p className="text-gray-500 font-medium">{user?.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 text-sm font-bold rounded-full uppercase tracking-wide">
                  Active
                </span>
                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-800 text-sm font-bold rounded-full capitalize tracking-wide">
                  {user?.role || 'Student'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* 2. QUIZ PERFORMANCE */}
          <section className="animate-slide-up stagger-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Quiz Performance</h2>
              <p className="text-gray-500 font-medium mt-1">Track your assessment progress and achievements.</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Attempts</p>
                <p className="text-3xl font-black text-gray-900">{performance?.totalAttempts || 0}</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Average Score</p>
                <p className="text-3xl font-black text-indigo-600">{Math.round(performance?.averagePercentage || 0)}%</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Highest Score</p>
                <p className="text-3xl font-black text-amber-600">{Math.round(performance?.highestPercentage || 0)}%</p>
              </div>
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-lg transition-all">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Quizzes Passed</p>
                <p className="text-3xl font-black text-emerald-600">{performance?.quizzesPassed || 0}</p>
              </div>
            </div>
          </section>

          {/* 3. RECENT QUIZ ACTIVITY */}
          <section className="animate-slide-up stagger-2">
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Recent Quiz Activity</h2>
                <p className="text-gray-500 font-medium mt-1">Your latest assessment attempts.</p>
              </div>
              <Link to="/student/attempts" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline">
                View All
              </Link>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] overflow-hidden">
              {recentAttempts.length === 0 ? (
                <div className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">No quiz attempts yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/80">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Quiz</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                      {recentAttempts.map((attempt) => (
                        <tr key={attempt.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-900">
                              {attempt.quizTitle || attempt.quiz?.title || 'Unknown Quiz'}
                            </p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-bold text-gray-900">{attempt.percentage}%</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full ${
                              attempt.status === 'passed' ? 'bg-emerald-100 text-emerald-800' : 
                              attempt.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {attempt.status ? attempt.status.charAt(0).toUpperCase() + attempt.status.slice(1) : 'Completed'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                            {new Date(attempt.createdAt || attempt.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <Link 
                              to={`/student/result/${attempt.id}`}
                              className="text-indigo-600 hover:text-indigo-900 font-bold text-sm"
                            >
                              View Result
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          {/* 4. ACHIEVEMENTS & PERFORMANCE OVERVIEW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up stagger-3">
            
            {/* Achievements */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-5 rounded-2xl border transition-all ${attempts.length > 0 ? 'bg-white border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl">⭐</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">First Quiz</h3>
                  <p className="text-xs text-gray-500 mt-1">Completed your first assessment.</p>
                </div>
                
                <div className={`p-5 rounded-2xl border transition-all ${attempts.length >= 5 ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl">🎯</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Quiz Explorer</h3>
                  <p className="text-xs text-gray-500 mt-1">Attempted 5 quizzes.</p>
                </div>
                
                <div className={`p-5 rounded-2xl border transition-all ${(performance?.highestPercentage || 0) >= 90 ? 'bg-white border-emerald-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl">🏆</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">High Scorer</h3>
                  <p className="text-xs text-gray-500 mt-1">Scored above 90%.</p>
                </div>

                <div className={`p-5 rounded-2xl border transition-all ${attempts.length >= 10 ? 'bg-white border-purple-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                    <span className="text-xl">👑</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm">Quiz Master</h3>
                  <p className="text-xs text-gray-500 mt-1">Completed 10 quizzes.</p>
                </div>
              </div>
            </section>

            {/* Performance Overview (Chart) */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Performance Overview</h2>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] h-[230px] flex flex-col justify-end">
                {chartData.length > 0 ? (
                  <div className="flex items-end justify-between h-32 gap-2">
                    {chartData.map((val, idx) => (
                      <div key={idx} className="relative flex-1 group flex flex-col justify-end items-center h-full">
                        <div className="absolute -top-8 bg-gray-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {val}%
                        </div>
                        <div 
                          className="w-full bg-indigo-500 rounded-t-sm hover:bg-indigo-600 transition-colors" 
                          style={{ height: `${Math.max(5, val)}%` }}
                        ></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 font-medium">
                    Not enough data for chart
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 mt-3 text-center text-xs font-bold text-gray-400 uppercase">
                  Recent Quiz History (Oldest → Newest)
                </div>
              </div>
            </section>
          </div>

          {/* 5. ACCOUNT INFORMATION & ACTIONS */}
          <section className="animate-slide-up stagger-4">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
                    <p className="font-bold text-gray-900">{user?.name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</p>
                    <p className="font-bold text-gray-900">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
                    <Shield className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Account Role</p>
                    <p className="font-bold text-gray-900 capitalize">{user?.role || 'Student'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/50">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Joined Date</p>
                    <p className="font-bold text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                <button 
                  onClick={() => alert("Profile editing is currently managed by administrators.")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
                <button 
                  onClick={() => alert("Password reset links must be requested from login page.")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  <Key className="w-4 h-4" /> Change Password
                </button>
                <div className="flex-1"></div>
                <button 
                  onClick={logout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          </section>

          {/* 6. SUPPORT & HELP */}
          <section className="pt-12 border-t border-gray-200 animate-slide-up stagger-5">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900">Support & Help</h2>
              <p className="text-gray-500 font-medium mt-2">Need help? We're here to assist you.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Help Center</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">Find answers to common questions and learn how to use the portal.</p>
                <button onClick={() => alert('Help Center documentation coming soon.')} className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-sm rounded-lg transition-colors">
                  Visit Help Center
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
                  <MessageCircleQuestion className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">FAQs</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">Get quick answers about quizzes, attempts, and account settings.</p>
                <button onClick={() => document.getElementById('faq-section').scrollIntoView({behavior: 'smooth'})} className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm rounded-lg transition-colors">
                  View FAQs
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4 text-red-600">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Report a Problem</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">Having an issue with a quiz, result or account? Let us know.</p>
                <button onClick={() => setShowReportModal(true)} className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-sm rounded-lg transition-colors">
                  Report Issue
                </button>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-lg transition-all flex flex-col">
                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
                  <Headphones className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Contact Support</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">Contact the support team if you need additional assistance.</p>
                <button onClick={() => alert('Support email: support@quizportal.edu')} className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-sm rounded-lg transition-colors">
                  Contact Support
                </button>
              </div>
            </div>

            {/* FAQs Accordion */}
            <div id="faq-section" className="bg-white rounded-3xl border border-gray-100 p-8 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
              <div className="space-y-4 max-w-3xl mx-auto">
                {FAQs.map((faq, index) => (
                  <div key={index} className="border border-gray-100 rounded-2xl overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 flex items-center justify-between bg-gray-50/50 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-bold text-gray-900 text-left">{faq.q}</span>
                      {activeFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400 shrink-0" />
                      )}
                    </button>
                    <div 
                      className={`px-6 transition-all duration-300 overflow-hidden ${
                        activeFaq === index ? 'py-4 max-h-40 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <p className="text-gray-600 font-medium leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {/* REPORT ISSUE MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-zoom-in">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Report a Problem
              </h3>
              <button onClick={() => setShowReportModal(false)} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {reportSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Issue Reported</h4>
                  <p className="text-gray-500 font-medium">Thank you for letting us know. Support will review this shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleReportSubmit} className="space-y-5">
                  
                  {reportError && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 font-medium text-sm">
                      {reportError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Issue Type</label>
                    <select 
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                      value={reportForm.type}
                      onChange={e => setReportForm({...reportForm, type: e.target.value})}
                    >
                      <option>Quiz Problem</option>
                      <option>Question Problem</option>
                      <option>Result Problem</option>
                      <option>Login/Account Problem</option>
                      <option>Technical Problem</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Brief summary of the issue"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900"
                      value={reportForm.subject}
                      onChange={e => setReportForm({...reportForm, subject: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                    <textarea 
                      required
                      rows="4"
                      placeholder="Please provide details about what happened..."
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 resize-none"
                      value={reportForm.description}
                      onChange={e => setReportForm({...reportForm, description: e.target.value})}
                    ></textarea>
                  </div>

                  <div className="pt-4 flex gap-3 justify-end">
                    <button 
                      type="button"
                      onClick={() => setShowReportModal(false)}
                      className="px-6 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmittingReport}
                      className="px-6 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                    >
                      {isSubmittingReport ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Submit Issue'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentProfile;
