import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { ArrowLeft, Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight, AlertCircle, BookOpen, Eye, CheckCircle2 } from 'lucide-react';
import Modal from '../../components/ui/Modal';

const AdminQuestions = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [quizDetails, setQuizDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isPaginating, setIsPaginating] = useState(false);
  const listTopRef = useRef(null);
  
  // Interaction Modal States
  const [actionModalQuestion, setActionModalQuestion] = useState(null);
  const [viewModalQuestion, setViewModalQuestion] = useState(null);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null); // To track unsaved changes
  
  // Delete Modal state
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: 'A',
    marks: 1
  });

  useEffect(() => {
    fetchQuizAndQuestions();
  }, [id]);

  // Reset to page 1 when search or items per page change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const fetchQuizAndQuestions = async () => {
    setIsLoading(true);
    try {
      const quizRes = await quizApi.getQuizById(id);
      setQuizDetails(quizRes.quiz || quizRes.data || quizRes);
      
      const qRes = await quizApi.getQuestions(id);
      let parsedQuestions = [];
      if (Array.isArray(qRes)) parsedQuestions = qRes;
      else if (Array.isArray(qRes.data)) parsedQuestions = qRes.data;
      else if (Array.isArray(qRes.questions)) parsedQuestions = qRes.questions;
      else if (qRes.data && Array.isArray(qRes.data.questions)) parsedQuestions = qRes.data.questions;
      
      setQuestions(parsedQuestions);
    } catch (error) {
      console.error('Failed to load questions', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form data has unsaved changes
  const hasUnsavedChanges = () => {
    if (!initialFormData) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  };

  const handleOpenModal = (question = null, e = null) => {
    if (e) e.stopPropagation();
    
    // Close other modals
    setActionModalQuestion(null);
    setViewModalQuestion(null);
    setShowDiscardConfirm(false);

    let newFormData;
    if (question) {
      setEditingQuestion(question);
      newFormData = {
        questionText: question.questionText || '',
        optionA: question.optionA || '',
        optionB: question.optionB || '',
        optionC: question.optionC || '',
        optionD: question.optionD || '',
        correctAnswer: question.correctAnswer || 'A',
        marks: question.marks || 1
      };
    } else {
      setEditingQuestion(null);
      newFormData = {
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: 1
      };
    }
    
    setFormData(newFormData);
    setInitialFormData(newFormData);
    setIsModalOpen(true);
  };

  const handleCloseModalAttempt = () => {
    if (hasUnsavedChanges()) {
      setShowDiscardConfirm(true);
    } else {
      forceCloseModal();
    }
  };

  const forceCloseModal = () => {
    setShowDiscardConfirm(false);
    setIsModalOpen(false);
    setEditingQuestion(null);
    setInitialFormData(null);
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
    try {
      if (editingQuestion) {
        await quizApi.updateQuestion(editingQuestion.id, formData);
      } else {
        await quizApi.createQuestion(id, formData);
        setCurrentPage(1); // Go to page 1 to show newly added question
      }
      await fetchQuizAndQuestions();
      // Ensure we clear the dirty state before closing
      setInitialFormData(formData); 
      forceCloseModal();
    } catch (error) {
      alert('Failed to save question.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteClick = (question, e) => {
    if (e) e.stopPropagation();
    setQuestionToDelete(question);
    setDeleteError('');
  };

  const confirmDelete = async () => {
    if (!questionToDelete) return;
    setDeleteError('');
    setIsSaving(true);
    try {
      await quizApi.deleteQuestion(questionToDelete.id);
      
      const currentFilteredTotal = filteredQuestions.length;
      const isLastItemOnPage = (currentFilteredTotal - 1) % itemsPerPage === 0;
      const isNotFirstPage = currentPage > 1;
      
      if (isLastItemOnPage && isNotFirstPage) {
        setCurrentPage(prev => prev - 1);
      }
      
      setQuestions(questions.filter(q => q.id !== questionToDelete.id));
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      setDeleteError(backendMessage || 'Failed to delete question.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCardClick = (question) => {
    setViewModalQuestion(question);
  };

  // Pagination Logic
  const filteredQuestions = questions.filter(q => 
    q.questionText?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalQuestions = filteredQuestions.length;
  const totalPages = Math.ceil(totalQuestions / itemsPerPage);
  
  const validCurrentPage = Math.min(currentPage, totalPages > 0 ? totalPages : 1);
  if (validCurrentPage !== currentPage && totalPages > 0) {
    setCurrentPage(validCurrentPage);
  }

  const startItem = (validCurrentPage - 1) * itemsPerPage;
  const endItem = Math.min(startItem + itemsPerPage, totalQuestions);
  
  const paginatedQuestions = filteredQuestions.slice(startItem, endItem);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setIsPaginating(true);
      setCurrentPage(newPage);
      
      if (listTopRef.current) {
        listTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      setTimeout(() => {
        setIsPaginating(false);
      }, 250);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto pb-12">
      
      {/* 1. Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/admin/quizzes" className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center mb-2 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Quizzes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Questions: {quizDetails?.title || 'Loading...'}
          </h1>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="group bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-200 transition-all duration-200 flex items-center gap-2"
        >
          <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" /> 
          Add Question
        </button>
      </div>

      {/* 2. Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search questions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* 3. Question List */}
      <div ref={listTopRef} className="scroll-mt-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse flex flex-col md:flex-row gap-4">
                <div className="h-20 bg-gray-100 rounded w-full md:w-1/2"></div>
                <div className="h-20 bg-gray-50 rounded w-full md:w-1/4"></div>
                <div className="h-10 bg-gray-100 rounded w-full md:w-1/4 mt-auto"></div>
              </div>
            ))}
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="py-16 px-6 text-center bg-white rounded-3xl border border-gray-100 border-dashed flex flex-col items-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-8 w-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? "No questions match your search." : "No questions added yet."}
            </h3>
            <p className="text-gray-500 max-w-sm mb-6">
              {searchQuery 
                ? "Try adjusting your search query." 
                : "Add questions to make this quiz available to students."}
            </p>
            {!searchQuery && (
              <button onClick={() => handleOpenModal()} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition shadow-sm">
                + Add Question
              </button>
            )}
          </div>
        ) : (
          <div className={`space-y-4 transition-opacity duration-200 ${isPaginating ? 'opacity-50' : 'opacity-100'}`}>
            {paginatedQuestions.map((q, idx) => {
              const questionNumber = startItem + idx + 1;
              return (
                <div 
                  key={q.id} 
                  onClick={() => handleCardClick(q)}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6 hover:border-indigo-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer transition-all flex flex-col md:flex-row gap-6 items-start relative group"
                >
                  
                  {/* Hover Indicator */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-indigo-500 opacity-0 group-hover:opacity-100 rounded-t-2xl transition-opacity"></div>
                  
                  {/* Question Content */}
                  <div className="flex-1 w-full md:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md tracking-wide uppercase">
                        Question {questionNumber.toString().padStart(2, '0')}
                      </span>
                      <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-md font-medium">
                        Marks: {q.marks}
                      </span>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] text-gray-400 font-medium ml-2 hidden sm:inline-block">
                        Click to view actions
                      </span>
                    </div>
                    <p className="font-semibold text-gray-900 text-base md:text-lg whitespace-pre-wrap leading-relaxed">
                      {q.questionText}
                    </p>
                  </div>
                  
                  {/* Options Preview Removed per user request */}
                  
                  {/* Actions (stop propagation) */}
                  <div className="flex w-full md:w-auto md:flex-col justify-end gap-2 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                    <button 
                      onClick={(e) => handleOpenModal(q, e)} 
                      className="flex-1 md:flex-none p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-transparent hover:border-indigo-100 flex items-center justify-center gap-2" 
                      title="Edit Question"
                    >
                      <Edit className="h-5 w-5" />
                      <span className="md:hidden text-sm font-medium">Edit</span>
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(q, e)} 
                      className="flex-1 md:flex-none p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100 flex items-center justify-center gap-2" 
                      title="Delete Question"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="md:hidden text-sm font-medium">Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Pagination */}
      {!isLoading && totalQuestions > 0 && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-900">{startItem + 1}</span>–<span className="font-medium text-gray-900">{endItem}</span> of <span className="font-medium text-gray-900">{totalQuestions}</span> questions
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Questions per page:</span>
              <select 
                value={itemsPerPage} 
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-gray-50 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
            
            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors flex items-center"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="sr-only sm:not-sr-only sm:text-sm sm:pr-1 sm:font-medium">Prev</span>
                </button>
                
                <div className="hidden sm:flex items-center gap-1">
                  {getPageNumbers().map((num, idx) => (
                    <button
                      key={idx}
                      onClick={() => num !== '...' && handlePageChange(num)}
                      disabled={num === '...'}
                      className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        num === currentPage 
                          ? 'bg-indigo-600 text-white shadow-sm' 
                          : num === '...' 
                            ? 'text-gray-400 cursor-default' 
                            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900 bg-white border border-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="sm:hidden text-sm font-medium text-gray-600 px-3">
                  Page {currentPage} of {totalPages}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors flex items-center"
                >
                  <span className="sr-only sm:not-sr-only sm:text-sm sm:pl-1 sm:font-medium">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Modal */}
      <Modal
        isOpen={!!actionModalQuestion}
        onClose={() => setActionModalQuestion(null)}
        title={actionModalQuestion ? `Question ${filteredQuestions.findIndex(q => q.id === actionModalQuestion.id) + 1}`.padStart(2, '0') : ''}
        maxWidth="max-w-md"
      >
        <div className="pb-2">
          <p className="text-gray-800 font-semibold mb-1 line-clamp-2">
            {actionModalQuestion?.questionText}
          </p>
          <p className="text-gray-500 text-sm mb-6 border-b border-gray-100 pb-4">
            What would you like to do?
          </p>

          <div className="space-y-3">
            <button 
              onClick={() => {
                setViewModalQuestion(actionModalQuestion);
                setActionModalQuestion(null);
              }}
              className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex items-start gap-4 group"
            >
              <div className="bg-indigo-100 text-indigo-600 p-2 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-indigo-900 transition-colors">View Question</h4>
                <p className="text-sm text-gray-500">View the complete question details</p>
              </div>
            </button>

            <button 
              onClick={() => {
                setActionModalQuestion(null);
                handleOpenModal(); // Opens add form
              }}
              className="w-full text-left p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all flex items-start gap-4 group"
            >
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">Add Question</h4>
                <p className="text-sm text-gray-500">Add another question to this quiz</p>
              </div>
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <button 
              onClick={() => setActionModalQuestion(null)}
              className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* View Question Modal */}
      <Modal
        isOpen={!!viewModalQuestion}
        onClose={() => setViewModalQuestion(null)}
        title={viewModalQuestion ? `Question ${filteredQuestions.findIndex(q => q.id === viewModalQuestion.id) + 1}`.padStart(2, '0') : 'Question Details'}
        maxWidth="max-w-2xl"
      >
        {viewModalQuestion && (
          <div className="pb-2">
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 whitespace-pre-wrap leading-relaxed">
                {viewModalQuestion.questionText}
              </h3>
            </div>

            <div className="border-t border-b border-gray-100 py-6 mb-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Options</h4>
              <div className="space-y-3">
                {['A', 'B', 'C', 'D'].map(opt => (
                  <div 
                    key={opt} 
                    className={`p-4 rounded-xl border flex items-start gap-3 ${
                      viewModalQuestion.correctAnswer === opt 
                        ? 'bg-green-50 border-green-200 shadow-sm' 
                        : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                      viewModalQuestion.correctAnswer === opt 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {opt}
                    </div>
                    <div className={`flex-1 text-base ${viewModalQuestion.correctAnswer === opt ? 'text-green-900 font-medium' : 'text-gray-700'}`}>
                      {viewModalQuestion[`option${opt}`]}
                    </div>
                    {viewModalQuestion.correctAnswer === opt && (
                      <div className="flex items-center text-green-600 text-sm font-bold gap-1 ml-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="hidden sm:inline">Correct</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mb-8 text-gray-600">
              <span className="font-medium">Marks:</span> 
              <span className="inline-block bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg">
                {viewModalQuestion.marks}
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setViewModalQuestion(null)}
                className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const q = viewModalQuestion;
                  setViewModalQuestion(null);
                  handleOpenModal(q);
                }}
                className="px-6 py-2.5 bg-indigo-600 rounded-xl font-medium text-white hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Edit className="h-4 w-4" /> Edit Question
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModalAttempt} 
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
        maxWidth="max-w-2xl"
      >
        {!showDiscardConfirm ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Question Text *</label>
              <textarea
                name="questionText"
                required
                rows="3"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
                value={formData.questionText}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Option A *</label>
                <input type="text" name="optionA" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" value={formData.optionA} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Option B *</label>
                <input type="text" name="optionB" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" value={formData.optionB} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Option C *</label>
                <input type="text" name="optionC" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" value={formData.optionC} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Option D *</label>
                <input type="text" name="optionD" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" value={formData.optionD} onChange={handleChange} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Correct Answer *</label>
                <select name="correctAnswer" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all appearance-none" value={formData.correctAnswer} onChange={handleChange}>
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Marks *</label>
                <input type="number" name="marks" min="1" required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all" value={formData.marks} onChange={handleChange} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-100">
              <button type="button" onClick={handleCloseModalAttempt} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50" disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="px-6 py-2.5 bg-indigo-600 rounded-xl font-medium text-white hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md flex items-center disabled:opacity-70" disabled={isSaving}>
                {isSaving ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div> Saving...</>
                ) : (editingQuestion ? 'Save Changes' : 'Create Question')}
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Discard changes?</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              You have unsaved changes. If you close this form now, those changes will be lost.
            </p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowDiscardConfirm(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
              >
                Continue Editing
              </button>
              <button 
                onClick={forceCloseModal}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        title="Delete Question?"
        maxWidth="max-w-md"
      >
        <div className="flex flex-col items-center text-center pt-2 pb-4">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
            <Trash2 className="h-8 w-8" />
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Are you sure you want to delete this question?
          </h3>
          
          <p className="text-gray-500 mb-6">
            This action cannot be undone and will affect any related student attempts.
          </p>

          {deleteError && (
            <div className="w-full mb-6 p-4 bg-red-50 rounded-xl border border-red-100 flex gap-3 text-red-700 text-sm text-left">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{deleteError}</p>
            </div>
          )}

          <div className="flex justify-center w-full gap-3">
            <button 
              onClick={() => setQuestionToDelete(null)}
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
                'Delete Question'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminQuestions;
