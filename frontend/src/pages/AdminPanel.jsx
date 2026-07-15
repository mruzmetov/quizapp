import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminPanel = () => {

  // ✅ Edit uchun yangi state'lar
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });
  const [questionForm, setQuestionForm] = useState({
    subject_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A'
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      console.log('Fetching subjects...');
      const response = await axios.get('/api/subjects');
      console.log('Subjects response:', response.data);
      setSubjects(response.data.subjects || []);
    } catch (error) {
      console.error('Fetch subjects error:', error);
      toast.error('Failed to load subjects');
    }
  };

  const fetchQuestions = async (subjectId) => {
    try {
      console.log('Fetching questions for subject:', subjectId);
      const response = await axios.get(`/api/questions/subject/${subjectId}`);
      console.log('Questions response:', response.data);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Fetch questions error:', error);
      toast.error('Failed to load questions');
    }
  };

  const handleSubjectSelect = (subjectId) => {
    console.log('Selected subject:', subjectId);
    setSelectedSubject(subjectId);
    setQuestionForm(prev => ({
      ...prev,
      subject_id: subjectId
    }));
    fetchQuestions(subjectId);
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Creating subject:', subjectForm);
      await axios.post('/api/subjects', subjectForm);
      toast.success('Subject created successfully');
      setShowSubjectForm(false);
      setSubjectForm({ name: '', description: '' });
      await fetchSubjects();
    } catch (error) {
      console.error('Create subject error:', error);
      toast.error(error.response?.data?.error || 'Failed to create subject');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const questionData = {
        ...questionForm,
        subject_id: parseInt(questionForm.subject_id)
      };
      
      console.log('Submitting question:', questionData);
      
      const response = await axios.post('/api/questions', questionData);
      console.log('Question created:', response.data);
      
      toast.success('Question added successfully');
      setShowQuestionForm(false);
      setQuestionForm({
        subject_id: selectedSubject || '',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A'
      });
      
      // ✅ Refresh questions
      if (selectedSubject) {
        await fetchQuestions(selectedSubject);
      }
    } catch (error) {
      console.error('Add question error:', error);
      toast.error(error.response?.data?.error || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    
    try {
      console.log('Deleting question:', questionId);
      await axios.delete(`/api/questions/${questionId}`);
      toast.success('Question deleted successfully');
      if (selectedSubject) {
        await fetchQuestions(selectedSubject);
      }
    } catch (error) {
      console.error('Delete question error:', error);
      toast.error('Failed to delete question');
    }
  };


  // ✅ Edit formani ochish
  const handleEditClick = (question) => {
    setEditingQuestion(question);
    setEditForm({
      id: question.id,
      question_text: question.question_text || '',
      option_a: question.option_a || '',
      option_b: question.option_b || '',
      option_c: question.option_c || '',
      option_d: question.option_d || '',
      correct_answer: question.correct_answer || 'A'
    });
    setShowEditForm(true);
  };

  // ✅ Edit form state
  const [editForm, setEditForm] = useState({
    id: null,
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: 'A'
  });

  // ✅ Edit formani yuborish
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Updating question:', editForm);
      
      const response = await axios.put(`/api/questions/${editForm.id}`, editForm);
      console.log('Question updated:', response.data);
      
      toast.success('Question updated successfully');
      setShowEditForm(false);
      setEditingQuestion(null);
      setEditForm({
        id: null,
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_answer: 'A'
      });
      
      // Refresh questions
      if (selectedSubject) {
        await fetchQuestions(selectedSubject);
      }
    } catch (error) {
      console.error('Update question error:', error);
      toast.error(error.response?.data?.error || 'Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Edit formani bekor qilish
  const handleEditCancel = () => {
    setShowEditForm(false);
    setEditingQuestion(null);
    setEditForm({
      id: null,
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: 'A'
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Admin Panel
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subjects Section */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subjects</h3>
              <button
                onClick={() => setShowSubjectForm(!showSubjectForm)}
                className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
              >
                + Add
              </button>
            </div>

            {showSubjectForm && (
              <form onSubmit={handleSubjectSubmit} className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input
                  type="text"
                  placeholder="Subject name"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                  rows="2"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Subject'}
                </button>
              </form>
            )}

            <div className="space-y-2">
              {subjects.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No subjects yet</p>
              ) : (
                subjects.map((subject) => (
                  <button
                    key={subject.id}
                    onClick={() => handleSubjectSelect(subject.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedSubject === subject.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="font-medium">{subject.name}</div>
                    <div className="text-xs opacity-75">{subject.question_count || 0} questions</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Questions {selectedSubject ? `(${questions.length})` : ''}
              </h3>
              {selectedSubject && (
                <button
                  onClick={() => {
                    setShowQuestionForm(!showQuestionForm);
                    if (!showQuestionForm) {
                      setQuestionForm(prev => ({
                        ...prev,
                        subject_id: selectedSubject
                      }));
                    }
                  }}
                  className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
                >
                  + Add Question
                </button>
              )}
            </div>

            {/* ✅ Edit Form */}
            {showEditForm && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 rounded-lg">
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  ✏️ Edit Question
                </h4>
                <form onSubmit={handleEditSubmit}>
                  <input
                    type="text"
                    placeholder="Question text"
                    value={editForm.question_text}
                    onChange={(e) => setEditForm({ ...editForm, question_text: e.target.value })}
                    className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             dark:bg-gray-800 dark:text-white"
                    required
                  />
                  <div className="grid grid-cols-2 gap-2">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                      <input
                        key={opt}
                        type="text"
                        placeholder={`Option ${opt}`}
                        value={editForm[`option_${opt.toLowerCase()}`]}
                        onChange={(e) => setEditForm({ 
                          ...editForm, 
                          [`option_${opt.toLowerCase()}`]: e.target.value 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 dark:bg-gray-800 dark:text-white"
                        required
                      />
                    ))}
                  </div>
                  <div className="mt-2">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Correct Answer</label>
                    <select
                      value={editForm.correct_answer}
                      onChange={(e) => setEditForm({ ...editForm, correct_answer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               dark:bg-gray-800 dark:text-white"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Question'}
                    </button>
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="flex-1 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}


            {!selectedSubject && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                Select a subject to view its questions
              </p>
            )}

            {showQuestionForm && selectedSubject && (
              <form onSubmit={handleQuestionSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Adding question to: <span className="font-semibold">
                    {subjects.find(s => s.id === selectedSubject)?.name || 'Unknown'}
                  </span>
                </div>
                
                <input
                  type="text"
                  placeholder="Question text"
                  value={questionForm.question_text}
                  onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           dark:bg-gray-800 dark:text-white"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  {['A', 'B', 'C', 'D'].map((opt) => (
                    <input
                      key={opt}
                      type="text"
                      placeholder={`Option ${opt}`}
                      value={questionForm[`option_${opt.toLowerCase()}`]}
                      onChange={(e) => setQuestionForm({ 
                        ...questionForm, 
                        [`option_${opt.toLowerCase()}`]: e.target.value 
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               dark:bg-gray-800 dark:text-white"
                      required
                    />
                  ))}
                </div>
                <div className="mt-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Correct Answer</label>
                  <select
                    value={questionForm.correct_answer}
                    onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             dark:bg-gray-800 dark:text-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Question'}
                </button>
              </form>
            )}

            {selectedSubject && questions.length === 0 && !showQuestionForm && (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No questions found for this subject. Add your first question!
              </p>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {questions.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No questions</p>
              ) : (
                questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg flex justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {index + 1}. {q.question_text || 'No question text'}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {['A', 'B', 'C', 'D'].map(opt => {
                          const optKey = `option_${opt.toLowerCase()}`;
                          return (
                            <span key={opt} className={`mr-2 ${q.correct_answer === opt ? 'text-green-600 font-bold' : ''}`}>
                              {opt}: {q[optKey] || 'N/A'}
                              {q.correct_answer === opt && ' ✓'}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {/* ✅ Edit tugmasi */}
                        <button
                          onClick={() => handleEditClick(q)}
                          className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id)}
                      className="ml-4 text-red-500 hover:text-red-700 text-sm"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;