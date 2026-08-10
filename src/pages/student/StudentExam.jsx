import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptApi } from '../../api/attemptApi';
import { quizApi } from '../../api/quizApi';
import { Clock, AlertTriangle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const StudentExam = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  
  const [attempt, setAttempt] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Map of questionId -> selectedOption
  const [answers, setAnswers] = useState({});
  
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Initial load
  useEffect(() => {
    const initializeExam = async () => {
      try {
        const attemptData = await attemptApi.getAttemptById(attemptId);
        const attemptRecord = attemptData.attempt || attemptData;
        
        if (attemptRecord.status === 'passed' || attemptRecord.status === 'failed') {
          // Already submitted
          navigate(`/student/result/${attemptId}`);
          return;
        }

        setAttempt(attemptRecord);
        
        const quizId = attemptRecord.quizId || attemptRecord.quiz?.id;
        if (!quizId) throw new Error("Quiz ID not found in attempt data");

        const [quizData, questionsData] = await Promise.all([
          quizApi.getQuizById(quizId),
          quizApi.getQuestions(quizId)
        ]);

        const quizRecord = quizData.quiz || quizData;
        setQuiz(quizRecord);
        
        const questionList = Array.isArray(questionsData) ? questionsData : (questionsData.questions || []);
        setQuestions(questionList);

        // Calculate time left (this is a visual frontend timer)
        // In a real robust system, the backend would provide exact seconds remaining based on createdAt + duration
        const durationSeconds = (quizRecord.duration || 30) * 60;
        setTimeLeft(durationSeconds);

      } catch (err) {
        setError('Failed to load examination. Please return to dashboard.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeExam();
  }, [attemptId, navigate]);

  // Timer logic
  useEffect(() => {
    if (timeLeft === null || isSubmitting || isLoading || error) return;

    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft, isSubmitting, isLoading, error]);

  const handleOptionSelect = (questionId, optionKey) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const submitExamToServer = async (finalAnswers) => {
    setIsSubmitting(true);
    try {
      // Format answers for backend
      const formattedAnswers = Object.keys(finalAnswers).map(qId => ({
        questionId: parseInt(qId),
        selectedAnswer: finalAnswers[qId]
      }));

      await attemptApi.submitAttempt(attemptId, { answers: formattedAnswers });
      
      // Navigate to result
      navigate(`/student/result/${attemptId}`);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Failed to submit exam. Please try again immediately.');
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = () => {
    submitExamToServer(answers);
  };

  const handleManualSubmit = () => {
    const unansweredCount = questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      const confirm = window.confirm(`You still have ${unansweredCount} unanswered questions. Are you sure you want to submit?`);
      if (!confirm) return;
    } else {
      const confirm = window.confirm('Are you ready to submit your exam?');
      if (!confirm) return;
    }
    
    submitExamToServer(answers);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Preparing your examination environment...</p>
      </div>
    );
  }

  if (error || !quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{error || 'No questions found for this quiz.'}</p>
          <button onClick={() => navigate('/student/dashboard')} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-medium">
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center animate-zoom-in">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin"></div>
            <CheckCircle className="w-8 h-8 text-indigo-600 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Submitting Exam...</h2>
          <p className="text-gray-500 font-medium">Please wait while we process your answers securely.</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isTimeLow = timeLeft !== null && timeLeft < 300; // Less than 5 minutes

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Exam Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
               <span className="font-bold text-indigo-700 text-lg">Q</span>
             </div>
             <div>
               <h1 className="font-bold text-gray-900 leading-tight hidden sm:block">{quiz.title}</h1>
               <p className="text-xs text-gray-500 font-medium">Exam in progress</p>
             </div>
          </div>
          
          <div className={`flex items-center gap-3 px-4 py-2 rounded-lg font-bold text-lg transition-colors ${
            isTimeLow ? 'bg-red-50 text-red-600 border border-red-100 animate-pulse' : 'bg-gray-100 text-gray-800'
          }`}>
            <Clock className={`w-5 h-5 ${isTimeLow ? 'text-red-500' : 'text-gray-500'}`} />
            {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
          </div>
        </div>
      </header>

      {/* Main Exam Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Question Area */}
        <div className="flex-1 flex flex-col animate-fade-in relative z-10">
          
          <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden flex-1 flex flex-col">
            <div className="p-6 sm:p-10 border-b border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <span className="text-sm font-bold text-gray-400">
                  {currentQuestion.marks} Point{currentQuestion.marks !== 1 ? 's' : ''}
                </span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed">
                {currentQuestion.questionText}
              </h2>
            </div>
            
            <div className="p-6 sm:p-10 bg-gray-50/30 flex-1">
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
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-[0_4px_15px_rgb(79,70,229,0.1)]' 
                          : 'border-gray-200 bg-white hover:border-indigo-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                      </div>
                      <span className={`text-lg ${isSelected ? 'font-semibold text-indigo-900' : 'text-gray-700'}`}>
                        {optionText}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="mt-6 flex items-center justify-between">
            <button 
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" /> Previous
            </button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <button 
                onClick={handleManualSubmit}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
              >
                Submit Exam <CheckCircle className="w-5 h-5" />
              </button>
            ) : (
              <button 
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
              >
                Next <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Question Navigator */}
        <div className="w-full lg:w-72 shrink-0 animate-slide-in-right">
          <div className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4">Question Navigator</h3>
            
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = currentQuestionIndex === idx;
                const isAnswered = answers[q.id] !== undefined;
                
                let btnClass = "w-full aspect-square rounded-lg font-bold text-sm flex items-center justify-center transition-all duration-200 border-2 ";
                
                if (isCurrent) {
                  btnClass += "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-110 relative z-10";
                } else if (isAnswered) {
                  btnClass += "border-emerald-500 bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100";
                } else {
                  btnClass += "border-gray-200 bg-white text-gray-500 cursor-pointer hover:border-gray-300 hover:bg-gray-50";
                }

                return (
                  <button 
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={btnClass}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div className="w-4 h-4 rounded bg-indigo-600"></div> Current
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-50"></div> Answered
              </div>
              <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                <div className="w-4 h-4 rounded border-2 border-gray-200 bg-white"></div> Unanswered
              </div>
            </div>
            
            <div className="mt-8">
              <button 
                onClick={handleManualSubmit}
                className="w-full py-3 rounded-xl font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors"
              >
                Submit Early
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentExam;
