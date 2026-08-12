import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { attemptApi } from '../../api/attemptApi';
import { ArrowLeft, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const StudentReview = () => {
  const { attemptId } = useParams();
  const [reviewData, setReviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const data = await attemptApi.getAttemptReview(attemptId);
        setReviewData(data);
      } catch (error) {
        console.error('Failed to load review:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReview();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
      </div>
    );
  }

  if (!reviewData || !reviewData.answers) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Review Not Available</h2>
        <p className="text-gray-500 mb-6">We couldn't load the detailed review for this attempt.</p>
        <Link to={`/student/result/${attemptId}`} className="text-indigo-600 font-semibold hover:underline">
          Back to Result
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <Link to={`/student/result/${attemptId}`} className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-indigo-600 transition-colors mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Result
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Review Answers</h1>
          </div>
          <div className="text-right">
             <div className="text-2xl font-black text-indigo-600">{reviewData.attempt?.score} / {reviewData.attempt?.totalMarks}</div>
             <div className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Final Score</div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-8 animate-slide-up stagger-1">
          {reviewData.answers.map((answer, index) => {
            const isCorrect = answer.isCorrect;
            const q = answer.question;
            
            return (
              <div key={answer.id} className="bg-white rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className={`px-6 py-4 border-b flex justify-between items-center ${isCorrect ? 'bg-emerald-50/50 border-emerald-100' : 'bg-red-50/50 border-red-100'}`}>
                  <div className="flex items-center gap-3">
                    {isCorrect ? <CheckCircle className="w-6 h-6 text-emerald-500" /> : <XCircle className="w-6 h-6 text-red-500" />}
                    <h3 className={`font-bold ${isCorrect ? 'text-emerald-900' : 'text-red-900'}`}>Question {index + 1}</h3>
                  </div>
                  <div className="text-sm font-bold bg-white px-3 py-1 rounded-full ">
                    {isCorrect ? q.marks : 0} / {q.marks} Points
                  </div>
                </div>
                
                <div className="p-6 sm:p-8">
                  <p className="text-lg font-bold text-gray-900 mb-6">{q.questionText}</p>
                  
                  <div className="space-y-3">
                    {['A', 'B', 'C', 'D'].map(optKey => {
                      const optionText = q[`option${optKey}`];
                      if (!optionText) return null;
                      
                      const isSelected = answer.selectedAnswer === optKey;
                      const isActualCorrect = q.correctAnswer === optKey;
                      
                      let containerClass = "p-4 rounded-xl border-2 flex items-start gap-4 ";
                      let icon = null;
                      
                      if (isActualCorrect && isSelected) {
                        // They picked it and it's right
                        containerClass += "border-emerald-500 bg-emerald-50";
                        icon = <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />;
                      } else if (isActualCorrect && !isSelected) {
                        // It was right but they didn't pick it
                        containerClass += "border-emerald-200 bg-emerald-50/30";
                        icon = <CheckCircle className="w-6 h-6 text-emerald-500 opacity-50 shrink-0 mt-0.5" />;
                      } else if (!isActualCorrect && isSelected) {
                        // They picked it and it's wrong
                        containerClass += "border-red-400 bg-red-50";
                        icon = <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />;
                      } else {
                        // Neutral
                        containerClass += "border-gray-100 bg-white";
                        icon = <div className="w-6 h-6 rounded-full border-2 border-gray-200 shrink-0 mt-0.5"></div>;
                      }

                      return (
                        <div key={optKey} className={containerClass}>
                          {icon}
                          <div className="flex-1">
                            <p className={`font-medium ${isSelected ? (isActualCorrect ? 'text-emerald-900' : 'text-red-900') : 'text-gray-700'}`}>
                              <span className="font-bold mr-2">{optKey}.</span> {optionText}
                            </p>
                            {isSelected && (
                              <span className="inline-block mt-2 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white  border border-gray-100 text-gray-500">
                                Your Answer
                              </span>
                            )}
                            {isActualCorrect && !isSelected && (
                              <span className="inline-block mt-2 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded bg-white  border border-gray-100 text-emerald-600">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </div>
  );
};

export default StudentReview;
