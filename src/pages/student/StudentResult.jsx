import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { attemptApi } from '../../api/attemptApi';
import { Trophy, ArrowRight, XCircle, CheckCircle } from 'lucide-react';

const Confetti = () => {
  const [pieces, setPieces] = useState([]);
  
  useEffect(() => {
    // Generate 80 professional paper-like confetti pieces
    const newPieces = Array.from({ length: 80 }).map((_, i) => {
      const isRect = Math.random() > 0.5;
      const size = 6 + Math.random() * 6;
      return {
        id: i,
        x: Math.random() * 100, // horizontal percentage
        delay: Math.random() * 0.5, // start falling almost immediately
        duration: 2 + Math.random() * 2, // exactly 2 to 4 seconds fall duration
        color: ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)], // professional palette
        width: isRect ? size * 1.5 : size, // rectangles or squares
        height: size,
        rotationStart: Math.random() * 360,
        rotationEnd: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720), // spin
      };
    });
    setPieces(newPieces);
    
    // Clean DOM after 4.5 seconds (max duration 4s + max delay 0.5s)
    const timer = setTimeout(() => setPieces([]), 4500);
    return () => clearTimeout(timer);
  }, []);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute -top-10"
          style={{
            left: `${p.x}%`,
            width: `${p.width}px`,
            height: `${p.height}px`,
            backgroundColor: p.color,
            opacity: 0,
            animation: `confetti-fall-${p.id} ${p.duration}s linear ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        ${pieces.map(p => `
          @keyframes confetti-fall-${p.id} {
            0% { transform: translateY(0) rotate(${p.rotationStart}deg); opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(110vh) rotate(${p.rotationEnd}deg); opacity: 0; }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

const StudentResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Animation states for sequence
  const [showIcon, setShowIcon] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await attemptApi.getAttemptById(attemptId);
        const attemptRecord = data.attempt || data;
        
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

  // Sequential Animation Logic
  useEffect(() => {
    if (result && !isLoading) {
      // Step 2: Icon pops in
      setTimeout(() => setShowIcon(true), 300);
      
      // Step 3: Content slides up
      setTimeout(() => setShowContent(true), 800);
      
      // Step 4: Score counts up
      const targetScore = Math.round(result.percentage || 0);
      let current = 0;
      const duration = 1500; 
      const stepTime = Math.max(20, Math.floor(duration / (targetScore || 1)));
      
      setTimeout(() => {
        if (targetScore === 0) return;
        const timer = setInterval(() => {
          current += 1;
          setDisplayScore(current);
          if (current >= targetScore) clearInterval(timer);
        }, stepTime);
      }, 1000);
    }
  }, [result, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Calculating your results...</p>
      </div>
    );
  }

  if (!result) return null;

  const isPass = result.status === 'passed' || result.percentage >= (result.quiz?.passingScore || 50);

  const maxAttempts = result.quiz?.maximumAttempts || 2;
  const attemptsUsed = result.attemptNumber || 1;
  const attemptsRemaining = typeof result.quiz?.attemptsRemaining !== 'undefined' 
    ? result.quiz.attemptsRemaining 
    : Math.max(0, maxAttempts - attemptsUsed);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 flex flex-col items-center font-sans animate-fade-in">
      
      {isPass && <Confetti />}

      <div className="w-full max-w-3xl relative z-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assessment Complete</h1>
          <p className="text-gray-500 mt-2 font-medium">Here is a summary of your performance</p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgb(0,0,0,0.05)] border border-gray-100 overflow-hidden relative">
          
          {/* Header Banner */}
          <div className={`h-32 ${isPass ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-gradient-to-r from-slate-400 to-slate-600'} relative overflow-hidden flex items-center justify-center`}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            
            <div className={`relative z-10 flex items-center gap-3 text-white transition-all duration-500 transform ${showIcon ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
              {isPass ? <Trophy className="w-10 h-10 text-emerald-100" /> : <XCircle className="w-10 h-10 text-slate-100" />}
              <h2 className="text-3xl font-black tracking-tight">{isPass ? 'Congratulations! You Passed!' : 'Keep Practicing'}</h2>
            </div>
          </div>

          <div className={`p-8 sm:p-12 text-center -mt-8 relative z-10 transition-all duration-700 transform ${showContent ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* The Big Circle with Score Counter */}
            <div className="w-40 h-40 mx-auto bg-white rounded-full p-2 shadow-xl mb-6 flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle 
                  cx="50" cy="50" r="45" fill="none" 
                  stroke={isPass ? "#10b981" : "#64748b"} 
                  strokeWidth="8" 
                  strokeLinecap="round"
                  strokeDasharray={`${(displayScore / 100) * 282.7} 282.7`}
                  className="transition-all duration-75 ease-out"
                />
              </svg>
              <div className="text-center relative z-10">
                <span className={`text-4xl font-black ${isPass ? 'text-emerald-600' : 'text-slate-600'}`}>
                  {displayScore}%
                </span>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                  {isPass ? 'PASSED' : 'FAILED'}
                </p>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-gray-900 mb-1">{result.quizTitle || result.quiz?.title || 'Assessment'}</h3>
            <p className="text-gray-500 font-medium mb-3">Attempt {attemptsUsed} of {maxAttempts}</p>
            
            {/* Supportive Feedback Message */}
            <div className={`inline-block px-4 py-2 rounded-xl mb-8 ${isPass ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-700'}`}>
               <p className="font-semibold text-sm">
                 {isPass 
                   ? 'Excellent work! You\'ve successfully completed the quiz.' 
                   : `Don't worry. Review your answers and use your remaining attempt if available. Attempts Remaining: ${attemptsRemaining}`
                 }
               </p>
            </div>

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
              
              {(!isPass && attemptsRemaining > 0) ? (
                 <Link 
                  to="/student/quizzes"
                  className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Try Again <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <Link 
                  to="/student/attempts"
                  className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  View My Attempts <ArrowRight className="w-5 h-5" />
                </Link>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResult;
