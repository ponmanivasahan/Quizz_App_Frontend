import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { attemptApi } from '../../api/attemptApi';
import { quizApi } from '../../api/quizApi';
import { Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight, X, AlertCircle, Bookmark, Menu } from 'lucide-react';

const StudentExam = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Animation state
  const [slideDirection, setSlideDirection] = useState('right');
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Mobile drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Map of questionId -> selectedOption
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [isSafeToLeave, setIsSafeToLeave] = useState(false);

  // Initial load
  const loadExamData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const attemptData = await attemptApi.getAttemptById(attemptId);
      const attemptRecord = attemptData.attempt || attemptData.data || attemptData;
      
      if (attemptRecord.status === 'Completed' || attemptRecord.status === 'Expired' || attemptRecord.status === 'passed' || attemptRecord.status === 'failed') {
        // Already submitted
        setIsSafeToLeave(true);
        navigate(`/student/result/${attemptId}`);
        return;
      }

      setAttempt(attemptRecord);
      
      let quizId = attemptRecord.quizId || attemptRecord.quiz?.id || attemptRecord.quiz_id;
      
      // Fallback: if quizId is still missing, fetch my attempts to find it
      if (!quizId) {
        try {
          const myAttemptsData = await attemptApi.getMyAttempts();
          const attemptsList = myAttemptsData.data || myAttemptsData.attempts || myAttemptsData;
          const currentAttempt = Array.isArray(attemptsList) ? attemptsList.find(a => String(a.attemptId || a.id) === String(attemptId)) : null;
          if (currentAttempt && currentAttempt.quizId) {
            quizId = currentAttempt.quizId;
          }
        } catch (fallbackErr) {
          console.warn("Could not fetch my attempts for fallback quizId:", fallbackErr);
        }
      }

      if (!quizId) {
        throw new Error("Quiz ID not found in attempt data");
      }

      // We now receive questions directly from the attempt if it's In Progress (updated backend)
      let questionList = attemptRecord.questions || [];
      
      // Fallback: if backend doesn't return questions, fetch them from quizApi
      if (questionList.length === 0) {
        try {
          const questionsData = await quizApi.getQuestions(quizId);
          questionList = Array.isArray(questionsData) ? questionsData : (questionsData.questions || []);
        } catch (qErr) {
          console.warn("Could not fetch questions from quizApi:", qErr);
        }
      }
      
      if (questionList.length === 0) {
        setError('This quiz currently has no questions.');
        setIsLoading(false);
        return;
      }

      setQuiz({
        id: quizId,
        title: attemptRecord.quizTitle,
        duration: attemptRecord.duration,
        maximumAttempts: 2
      });
      
      setQuestions(questionList);

      // Timer logic based on startedAt
      const startedAt = new Date(attemptRecord.startedAt || new Date()).getTime();
      const now = new Date().getTime();
      const elapsedSeconds = Math.floor((now - startedAt) / 1000);
      const durationSeconds = (attemptRecord.duration || 30) * 60;
      const remaining = Math.max(0, durationSeconds - elapsedSeconds);
      
      setTimeLeft(remaining);

    } catch (err) {
      console.error("Quiz loading error:", err);
      if (err.response) {
        switch (err.response.status) {
          case 400: setError("Invalid quiz request."); break;
          case 401: setError("Your session has expired. Please log in again."); break;
          case 403: setError("You are not allowed to access this quiz."); break;
          case 404: setError("Quiz not found."); break;
          case 409: setError("An active attempt already exists."); break;
          default: setError("Unable to load the quiz. Please try again.");
        }
      } else if (err.request) {
        setError("Unable to connect to the server.");
      } else {
        setError("Unable to load the quiz. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExamData();
  }, [attemptId, navigate]);

  // Security: Prevent navigation & beforeunload
  useEffect(() => {
    if (isLoading || error || isSubmitting || isSafeToLeave) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = ''; 
      return '';
    };

    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      setShowLeaveModal(true);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isLoading, error, isSubmitting, isSafeToLeave]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || isSubmitting || isLoading || error || isSafeToLeave) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitting, isLoading, error, isSafeToLeave]);

  const handleOptionSelect = (questionId, optionKey) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleNavigateQuestion = (newIndex) => {
    if (newIndex === currentQuestionIndex || isAnimating) return;
    
    setSlideDirection(newIndex > currentQuestionIndex ? 'right' : 'left');
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentQuestionIndex(newIndex);
      setIsAnimating(false);
    }, 250); // 250ms fade + slide duration
    
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  const toggleMarkForReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
      else next.add(currentQuestion.id);
      return next;
    });
  };

  const submitExamToServer = async (finalAnswers) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsSafeToLeave(true); 
    
    try {
      const formattedAnswers = Object.keys(finalAnswers).map(qId => ({
        questionId: parseInt(qId),
        selectedAnswer: finalAnswers[qId]
      }));

      await attemptApi.submitAttempt(attemptId, { answers: formattedAnswers });
      navigate(`/student/result/${attemptId}`, { replace: true });
    } catch (err) {
      console.error('Submit error:', err);
      alert('Unable to save your answers. Please try again.');
      setIsSubmitting(false);
      setIsSafeToLeave(false);
    }
  };

  const handleAutoSubmit = () => submitExamToServer(answers);

  const checkAndShowSubmitModal = () => {
    const missing = questions.length - Object.keys(answers).length;
    setUnansweredCount(missing);
    setShowSubmitModal(true);
    if (isDrawerOpen) setIsDrawerOpen(false);
  };

  const confirmLeave = () => {
    setIsSafeToLeave(true);
    setTimeout(() => {
      navigate(-2);
    }, 0);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex flex-col">
        {/* Skeleton Header */}
        <div className="h-16 bg-gray-200 rounded-xl w-full max-w-7xl mx-auto mb-8 animate-pulse flex items-center justify-center">
          <span className="text-gray-400 font-bold">Loading your examination...</span>
        </div>
        {/* Skeleton Content */}
        <div className="flex-1 max-w-7xl mx-auto w-full flex gap-8">
          <div className="flex-1 bg-white rounded-2xl p-10 border border-gray-100 animate-pulse flex flex-col gap-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded w-full"></div>
            <div className="space-y-4 mt-8">
              <div className="h-14 bg-gray-100 rounded-xl"></div>
              <div className="h-14 bg-gray-100 rounded-xl"></div>
              <div className="h-14 bg-gray-100 rounded-xl"></div>
              <div className="h-14 bg-gray-100 rounded-xl"></div>
            </div>
          </div>
          <div className="hidden lg:block w-72 h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (error || !quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-gray-100 max-w-md w-full text-center shadow-sm">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-8 font-medium text-lg">{error || 'No questions found for this assessment.'}</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => loadExamData()} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-colors w-full">
              Try Again
            </button>
            <button onClick={() => navigate('/student/dashboard')} className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors w-full">
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center animate-zoom-in border border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            <CheckCircle className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitting your quiz...</h2>
          <p className="text-gray-500 font-medium">Please wait while we process your answers securely.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isTimeLow = timeLeft !== null && timeLeft < 300; 
  const isTimeCritical = timeLeft !== null && timeLeft < 60;

  // The Navigator Component (reused in drawer and desktop sidebar)
  const QuestionNavigator = () => (
    <div className="bg-white rounded-t-3xl lg:rounded-2xl shadow-2xl lg:shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 p-6 flex flex-col h-full lg:max-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <h3 className="font-bold text-gray-900">Quiz Progress</h3>
        <button className="lg:hidden p-1 text-gray-400" onClick={() => setIsDrawerOpen(false)}><X className="w-6 h-6" /></button>
      </div>
      
      <div className="grid grid-cols-5 gap-2 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-4">
        {questions.map((q, idx) => {
          const isCurrent = currentQuestionIndex === idx;
          const isAnswered = answers[q.id] !== undefined;
          const isMarked = markedForReview.has(q.id);
          
          let btnClass = "w-full aspect-square rounded-lg font-bold text-sm flex items-center justify-center transition-all duration-200 border-2 ";
          
          if (isCurrent) {
            btnClass += "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105 relative z-10";
          } else if (isMarked) {
            btnClass += "border-amber-400 bg-amber-50 text-amber-700 cursor-pointer hover:bg-amber-100";
          } else if (isAnswered) {
            btnClass += "border-emerald-500 bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100";
          } else {
            btnClass += "border-gray-200 bg-white text-gray-500 cursor-pointer hover:border-gray-300 hover:bg-gray-50";
          }

          return (
            <button key={q.id} onClick={() => handleNavigateQuestion(idx)} className={btnClass}>
              {(idx + 1).toString().padStart(2, '0')}
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-6 border-t border-gray-100 space-y-3 shrink-0">
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <div className="w-4 h-4 rounded bg-indigo-600"></div> Current
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-50"></div> Answered
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <div className="w-4 h-4 rounded border-2 border-amber-400 bg-amber-50"></div> Marked for Review
        </div>
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
          <div className="w-4 h-4 rounded border-2 border-gray-200 bg-white"></div> Unanswered
        </div>
      </div>
      
      <div className="mt-8 shrink-0">
        <button 
          onClick={checkAndShowSubmitModal}
          className="w-full py-3 rounded-xl font-bold text-white bg-indigo-900 border border-indigo-950 hover:bg-indigo-800 transition-colors shadow-lg"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans relative">
      
      <style>{`
        .slide-right-enter { opacity: 0; transform: translateX(20px); }
        .slide-right-enter-active { opacity: 1; transform: translateX(0); transition: opacity 250ms, transform 250ms; }
        .slide-right-exit { opacity: 1; transform: translateX(0); }
        .slide-right-exit-active { opacity: 0; transform: translateX(-20px); transition: opacity 250ms, transform 250ms; }
        
        .slide-left-enter { opacity: 0; transform: translateX(-20px); }
        .slide-left-enter-active { opacity: 1; transform: translateX(0); transition: opacity 250ms, transform 250ms; }
        .slide-left-exit { opacity: 1; transform: translateX(0); }
        .slide-left-exit-active { opacity: 0; transform: translateX(20px); transition: opacity 250ms, transform 250ms; }
      `}</style>

      {/* Leave Quiz Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-zoom-in border border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your quiz is still in progress.</h3>
            <p className="text-gray-600 mb-8 font-medium">
              Leaving now may interrupt your assessment and your answers may not be saved.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={confirmLeave} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Leave Quiz
              </button>
              <button onClick={() => setShowLeaveModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-colors">
                Stay on Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-zoom-in border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Submit Quiz?</h3>
            {unansweredCount > 0 ? (
              <p className="text-gray-600 mb-8 font-medium text-lg">
                You have answered {questions.length - unansweredCount} of {questions.length} questions.<br/>
                You still have <span className="font-bold text-amber-600">{unansweredCount} unanswered questions</span>.
              </p>
            ) : (
              <p className="text-gray-600 mb-8 font-medium text-lg">
                You have answered {questions.length} of {questions.length} questions.
              </p>
            )}
            
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowSubmitModal(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors">
                Continue Quiz
              </button>
              <button onClick={() => submitExamToServer(answers)} className="px-5 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors">
                Submit Quiz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exam Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex w-10 h-10 bg-indigo-600 rounded-lg items-center justify-center shadow-md">
               <span className="font-bold text-white text-lg">Q</span>
             </div>
             <div>
               <h1 className="font-bold text-gray-900 text-lg sm:text-xl truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                 {quiz.title}
               </h1>
               <div className="flex items-center gap-3">
                 <p className="text-xs text-gray-500 font-bold tracking-wider">Attempt {attempt.attemptNumber || 1} of {quiz.maximumAttempts || 2}</p>
               </div>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-black text-lg transition-colors ${
              isTimeCritical ? 'bg-red-50 text-red-600 border border-red-200 animate-pulse' 
              : isTimeLow ? 'bg-amber-50 text-amber-600 border border-amber-200' 
              : 'bg-gray-100 text-gray-800'
            }`}>
              <Clock className="w-5 h-5" />
              {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
            </div>
            
            {/* Mobile Drawer Toggle */}
            <button 
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Universal Progress Bar */}
        <div className="w-full h-1.5 bg-gray-200">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </header>

      {/* Main Exam Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col lg:flex-row gap-8 relative overflow-x-hidden">
        
        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col relative z-10 w-full">
          
          {/* Question Card Container with Animation */}
          <div className={`bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden flex-1 flex flex-col transition-all duration-250 ${
            isAnimating 
              ? `opacity-0 transform ${slideDirection === 'right' ? '-translate-x-4' : 'translate-x-4'}` 
              : 'opacity-100 transform translate-x-0'
          }`}>
            <div className="p-6 sm:p-10 border-b border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                  Question {(currentQuestionIndex + 1).toString().padStart(2, '0')} of {questions.length}
                </span>
                <span className="text-sm font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                  {currentQuestion.marks} Point{currentQuestion.marks !== 1 ? 's' : ''}
                </span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>
            
            <div className="p-6 sm:p-10 bg-gray-50/50 flex-1">
              <div className="space-y-4 max-w-3xl">
                {['A', 'B', 'C', 'D'].map((optionKey) => {
                  const optionText = currentQuestion[`option${optionKey}`];
                  if (!optionText) return null;
                  
                  const isSelected = answers[currentQuestion.id] === optionKey;
                  
                  return (
                    <button
                      key={optionKey}
                      onClick={() => handleOptionSelect(currentQuestion.id, optionKey)}
                      className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
                        isSelected 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`text-2xl leading-none flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'text-indigo-600' : 'text-gray-300 group-hover:text-gray-400'
                      }`}>
                        {isSelected ? '●' : '○'}
                      </div>
                      <span className={`text-lg font-medium ${isSelected ? 'text-indigo-900 font-bold' : 'text-gray-700'}`}>
                        <span className="mr-2 opacity-50">{optionKey}.</span> {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <button 
              onClick={() => handleNavigateQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            
            <div className="flex items-center gap-3 ml-auto">
              <button 
                onClick={toggleMarkForReview}
                className={`flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold transition-colors border shadow-sm ${
                  markedForReview.has(currentQuestion.id)
                    ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${markedForReview.has(currentQuestion.id) ? 'fill-amber-500' : ''}`} /> 
                <span className="hidden sm:inline">Mark for Review</span>
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button 
                  onClick={checkAndShowSubmitModal}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                >
                  Finish Review
                </button>
              ) : (
                <button 
                  onClick={() => handleNavigateQuestion(currentQuestionIndex + 1)}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Desktop: Question Navigator */}
        <div className="hidden lg:block w-72 shrink-0 animate-slide-in-right">
          <div className="sticky top-24">
            <QuestionNavigator />
          </div>
        </div>
      </main>

      {/* Mobile Drawer (Bottom Sheet) for Navigator */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
        <div className={`absolute bottom-0 left-0 right-0 h-[80vh] transition-transform duration-300 transform ${isDrawerOpen ? 'translate-y-0' : 'translate-y-full'}`}>
          <QuestionNavigator />
        </div>
      </div>

    </div>
  );
};

export default StudentExam;
