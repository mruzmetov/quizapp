import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Home = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [questionCount, setQuestionCount] = useState(30);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const questionCountOptions = [10, 20, 30, 50, 100];

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('/api/subjects');
      setSubjects(response.data.subjects);
    } catch (error) {
      toast.error('Failed to load subjects');
    } finally {
      setLoading(false);
    }
  };

  const startTest = () => {
    if (!isAuthenticated) {
      toast.error('Please login or register to start the test');
      navigate('/login');
      return;
    }

    if (!selectedSubject) {
      toast.error('Please select a subject first');
      return;
    }

    navigate(`/test/${selectedSubject}?count=${questionCount}`);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to Test Platform
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Test your knowledge with our comprehensive question bank. Choose a subject and start learning!
        </p>
      </div>

      {/* Subject Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Select a Subject
        </h2>
        
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : subjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No subjects available yet. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                onClick={() => setSelectedSubject(subject.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedSubject === subject.id
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
                }`}
              >
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {subject.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subject.description || 'No description available'}
                </p>
                <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {subject.question_count || 0} questions available
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ Question Count Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Number of Questions
        </h3>
        <div className="flex flex-wrap gap-3">
          {questionCountOptions.map((count) => (
            <button
              key={count}
              onClick={() => setQuestionCount(count)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                questionCount === count
                  ? 'bg-primary-500 text-white shadow-lg scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Selected: <span className="font-semibold text-primary-500">{questionCount}</span> questions
        </p>
      </div>

      {/* Start Test Button */}
      <div className="text-center">
        <button
          onClick={startTest}
          disabled={!selectedSubject}
          className={`px-8 py-4 text-lg font-semibold rounded-lg transition-all ${
            selectedSubject
              ? 'bg-primary-500 text-white hover:bg-primary-600 transform hover:scale-105'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Start Test
        </button>
        {!selectedSubject && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Please select a subject to start the test
          </p>
        )}
        {!isAuthenticated && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            You need to login or register to start the test
          </p>
        )}
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Multiple Subjects
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Choose from various subjects with hundreds of questions
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="text-4xl mb-3">⚡</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Instant Feedback
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Get immediate results with correct answers highlighted
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Track Progress
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            View your test history and performance analytics
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;