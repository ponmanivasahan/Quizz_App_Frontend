import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { TrendingUp, Award, CheckCircle, XCircle } from 'lucide-react';

const StudentPerformance = () => {
  const [performance, setPerformance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const data = await analyticsApi.getMyPerformance();
        setPerformance(data);
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
      <div className="flex h-full items-center justify-center animate-fade-in">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10 max-w-6xl mx-auto">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Performance</h1>
        <p className="text-gray-500 font-medium mt-1">Detailed analytics of your learning journey.</p>
      </div>

      {!performance ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center animate-fade-in">
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
              title="Total Quizzes" 
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
              icon={Award}
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Trend</h3>
              {/* Placeholder for a chart. In a real app, use Recharts or Chart.js here */}
              <div className="h-64 flex items-end justify-between gap-2 border-b border-l border-gray-100 p-4 pb-0 relative">
                {/* CSS purely visual fake chart for demonstration since we can't use external chart libs without installing */}
                {[65, 78, 92, 85, 95].map((val, i) => (
                  <div key={i} className="w-full bg-indigo-100 rounded-t-lg relative group transition-all duration-300 hover:bg-indigo-500" style={{ height: `${val}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded transition-opacity">{val}%</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-3 text-xs font-semibold text-gray-400 px-4">
                <span>Quiz 1</span><span>Quiz 2</span><span>Quiz 3</span><span>Quiz 4</span><span>Latest</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Strengths & Weaknesses</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-gray-700">JavaScript Basics</span>
                    <span className="text-sm font-bold text-emerald-600">92%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-gray-700">React Hooks</span>
                    <span className="text-sm font-bold text-indigo-600">75%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="font-semibold text-gray-700">Advanced State Management</span>
                    <span className="text-sm font-bold text-amber-500">45%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentPerformance;
