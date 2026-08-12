import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/analyticsApi';
import { BarChart3, TrendingUp, TrendingDown, Target, Zap, Activity } from 'lucide-react';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await analyticsApi.getOverview();
        setData(response);
      } catch (err) {
        setError('Failed to load analytics.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  if (error) return <div className="p-8 text-center text-red-500 bg-white rounded-xl ">{error}</div>;

  const StatBlock = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white rounded-xl  border border-gray-100 p-6 flex items-center">
      <div className={`p-4 rounded-full mr-4 ${colorClass}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Platform Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatBlock title="Total Attempts" value={data?.totalAttempts || 0} icon={Activity} colorClass="bg-blue-500" />
        <StatBlock title="Average Score" value={data?.averageScore || 0} icon={Target} colorClass="bg-indigo-500" />
        <StatBlock title="Average Percentage" value={`${data?.averagePercentage || 0}%`} icon={BarChart3} colorClass="bg-purple-500" />
        <StatBlock title="Highest Score" value={data?.highestScore || 0} icon={TrendingUp} colorClass="bg-green-500" />
        <StatBlock title="Lowest Score" value={data?.lowestScore || 0} icon={TrendingDown} colorClass="bg-red-500" />
        <StatBlock title="Pass Rate" value={`${data?.passRate || 0}%`} icon={Zap} colorClass="bg-yellow-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
         <div className="bg-white rounded-xl  border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Pass / Fail Distribution</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-200">
               <p className="text-gray-500 text-sm">Visual Chart Integration Point</p>
               {/* Connect a charting library like Recharts here if backend provides array data */}
            </div>
         </div>
         <div className="bg-white rounded-xl  border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Score Distribution</h3>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-200">
               <p className="text-gray-500 text-sm">Visual Chart Integration Point</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
