import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { attemptApi } from '../../api/attemptApi';
import { Clock, Target, FileQuestion, AlertCircle, ArrowLeft, Play, CheckCircle } from 'lucide-react';

const StudentQuizDetails = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizDetails = async () => {
      try {
        const data = await quizApi.getQuizById(quizId);
        setQuiz(data.quiz || data);
      } catch (err) {
        setError('Failed to load quiz details. It may have been removed or unpublished.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuizDetails();
  }, [quizId]);

  const handleStartQuiz = async () => {
    setIsStarting(true);
    setError('');
    try {
      const response = await attemptApi.startAttempt(quizId);
      console.log('Start Attempt Response:', response);
      
      const attemptId = response?.attemptId || 
                        response?.attempt?.id || 
                        response?.id || 
                        response?.data?.id || 
                        response?.data?.attempt?.id || 
                        response?.data?.attemptId;
                        
      if (attemptId) {
        navigate(`/student/quiz/${attemptId}`);
      } else {
        console.error('Unrecognized start attempt response structure:', response);
        throw new Error('Attempt ID not returned from server.');
      }
    } catch (err) {
      console.error('Error starting quiz:', err);
      if (err.response?.status === 409) {
        setError('Both attempts have already been used for this quiz.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to start the quiz. Please try again later.');
      }
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-2xl mx-auto pt-10">
        <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-red-900 mb-2">Quiz Unavailable</h2>
          <p className="text-red-700 font-medium">{error}</p>
          <Link to="/student/quizzes" className="mt-6 inline-flex items-center text-red-700 hover:text-red-800 font-semibold">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // Attempt logic based on standard backend fields
  const maxAttempts = quiz.maximumAttempts || 2;
  const usedAttempts = quiz.attemptsUsed || 0;
  const attemptsRemaining = typeof quiz.attemptsRemaining !== 'undefined' ? quiz.attemptsRemaining : (maxAttempts - usedAttempts);
  const noAttemptsLeft = attemptsRemaining <= 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      
      <Link to="/student/quizzes" className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors animate-fade-in">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Quizzes
      </Link>

      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-slide-up">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-blue-500 relative overflow-hidden">
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        <div className="px-8 pb-10 relative">
          {/* Floating Icon */}
          <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center absolute -top-10 border-4 border-white">
            <div className="w-full h-full bg-indigo-50 rounded-xl flex items-center justify-center">
              <FileQuestion className="w-8 h-8 text-indigo-600" />
            </div>
          </div>

          <div className="pt-14">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-500 text-lg leading-relaxed max-w-3xl mb-8">
              {quiz.description || 'No description provided for this assessment.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm"><Clock className="w-6 h-6 text-indigo-500" /></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Duration</p>
                  <p className="text-lg font-bold text-gray-900">{quiz.duration} Mins</p>
                </div>
              </div>
              <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm"><Target className="w-6 h-6 text-emerald-500" /></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Total Marks</p>
                  <p className="text-lg font-bold text-gray-900">{quiz.totalMarks} Points</p>
                </div>
              </div>
              <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 flex items-center gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm"><FileQuestion className="w-6 h-6 text-amber-500" /></div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">Questions</p>
                  <p className="text-lg font-bold text-gray-900">{quiz.questionCount || quiz.questions?.length || 'Multiple'}</p>
                </div>
              </div>
            </div>

            {/* Attempts Info Section */}
            <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100/50 mb-8">
              <h3 className="font-bold text-indigo-900 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" /> Attempts
              </h3>
              
              {noAttemptsLeft ? (
                <div className="space-y-1">
                  <p className="text-indigo-900/80 font-bold">Attempts Completed</p>
                  <p className="text-indigo-900/60 font-medium text-sm">You have used both attempts for this quiz.</p>
                </div>
              ) : (
                <ul className="space-y-3 text-indigo-900/80 font-medium text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500" />
                    {usedAttempts === 0 ? 'Attempt 1 available' : `Attempt ${usedAttempts + 1} available`}
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-indigo-500" />
                    {attemptsRemaining === maxAttempts ? `${maxAttempts} Attempts Available` : `${attemptsRemaining} Attempt Remaining`}
                  </li>
                </ul>
              )}
            </div>

            {error && (
              <div className="bg-red-50/80 border border-red-100 p-4 rounded-xl flex items-start gap-3 mb-8">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
              {noAttemptsLeft ? (
                <Link
                  to="/student/attempts"
                  className="bg-indigo-50 text-indigo-700 px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                >
                  View Results
                </Link>
              ) : (
                <button
                  onClick={handleStartQuiz}
                  disabled={isStarting}
                  className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 focus:ring-4 focus:ring-indigo-100 transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {isStarting ? (
                    <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> Preparing Exam...</>
                  ) : (
                    <>Start Quiz <Play className="w-4 h-4 fill-current" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentQuizDetails;
