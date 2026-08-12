import React, { useEffect, useState } from 'react';
import { quizApi } from '../../api/quizApi';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, List, Clock, Target } from 'lucide-react';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Delete Modal State
  const [quizToDelete, setQuizToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  
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

  const handleDeleteClick = (quiz, e) => {
    if (e) e.stopPropagation();
    setQuizToDelete(quiz);
    setDeleteError('');
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
      
      // Provide a more human readable error if it's still a foreign key constraint
      if (backendMessage && backendMessage.includes('foreign key constraint')) {
        setDeleteError('This quiz cannot be deleted because it still contains questions, and the backend prevented the deletion. Please manually delete its questions first.');
      } else {
        setDeleteError(backendMessage || 'Failed to delete quiz.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleRowClick = (quiz) => {
    navigate(`/admin/quizzes/${quiz.id}/questions`);
  };

  // Modal Handlers
  const handleOpenModal = (quiz = null, e = null) => {
    if (e) e.stopPropagation();
    setFormError('');
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
        await fetchQuizzes(); // Refresh list after edit
        handleCloseModal();
      } else {
        const response = await quizApi.createQuiz(formData);
        const newQuizId = response?.data?.id || response?.quiz?.id || response?.id;
        
        handleCloseModal();
        if (newQuizId) {
          navigate(`/admin/quizzes/${newQuizId}/questions`);
        } else {
          await fetchQuizzes(); // Fallback if no ID returned
        }
      }
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save quiz. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const columns = [
    {
      header: 'Quiz Name',
      render: (quiz) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{quiz.title}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">{quiz.description}</div>
        </div>
      )
    },
    {
      header: 'Duration',
      render: (quiz) => (
        <div className="flex items-center gap-1"><Clock className="h-4 w-4" /> {quiz.duration} mins</div>
      )
    },
    {
      header: 'Marks',
      render: (quiz) => (
        <div className="flex items-center gap-1"><Target className="h-4 w-4" /> {quiz.totalMarks}</div>
      )
    },
    {
      header: 'Status',
      render: (quiz) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
          quiz.status === 'published' || quiz.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {quiz.status || 'draft'}
        </span>
      )
    },
    {
      header: 'Actions',
      cellClassName: 'text-right',
      render: (quiz) => (
        <div className="flex justify-end items-center gap-4">
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/admin/quizzes/${quiz.id}/questions`); }}
            className="text-indigo-600 hover:text-indigo-900"
            title="Manage Questions"
          >
            <List className="h-5 w-5" />
          </button>
          <button 
            onClick={(e) => handleOpenModal(quiz, e)}
            className="text-blue-600 hover:text-blue-900"
            title="Edit Quiz"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button 
            onClick={(e) => handleDeleteClick(quiz, e)}
            className="text-red-600 hover:text-red-900"
            title="Delete Quiz"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quiz Management</h1>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Create Quiz
        </button>
      </div>

      {error ? (
        <div className="p-8 text-center text-red-500 bg-white rounded-xl  border border-gray-100">{error}</div>
      ) : (
        <Table 
          columns={columns} 
          data={quizzes} 
          onRowClick={handleRowClick}
          isLoading={isLoading} 
          emptyMessage="No quizzes found. Click 'Create Quiz' to get started."
        />
      )}

      {/* Reusable Modal for Quiz Form */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingQuiz ? 'Edit Quiz' : 'Create New Quiz'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
              {formError}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quiz Title *</label>
            <input
              type="text"
              name="title"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. JavaScript Basics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.description}
              onChange={handleChange}
              placeholder="Brief description of the quiz..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
              <input 
                type="number" 
                name="duration" 
                min="1" 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.duration} 
                onChange={handleChange} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks *</label>
              <input 
                type="number" 
                name="totalMarks" 
                min="1" 
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                value={formData.totalMarks} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              name="status" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              value={formData.status} 
              onChange={handleChange}
            >
              <option value="draft">Draft (Hidden from Students)</option>
              <option value="published">Published (Visible to Students)</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={handleCloseModal} 
              className="px-5 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 bg-blue-600 rounded-lg font-medium text-white hover:bg-blue-700 transition flex items-center disabled:opacity-50"
              disabled={isSaving}
            >
              {isSaving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saving...</>
              ) : (
                editingQuiz ? 'Update Quiz' : 'Create & Add Questions'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!quizToDelete}
        onClose={() => setQuizToDelete(null)}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {deleteError}
          </div>
        )}
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete <span className="font-semibold text-gray-800">"{quizToDelete?.title}"</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setQuizToDelete(null)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            onClick={confirmDelete}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center disabled:opacity-50"
            disabled={isSaving}
          >
            {isSaving ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Deleting...</>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminQuizzes;
