import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptApi } from '../../api/attemptApi';
import { Trophy, ArrowRight, XCircle, CheckCircle, Clock } from 'lucide-react';

const StudentResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await attemptApi.getAttemptById(attemptId);
        const attemptRecord = data.attempt || data;
        
        // If not submitted yet, shouldn't be here
        if (attemptRecord.status === 'in_progress') {
          navigate(`/student/quiz/${attemptId}`);
          return;
        }
        
        setResult(attemptRecord);
        
      } catch (error) {
        console.error('Failed to load result:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [attemptId, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Calculating your results...</p>
      </div>
    );
  }

  if (!result) return null;

  const isPass = result.status === 'passed' || result.percentage >= 50;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 flex flex-col items-center font-sans">
      
      <div className="w-full max-w-3xl animate-zoom-in">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assessment Complete</h1>
          <p className="text-gray-500 mt-2 font-medium">Here is a summary of your performance</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
          
          {/* Header Banner */}
          <div className={`h-32 ${isPass ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-red-400 to-red-600'} relative overflow-hidden flex items-center justify-center`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10 flex items-center gap-3 text-white">
              {isPass ? <Trophy className="w-10 h-10 text-emerald-100" /> : <XCircle className="w-10 h-10 text-red-100" />}
              <h2 className="text-3xl font-black tracking-tight">{isPass ? 'Congratulations!' : 'Keep Practicing'}</h2>
            </div>
          </div>

          <div className="p-8 sm:p-12 text-center -mt-8 relative z-10">
            
            {/* The Big Circle */}
            <div className="w-40 h-40 mx-auto bg-white rounded-full p-2 shadow-xl mb-8 flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke={isPass ? "#10b981" : "#ef4444"} 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray={`${(result.percentage || 0) * 2.827} 282.7`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="text-center relative z-10">
                <span className={`text-4xl font-black ${isPass ? 'text-emerald-600' : 'text-red-600'}`}>{Math.round(result.percentage || 0)}%</span>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-1">{result.quizTitle || result.quiz?.title || 'Assessment'}</h3>
            <p className="text-gray-500 font-medium mb-10">Submitted on {new Date(result.submittedAt || result.createdAt).toLocaleString()}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Score</p>
                <p className="text-2xl font-bold text-gray-900">{result.score}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Out Of</p>
                <p className="text-2xl font-bold text-gray-900">{result.totalMarks}</p>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-xs font-bold text-emerald-600/70 uppercase tracking-wider mb-1">Correct</p>
                <p className="text-2xl font-bold text-emerald-600 flex items-center justify-center gap-2">
                  {result.correctAnswers || 0} <CheckCircle className="w-5 h-5" />
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <p className="text-xs font-bold text-red-600/70 uppercase tracking-wider mb-1">Incorrect</p>
                <p className="text-2xl font-bold text-red-600 flex items-center justify-center gap-2">
                  {result.wrongAnswers || 0} <XCircle className="w-5 h-5" />
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to={`/student/review/${attemptId}`}
                className="px-8 py-3.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
              >
                Review Answers
              </Link>
              <Link 
                to="/student/dashboard"
                className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                Back to Dashboard <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
