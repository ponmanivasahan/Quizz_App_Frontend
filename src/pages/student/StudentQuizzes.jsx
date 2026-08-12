import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { Clock, Target, Search, Filter, Atom, Hexagon, Webhook, BookOpen, Code, Database, Layout } from 'lucide-react';
import heroImg from '../../assets/images/quizzes_hero.jpg';

// Helper to dynamically assign categories and icons based on quiz titles without modifying backend
const inferQuizMeta = (title) => {
  const t = title.toLowerCase();
  
  if (t.includes('html')) {
    return { category: 'Web Development', tagClass: 'bg-orange-50 text-orange-600', iconText: '5', iconClass: 'bg-[#E34F26] text-white', icon: null };
  }
  if (t.includes('css')) {
    return { category: 'Web Development', tagClass: 'bg-blue-50 text-blue-600', iconText: '3', iconClass: 'bg-[#1572B6] text-white', icon: null };
  }
  if (t.includes('javascript') || t.includes('js')) {
    return { category: 'Programming', tagClass: 'bg-yellow-50 text-yellow-700', iconText: 'JS', iconClass: 'bg-[#F7DF1E] text-black', icon: null };
  }
  if (t.includes('react')) {
    return { category: 'Front-end', tagClass: 'bg-cyan-50 text-cyan-700', iconText: '', iconClass: 'bg-[#61DAFB] text-white', icon: Atom };
  }
  if (t.includes('node')) {
    return { category: 'Back-end', tagClass: 'bg-green-50 text-green-700', iconText: '', iconClass: 'bg-[#339933] text-white', icon: Hexagon };
  }
  if (t.includes('express')) {
    return { category: 'Back-end', tagClass: 'bg-gray-100 text-gray-700', iconText: 'ex', iconClass: 'bg-gray-800 text-white', icon: null };
  }
  if (t.includes('api') || t.includes('rest')) {
    return { category: 'API', tagClass: 'bg-purple-50 text-purple-700', iconText: '', iconClass: 'bg-purple-600 text-white', icon: Webhook };
  }
  if (t.includes('data') || t.includes('sql') || t.includes('dbms')) {
    return { category: 'Database', tagClass: 'bg-indigo-50 text-indigo-700', iconText: '', iconClass: 'bg-indigo-500 text-white', icon: Database };
  }
  if (t.includes('structure') || t.includes('algorithm')) {
    return { category: 'Data Structures', tagClass: 'bg-teal-50 text-teal-700', iconText: '', iconClass: 'bg-teal-500 text-white', icon: Code };
  }

  // Default fallback
  return { category: 'Computer Science', tagClass: 'bg-gray-100 text-gray-700', iconText: '', iconClass: 'bg-blue-500 text-white', icon: BookOpen };
};

const CATEGORIES = ['All Quizzes', 'Web Development', 'Programming', 'Database', 'Data Structures', 'Computer Science', 'Tools & Others'];

const StudentQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Quizzes');

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
      const published = allQuizzes.filter(q => q.status === 'published' || q.status === 'active');
      
      // Augment quizzes with metadata so we can filter by it
      const augmented = published.map(q => ({
        ...q,
        meta: inferQuizMeta(q.title)
      }));
      
      setQuizzes(augmented);
    } catch (error) {
      console.error('Failed to load quizzes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (quiz.description && quiz.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Some mock categories like 'Front-end' or 'API' map to 'Web Development' or 'Programming' in the main tabs 
    // To keep it simple, if category tab isn't 'All', we check if the meta category exactly matches OR loosely maps.
    let matchesCategory = true;
    if (activeCategory !== 'All Quizzes') {
      const c = quiz.meta.category;
      if (activeCategory === 'Web Development') {
        matchesCategory = ['Web Development', 'Front-end'].includes(c);
      } else if (activeCategory === 'Programming') {
        matchesCategory = ['Programming', 'Back-end', 'API'].includes(c);
      } else if (activeCategory === 'Tools & Others') {
        matchesCategory = !['Web Development', 'Front-end', 'Programming', 'Back-end', 'API', 'Database', 'Data Structures', 'Computer Science'].includes(c);
      } else {
        matchesCategory = c === activeCategory;
      }
    }
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-10 font-sans max-w-7xl mx-auto">
      
      {/* 1. Header Banner */}
      <section className="bg-[#fcfdff] rounded-3xl overflow-hidden relative flex flex-col md:flex-row items-center justify-between p-6 md:p-10 shadow-sm border border-indigo-50/50">
        <div className="flex-1 z-10 max-w-xl">
          <h1 className="text-4xl font-bold text-[#1a1f36] mb-3 tracking-tight">Available Quizzes</h1>
          <p className="text-gray-500 font-medium text-lg">Browse and take quizzes assigned to you.</p>
        </div>
        <div className="hidden md:block w-72 lg:w-96 shrink-0 mix-blend-multiply relative z-10 -my-10 -mr-4">
          <img src={heroImg} alt="Quizzes Header" className="w-full h-auto object-contain" />
        </div>
      </section>

      {/* 2. Search & Filter Row */}
      <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search quizzes by title, topic or keyword..."
            className="pl-11 w-full px-4 py-3 bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium text-gray-800 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-100 rounded-xl font-bold text-gray-600 bg-white hover:bg-gray-50 transition-colors shadow-sm">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      {/* 3. Category Tabs */}
      <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mx-2 px-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm border ${
              activeCategory === cat 
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-600/20' 
                : 'bg-white text-gray-600 border-gray-100 hover:border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 4. Quiz Grid */}
      {isLoading ? (
        <div className="flex justify-center p-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredQuizzes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 animate-slide-up stagger-1">
          {filteredQuizzes.map((quiz) => {
            const IconComponent = quiz.meta.icon;
            return (
              <div key={quiz.id} className="bg-white rounded-[24px] border border-gray-100 shadow-[0_4px_25px_rgb(0,0,0,0.02)] hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-100 transition-all duration-300 flex flex-col p-6 group">
                
                {/* Card Header: Icon & Tag */}
                <div className="flex justify-between items-start mb-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${quiz.meta.iconClass}`}>
                    {IconComponent ? (
                      <IconComponent className="w-7 h-7" strokeWidth={1.5} />
                    ) : (
                      <span className="text-xl font-black tracking-tighter">{quiz.meta.iconText}</span>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${quiz.meta.tagClass}`}>
                    {quiz.meta.category}
                  </span>
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors">{quiz.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-6">{quiz.description || 'Test your knowledge on this topic and improve your skills.'}</p>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between pt-5 border-t border-gray-50">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Clock className="w-4 h-4 text-gray-400" /> {quiz.duration} mins
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                      <Target className="w-4 h-4 text-gray-400" /> {quiz.totalMarks} pts
                    </span>
                  </div>
                  <Link 
                    to={`/student/quizzes/${quiz.id}`}
                    className="flex items-center gap-1 text-[13px] font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200"
                  >
                    View Details <span className="text-[10px] ml-0.5">→</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center animate-fade-in stagger-2">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Quizzes Found</h3>
          <p className="text-gray-500 font-medium">We couldn't find any quizzes matching your search or category.</p>
          {searchTerm || activeCategory !== 'All Quizzes' ? (
            <button 
              onClick={() => {setSearchTerm(''); setActiveCategory('All Quizzes');}}
              className="mt-6 px-6 py-2.5 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Clear Filters
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default StudentQuizzes;
