import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { attemptApi } from '../../api/attemptApi';
import { TrendingUp, Award, CheckCircle, Target, BarChart2 } from 'lucide-react';

const StudentPerformance = () => {
  const [performance, setPerformance] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const [perfData, attemptsData] = await Promise.all([
          analyticsApi.getMyPerformance().catch(() => null),
          attemptApi.getMyAttempts().catch(() => [])
        ]);
        
        let attemptsArray = [];
        if (Array.isArray(attemptsData)) attemptsArray = attemptsData;
        else if (attemptsData?.attempts) attemptsArray = attemptsData.attempts;
        else if (attemptsData?.data?.attempts) attemptsArray = attemptsData.data.attempts;
        else if (Array.isArray(attemptsData?.data)) attemptsArray = attemptsData.data;

        setAttempts(attemptsArray);

        if (perfData) {
          setPerformance(perfData.data || perfData.performance || perfData);
        } else {
          // Manual calculation fallback if API fails
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
      } catch (error) {
        console.error('Failed to load performance data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  const StatBox = ({ title, value, subtitle, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-5 hover:-translate-y-1 transition-transform duration-300">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          {subtitle && <span className="text-sm font-semibold text-gray-500">{subtitle}</span>}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-6 animate-pulse p-4">
        <div className="h-12 bg-gray-200 rounded-xl w-1/3"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="h-28 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-28 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-28 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-28 bg-gray-200 rounded-2xl w-full"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-2xl w-full"></div>
          <div className="h-80 bg-gray-200 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  // Prepare Dynamic Data
  const recentAttempts = [...attempts].reverse().slice(0, 5).reverse(); // Last 5 attempts in chronological order
  
  // Aggregate topic performance
  const quizPerformance = {};
  attempts.forEach(attempt => {
    const title = attempt.quizTitle || attempt.quiz?.title || 'Unknown Quiz';
    if (!quizPerformance[title]) {
      quizPerformance[title] = { total: 0, count: 0 };
    }
    quizPerformance[title].total += (attempt.percentage || 0);
    quizPerformance[title].count += 1;
  });

  const subjectStrengths = Object.keys(quizPerformance).map(title => ({
    title,
    average: Math.round(quizPerformance[title].total / quizPerformance[title].count)
  })).sort((a, b) => b.average - a.average);

  return (
    <div className="space-y-6 pb-10 w-full font-sans">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Performance</h1>
        <p className="text-gray-500 font-medium mt-1">Detailed analytics of your learning journey.</p>
      </div>

      {!performance || attempts.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center animate-fade-in flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Data Available</h3>
          <p className="text-gray-500 font-medium">Complete some quizzes to see your performance metrics here.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-slide-up stagger-1">
            <StatBox 
              title="Total Attempts" 
              value={performance.totalAttempts || 0} 
              icon={CheckCircle}
              colorClass="bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-200"
            />
            <StatBox 
              title="Average Score" 
              value={performance.averageScore ? performance.averageScore.toFixed(1) : '0'} 
              icon={TrendingUp}
              colorClass="bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-200"
            />
            <StatBox 
              title="Avg Percentage" 
              value={`${performance.averagePercentage ? Math.round(performance.averagePercentage) : 0}%`} 
              icon={Target}
              colorClass="bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-200"
            />
            <StatBox 
              title="Highest Score" 
              value={performance.highestScore || 0} 
              icon={Award}
              colorClass="bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg shadow-amber-200"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up stagger-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 md:p-8 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Trend</h3>
              
              <div className="flex-1 min-h-[250px] flex items-end justify-between gap-3 border-b border-l border-gray-100 p-4 pb-0 relative">
                {recentAttempts.length > 0 ? recentAttempts.map((attempt, i) => (
                  <div key={attempt.id || i} className="w-full bg-indigo-100 rounded-t-xl relative group transition-all duration-300 hover:bg-indigo-500 flex flex-col justify-end" style={{ height: `${Math.max(attempt.percentage || 0, 5)}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs font-bold py-1.5 px-2.5 rounded-lg transition-opacity whitespace-nowrap z-10 shadow-lg">
                      {attempt.percentage}%
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                    </div>
                  </div>
                )) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-gray-400">
                    <BarChart2 className="w-12 h-12 mb-2 text-gray-200" />
                    <p className="text-sm font-medium">Take more quizzes to build your trend chart.</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-4 text-[10px] font-bold text-gray-400 px-4 uppercase tracking-wider">
                {recentAttempts.length > 0 ? recentAttempts.map((attempt, i) => (
                  <span key={i} className="truncate max-w-[60px] text-center" title={attempt.quizTitle || attempt.quiz?.title || `Quiz ${i+1}`}>
                    {recentAttempts.length === 5 && i === 4 ? 'Latest' : `Q${i+1}`}
                  </span>
                )) : null}
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6 md:p-8 overflow-y-auto max-h-[400px]">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Subject Performance</h3>
              <div className="space-y-6">
                {subjectStrengths.length > 0 ? subjectStrengths.map((subject, idx) => {
                  let color = 'bg-indigo-500';
                  let textColor = 'text-indigo-600';
                  if (subject.average >= 85) {
                    color = 'bg-emerald-500'; textColor = 'text-emerald-600';
                  } else if (subject.average < 60) {
                    color = 'bg-amber-500'; textColor = 'text-amber-600';
                  }
                  
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-end mb-2">
                        <span className="font-bold text-gray-700 truncate pr-4 group-hover:text-indigo-600 transition-colors">{subject.title}</span>
                        <span className={`text-sm font-black ${textColor}`}>{subject.average}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden shadow-inner">
                        <div className={`h-full ${color} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${subject.average}%` }}></div>
                      </div>
                    </div>
                  );
                }) : (
                  <p className="text-gray-500 text-sm font-medium text-center mt-10">Complete different quizzes to see your strengths here.</p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentPerformance;
