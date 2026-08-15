import React, { useEffect, useState, useRef } from 'react';
import { quizApi } from '../../api/quizApi';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Edit, Trash2, List, Clock, Target, BookOpen, 
  CheckCircle, LayoutGrid, Search, MoreVertical, Calendar, 
  AlertCircle, XCircle, Eye
} from 'lucide-react';
import Modal from '../../components/ui/Modal';

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete Modal State
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  // Dropdown State
  const [openDropdownId, setOpenDropdownId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 30,
    totalMarks: 100,
    status: 'draft'
  });

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const data = await quizApi.getAllQuizzes();
      setQuizzes(Array.isArray(data) ? data : (data.quizzes || data.data || []));
    } catch (err) {
      setError('Failed to load quizzes.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (quiz, newStatus) => {
    try {
      await quizApi.updateQuiz(quiz.id, { ...quiz, status: newStatus });
      setQuizzes(quizzes.map(q => q.id === quiz.id ? { ...q, status: newStatus } : q));
    } catch (err) {
      console.error('Failed to change status:', err);
      // Fallback message could be added here
    }
    setOpenDropdownId(null);
  };

  const handleDeleteClick = (quiz, e) => {
    if (e) e.stopPropagation();
    setQuizToDelete(quiz);
    setDeleteError('');
    setOpenDropdownId(null);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;
    setDeleteError('');
    setIsSaving(true);
    try {
      // Manually cascade delete questions first since the backend lacks ON DELETE CASCADE
      try {
        const qRes = await quizApi.getQuestions(quizToDelete.id);
        let questionsList = [];
        if (Array.isArray(qRes)) questionsList = qRes;
        else if (Array.isArray(qRes.data)) questionsList = qRes.data;
        else if (Array.isArray(qRes.questions)) questionsList = qRes.questions;
        else if (qRes.data && Array.isArray(qRes.data.questions)) questionsList = qRes.data.questions;
        
        if (questionsList.length > 0) {
          await Promise.all(questionsList.map(q => quizApi.deleteQuestion(q.id)));
        }
      } catch (e) {
        console.warn('Failed to pre-delete questions', e);
      }

      await quizApi.deleteQuiz(quizToDelete.id);
      setQuizzes(quizzes.filter(q => q.id !== quizToDelete.id));
      setQuizToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      const backendMessage = err.response?.data?.message || err.response?.data?.error || err.message;
      
      if (backendMessage && backendMessage.includes('foreign key constraint')) {
        setDeleteError('This quiz cannot be deleted because it still contains questions. Please manually delete its questions first.');
      } else {
        setDeleteError(backendMessage || 'Failed to delete quiz.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Modal Handlers
  const handleOpenModal = (quiz = null, e = null) => {
    if (e) e.stopPropagation();
    setFormError('');
    setOpenDropdownId(null);
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title || '',
        description: quiz.description || '',
        duration: quiz.duration || 30,
        totalMarks: quiz.totalMarks || 100,
        status: quiz.status || 'draft'
      });
    } else {
      setEditingQuiz(null);
      setFormData({
        title: '',
        description: '',
        duration: 30,
        totalMarks: 100,
        status: 'draft'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuiz(null);
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFormError('');
    try {
      if (editingQuiz) {
        await quizApi.updateQuiz(editingQuiz.id, formData);
        await fetchQuizzes();
        handleCloseModal();
      } else {
        const response = await quizApi.createQuiz(formData);
        const newQuizId = response?.data?.id || response?.quiz?.id || response?.id;
        
        handleCloseModal();
        if (newQuizId) {
          navigate(`/admin/quizzes/${newQuizId}/questions`);
        } else {
          await fetchQuizzes();
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Derived Data
  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isQuizActive = quiz.status === 'published' || quiz.status === 'active';
    const matchesStatus = statusFilter === 'all' ? true 
                        : statusFilter === 'active' ? isQuizActive 
                        : !isQuizActive;

    return matchesSearch && matchesStatus;
  });

  const totalQuizzes = quizzes.length;
  const activeQuizzes = quizzes.filter(q => q.status === 'published' || q.status === 'active').length;
  const inactiveQuizzes = totalQuizzes - activeQuizzes;
  
  // Calculate total questions if available. 
  const totalQuestions = quizzes.reduce((sum, q) => {
    const count = q.questions?.length || q._count?.questions || q.questionCount || 0;
    return sum + count;
  }, 0);

  const toggleDropdown = (id, e) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 slide-in-from-bottom-2">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Quiz Management</h1>
          <p className="text-slate-500 mt-2">Create, organize, and manage assessments for your students.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="group bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
          Create Quiz
        </button>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300 delay-[0ms] animate-in slide-in-from-bottom-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Quizzes</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalQuizzes}</h3>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300 delay-[50ms] animate-in slide-in-from-bottom-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Quizzes</p>
            <h3 className="text-2xl font-bold text-slate-900">{activeQuizzes}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300 delay-[100ms] animate-in slide-in-from-bottom-4">
          <div className="p-3 bg-slate-50 text-slate-500 rounded-xl"><XCircle className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Inactive Quizzes</p>
            <h3 className="text-2xl font-bold text-slate-900">{inactiveQuizzes}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300 delay-[150ms] animate-in slide-in-from-bottom-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><LayoutGrid className="h-6 w-6" /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Questions</p>
            <h3 className="text-2xl font-bold text-slate-900">{totalQuestions}</h3>
          </div>
        </div>
      </div>

      {/* 3. SEARCH AND FILTER */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search quizzes by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'all' ? 'bg-slate-800 text-white' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
          >
            All {totalQuizzes > 0 && <span className="ml-1.5 opacity-70">({totalQuizzes})</span>}
          </button>
          <button 
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
          >
            Active {activeQuizzes > 0 && <span className="ml-1.5 opacity-70">({activeQuizzes})</span>}
          </button>
          <button 
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'inactive' ? 'bg-slate-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Inactive {inactiveQuizzes > 0 && <span className="ml-1.5 opacity-70">({inactiveQuizzes})</span>}
          </button>
        </div>
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center gap-3">
          <AlertCircle className="h-10 w-10 text-red-500 mb-2" />
          <h3 className="text-lg font-semibold text-gray-900">Unable to load quizzes</h3>
          <p className="text-gray-500">{error}</p>
          <button onClick={fetchQuizzes} className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-medium hover:bg-indigo-100 transition">
            Try Again
          </button>
        </div>
      )}

      {/* QUIZ CARDS GRID */}
      {!error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* LOADING STATE */}
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                    <div>
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-100 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-100 rounded-full w-16"></div>
                </div>
                <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-6"></div>
                <div className="flex justify-between border-t border-gray-50 pt-4 mb-4">
                  <div className="h-4 bg-gray-100 rounded w-16"></div>
                  <div className="h-4 bg-gray-100 rounded w-16"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-200 rounded-xl flex-1"></div>
                  <div className="h-10 bg-gray-100 rounded-xl w-10"></div>
                </div>
              </div>
            ))
          ) : filteredQuizzes.length === 0 ? (
            /* EMPTY STATE */
            <div className="col-span-full py-16 px-6 text-center bg-white rounded-3xl border border-gray-100 border-dashed flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchQuery || statusFilter !== 'all' ? "No quizzes match your filters" : "No quizzes created yet"}
              </h3>
              <p className="text-gray-500 max-w-sm mb-6">
                {searchQuery || statusFilter !== 'all' 
                  ? "Try adjusting your search or filters to find what you're looking for." 
                  : "Create your first quiz to start building assessments and evaluating students."}
              </p>
              {searchQuery || statusFilter !== 'all' ? (
                <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); }} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">
                  Clear Filters
                </button>
              ) : (
                <button onClick={() => handleOpenModal()} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
                  + Create Quiz
                </button>
              )}
            </div>
          ) : (
            /* QUIZ CARDS */
            filteredQuizzes.map((quiz, index) => {
              const isActive = quiz.status === 'published' || quiz.status === 'active';
              const questionCount = quiz.questions?.length || quiz._count?.questions || quiz.questionCount;
              const hasNoQuestions = questionCount === 0;

              return (
                <div 
                  key={quiz.id} 
                  className={`bg-white rounded-2xl border ${isActive ? 'border-gray-200' : 'border-gray-100'} shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-250 flex flex-col animate-in fade-in slide-in-from-bottom-4`}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  onClick={() => setOpenDropdownId(null)}
                >
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Card Header */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex gap-3">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                          <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 line-clamp-1" title={quiz.title}>{quiz.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider ${isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* More Menu */}
                      <div className="relative">
                        <button 
                          onClick={(e) => toggleDropdown(quiz.id, e)}
                          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                        
                        {openDropdownId === quiz.id && (
                          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-10 animate-in fade-in zoom-in-95 duration-100">
                            <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/quizzes/${quiz.id}/questions`); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <List className="h-4 w-4" /> Manage Questions
                            </button>
                            <button onClick={(e) => handleOpenModal(quiz, e)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                              <Edit className="h-4 w-4" /> Edit Quiz
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleStatusChange(quiz, isActive ? 'draft' : 'published'); }} 
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                              {isActive ? <><XCircle className="h-4 w-4" /> Deactivate</> : <><CheckCircle className="h-4 w-4" /> Activate</>}
                            </button>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button onClick={(e) => handleDeleteClick(quiz, e)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                      {quiz.description || "No description provided for this quiz."}
                    </p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm border-t border-gray-50 pt-4 mb-5">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>{quiz.duration} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Target className="h-4 w-4 text-gray-400" />
                        <span>{quiz.totalMarks} marks</span>
                      </div>
                      <div className={`col-span-2 flex items-center gap-1.5 ${hasNoQuestions ? 'text-amber-600 font-medium' : 'text-gray-600'}`}>
                        {hasNoQuestions ? <AlertCircle className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4 text-gray-400" />}
                        <span>
                          {questionCount !== undefined 
                            ? `${questionCount} Question${questionCount !== 1 ? 's' : ''}` 
                            : 'Questions count unavailable'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/quizzes/${quiz.id}/questions`); }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-medium transition-colors ${
                          hasNoQuestions 
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200' 
                            : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                        }`}
                      >
                        <List className="h-4 w-4" />
                        Manage Questions
                      </button>
                      <button 
                        onClick={(e) => handleOpenModal(quiz, e)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100"
                        title="Edit Quiz"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal - Create/Edit */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3 text-red-700 text-sm">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{formError}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Quiz Title *</label>
            <input
              type="text"
              name="title"
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. JavaScript Basics"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the quiz..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" /> Duration (minutes) *
              </label>
              <input 
                type="number" 
                name="duration" 
                min="1" 
                required 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                value={formData.duration} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-400" /> Total Marks *
              </label>
              <input 
                type="number" 
                name="totalMarks" 
                min="1" 
                required 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" 
                value={formData.totalMarks} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
            <select 
              name="status" 
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none" 
              value={formData.status} 
              onChange={handleChange}
            >
              <option value="draft">Inactive (Hidden from Students)</option>
              <option value="published">Active (Visible to Students)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
            <button 
              type="button" 
              onClick={handleCloseModal} 
              className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-indigo-600 rounded-xl font-medium text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center disabled:opacity-70"
              disabled={isSaving}
            >
              {isSaving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div> Saving...</>
              ) : (
                editingQuiz ? 'Save Changes' : 'Create & Add Questions'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!quizToDelete}
        onClose={() => setQuizToDelete(null)}
        title="Delete Quiz?"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Are you sure you want to delete <span className="text-red-600">"{quizToDelete?.title}"</span>?
          </h3>
          
          <p className="text-gray-500 mb-6">
            If this quiz has questions or student attempts, related data may also be affected. This action cannot be undone.
          </p>

          {deleteError && (
            <div className="w-full mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3 text-red-700 text-sm text-left">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{deleteError}</p>
            </div>
          )}

          <div className="flex justify-center w-full gap-3">
            <button 
              onClick={() => setQuizToDelete(null)}
              className="flex-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              onClick={confirmDelete}
              className="flex-1 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex justify-center items-center disabled:opacity-70"
              disabled={isSaving}
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
              ) : (
                'Delete Quiz'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminQuizzes;
