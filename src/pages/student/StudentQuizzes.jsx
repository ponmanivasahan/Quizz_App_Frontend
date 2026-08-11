import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { BookOpen, Clock, Target, Search, Filter } from 'lucide-react';

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const responseData = await quizApi.getAllQuizzes();
      
      let allQuizzes = [];
      if (Array.isArray(responseData)) {
        allQuizzes = responseData;
      } else if (responseData && typeof responseData === 'object') {
        if (Array.isArray(responseData.quizzes)) {
          allQuizzes = responseData.quizzes;
        } else if (Array.isArray(responseData.data)) {
          allQuizzes = responseData.data;
        } else if (responseData.data && Array.isArray(responseData.data.quizzes)) {
          allQuizzes = responseData.data.quizzes;
        }
      }
      // Students should only see published/active quizzes
      const published = allQuizzes.filter(q => q.status === 'published' || q.status === 'active');
      setQuizzes(published);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-10">
      <div className="animate-slide-up">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Available Quizzes</h1>
        <p className="text-gray-500 font-medium mt-1">Browse and take quizzes assigned to you.</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row gap-4 animate-slide-up stagger-1">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search quizzes..."
            className="pl-11 w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
          <Filter className="w-5 h-5" /> Filter
        </button>
      </div>

      {/* Quiz Grid */}
      {isLoading ? (
        <div className="flex justify-center p-12 animate-fade-in">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-slide-up stagger-2">
          {filteredQuizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-300 flex flex-col overflow-hidden group">
              <div className="p-6 flex-1">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-600 group-hover:scale-110 transition-all duration-300">
                  <BookOpen className="w-6 h-6 text-indigo-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{quiz.description || 'No description provided.'}</p>
              </div>
              
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between mt-auto">
                <div className="flex gap-4">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400" /> {quiz.duration}m
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <Target className="w-4 h-4 text-gray-400" /> {quiz.totalMarks} pts
                  </span>
                </div>
                <Link 
                  to={`/student/quizzes/${quiz.id}`}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 font-semibold text-sm rounded-lg hover:bg-indigo-600 hover:text-white transition-colors duration-200"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center animate-fade-in stagger-2">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Quizzes Found</h3>
          <p className="text-gray-500 font-medium">We couldn't find any active quizzes matching your criteria.</p>
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;
