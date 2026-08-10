import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizApi } from '../../api/quizApi';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';

const AdminQuestions = () => {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [quizDetails, setQuizDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  
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

  const fetchQuizAndQuestions = async () => {
    setIsLoading(true);
    try {
      const quizRes = await quizApi.getQuizById(id);
      setQuizDetails(quizRes.quiz || quizRes.data || quizRes);
      
      const qRes = await quizApi.getQuestions(id);
      // Make fetching extremely robust to various backend JSON structures
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

  const handleOpenModal = (question = null, e = null) => {
    if (e) e.stopPropagation();
    if (question) {
      setEditingQuestion(question);
      setFormData({
        questionText: question.questionText || '',
        optionA: question.optionA || '',
        optionB: question.optionB || '',
        optionC: question.optionC || '',
        optionD: question.optionD || '',
        correctAnswer: question.correctAnswer || 'A',
        marks: question.marks || 1
      });
    } else {
      setEditingQuestion(null);
      setFormData({
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A',
        marks: 1
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
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
    try {
      if (editingQuestion) {
        await quizApi.updateQuestion(editingQuestion.id, formData);
      } else {
        await quizApi.createQuestion(id, formData);
      }
      fetchQuizAndQuestions();
      handleCloseModal();
    } catch (error) {
      alert('Failed to save question.');
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

  const columns = [
    {
      header: 'Question',
      render: (q) => (
        <div className="max-w-md">
          <p className="font-semibold text-gray-900 whitespace-pre-wrap">{q.questionText}</p>
        </div>
      )
    },
    {
      header: 'Options',
      render: (q) => (
        <div className="text-xs space-y-1 text-gray-500 max-w-xs">
          <div className={q.correctAnswer === 'A' ? 'text-green-600 font-bold' : ''}>A: {q.optionA}</div>
          <div className={q.correctAnswer === 'B' ? 'text-green-600 font-bold' : ''}>B: {q.optionB}</div>
          <div className={q.correctAnswer === 'C' ? 'text-green-600 font-bold' : ''}>C: {q.optionC}</div>
          <div className={q.correctAnswer === 'D' ? 'text-green-600 font-bold' : ''}>D: {q.optionD}</div>
        </div>
      )
    },
    {
      header: 'Marks',
      accessor: 'marks',
      render: (q) => <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">{q.marks}</span>
    },
    {
      header: 'Actions',
      cellClassName: 'text-right',
      render: (q) => (
        <div className="flex justify-end gap-3">
          <button onClick={(e) => handleOpenModal(q, e)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded transition" title="Edit">
            <Edit className="h-5 w-5" />
          </button>
          <button onClick={(e) => handleDeleteClick(q, e)} className="p-2 text-red-600 hover:bg-red-50 rounded transition" title="Delete">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/admin/quizzes" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Quizzes
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">
            Questions: {quizDetails?.title || 'Loading...'}
          </h1>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Add Question
        </button>
      </div>

      {/* Reusable Table for Questions */}
      <Table 
        columns={columns}
        data={questions}
        isLoading={isLoading}
        onRowClick={(q) => handleOpenModal(q)}
        emptyMessage="No questions added yet. Click 'Add Question' to get started."
      />

      {/* Reusable Modal for Forms */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingQuestion ? 'Edit Question' : 'Add New Question'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Text *</label>
            <textarea
              name="questionText"
              required
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.questionText}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option A *</label>
              <input type="text" name="optionA" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.optionA} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option B *</label>
              <input type="text" name="optionB" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.optionB} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option C *</label>
              <input type="text" name="optionC" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.optionC} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Option D *</label>
              <input type="text" name="optionD" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.optionD} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correct Answer *</label>
              <select name="correctAnswer" className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.correctAnswer} onChange={handleChange}>
                <option value="A">Option A</option>
                <option value="B">Option B</option>
                <option value="C">Option C</option>
                <option value="D">Option D</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marks *</label>
              <input type="number" name="marks" min="1" required className="w-full px-4 py-2 border border-gray-300 rounded-lg" value={formData.marks} onChange={handleChange} />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={handleCloseModal} className="px-5 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50" disabled={isSaving}>
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 bg-blue-600 rounded-lg font-medium text-white hover:bg-blue-700 transition flex items-center disabled:opacity-50" disabled={isSaving}>
              {isSaving ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> Saving...</>
              ) : 'Save Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        title="Confirm Deletion"
        maxWidth="max-w-sm"
      >
        {deleteError && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
            {deleteError}
          </div>
        )}
        <p className="text-gray-500 mb-6">
          Are you sure you want to delete this question? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={() => setQuestionToDelete(null)}
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

export default AdminQuestions;
