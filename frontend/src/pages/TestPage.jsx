import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TestPage = () => {
  const { subjectId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [searchParams] = useSearchParams(); // ✅ URL dan parametr olish
  const questionCount = parseInt(searchParams.get('count')) || 30; // ✅ Savol soni

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  const timePerQuestion = 60; // 1 daqiqa
  const [timeLeft, setTimeLeft] = useState(questionCount * timePerQuestion);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [subjectId, questionCount]);

  const fetchQuestions = async () => {
    try {
      console.log(`Fetching ${questionCount} questions for subject:`, subjectId);
      const response = await axios.get(`/api/questions/random/${subjectId}?count=${questionCount}`);
      console.log('Response:', response.data);
      
      if (!response.data || !response.data.questions) {
        toast.error('No questions found for this subject');
        navigate('/');
        return;
      }
      
      const questionList = response.data.questions;
      
      if (questionList.length < questionCount) {
        toast.error(`Only ${questionList.length} questions available. Need at least ${questionCount}.`);
        navigate('/');
        return;
      }
      
      const validQuestions = questionList.filter(q => q.question_text);
      if (validQuestions.length < questionCount) {
        toast.error('Some questions are invalid. Please check admin panel.');
        navigate('/');
        return;
      }
      
      setQuestions(validQuestions);
      setAnswers(new Array(validQuestions.length).fill(null));
    } catch (error) {
      console.error('Fetch questions error:', error);
      toast.error(error.response?.data?.error || 'Failed to load questions');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selectedOption) => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedOption;
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        handleSubmitTest();
      }
    }, 500);
  };

  const handleSubmitTest = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
    
    // ✅ FIX: Faqat javob berilgan savollarni yuborish
    const answerData = questions.map((q, index) => ({
      questionId: q.id,
      selectedOption: answers[index] || null
    }));

    try {
      const response = await axios.post('/api/tests/submit', {
        subjectId: parseInt(subjectId),
        answers: answerData,
        timeTaken
      });

      setResultData(response.data.result);
      setShowResult(true);
      toast.success('Test submitted successfully!');
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.error || 'Failed to submit test');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (showResult && resultData) {
    return <TestResult result={resultData} questions={questions} answers={answers} />;
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">No Questions Available</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2">This subject doesn't have enough questions.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  // ✅ FIX: currentQuestion undefined bo'lsa
  if (!currentQuestion) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Loading question...</p>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>Time Left: {formatTime(timeLeft)}</span>
          <span>Questions: {questions.length}</span> {/* ✅ Savol soni ko'rsatish */}
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {currentQuestion.question_text || 'Question text not available'}
        </h3>

        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map((option) => {
            const optionKey = `option_${option.toLowerCase()}`;
            const optionText = currentQuestion[optionKey];
            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all
                  ${answers[currentIndex] === option 
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600'
                  }`}
                disabled={answers[currentIndex] !== null}
              >
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  {option}.
                </span>
                <span className="ml-2 text-gray-800 dark:text-gray-200">
                  {optionText || 'Option not available'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                   rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleSubmitTest}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Submit Test
        </button>
      </div>
    </div>
  );
};

// TestResult Component
const TestResult = ({ result, questions, answers }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
          Test Results
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-primary-500">{result.totalQuestions || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-500">{result.correctAnswers || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{result.wrongAnswers || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Wrong</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">{result.score || 0}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          Time Taken: {Math.floor((result.timeTaken || 0) / 60)} minutes {(result.timeTaken || 0) % 60} seconds
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                   rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mb-4"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>

        {showDetails && questions && questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((q, index) => {
              const userAnswer = answers && answers[index];
              const isCorrect = userAnswer === q.correct_answer;
              
              return (
                <div key={q.id || index} className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${
                      isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Question {index + 1}</span>
                  </div>
                  <p className="text-gray-900 dark:text-white mb-2">{q.question_text || 'No question text'}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-600 dark:text-gray-400">
                      Your Answer: <span className={`font-semibold ${
                        isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>{userAnswer || 'Not answered'}</span>
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Correct Answer: <span className="font-semibold text-green-600">{q.correct_answer || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Back to Home
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                   rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Retry Test
        </button>
      </div>
    </div>
  );
};

export default TestPage;