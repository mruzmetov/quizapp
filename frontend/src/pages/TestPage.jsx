import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

const TestPage = () => {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const questionCount = parseInt(searchParams.get('count')) || 30;

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null); // ✅ Joriy savol uchun tanlangan variant
  const [showFeedback, setShowFeedback] = useState(false); // ✅ Javobdan keyin feedback ko'rsatish
  const [isAnswered, setIsAnswered] = useState(false); // ✅ Javob berilganmi?

  const timePerQuestion = 60;
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

  // ✅ Javob berish funksiyasi - ranglar tizimi bilan
  const handleAnswer = (selectedOption) => {
    if (isAnswered) return; // ✅ Bir marta javob berilgan bo'lsa qayta bosish mumkin emas

    const currentQ = questions[currentIndex];
    const isCorrect = selectedOption === currentQ.correct_answer;

    // Javobni saqlash
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedOption;
    setAnswers(newAnswers);
    setSelectedOption(selectedOption);
    setIsAnswered(true);
    setShowFeedback(true);

    // 1.5 soniyadan keyin keyingi savolga o'tish
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        // Keyingi savolga o'tish
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsAnswered(false);
        setShowFeedback(false);
      } else {
        // Test tugadi
        handleSubmitTest();
      }
    }, 1500);
  };

  const handleSubmitTest = async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);

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
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>⏱️ Time Left: {formatTime(timeLeft)}</span>
          <span>📝 Questions: {questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-primary-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          {currentQuestion.question_text}
        </h3>

        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map((option) => {
            const optionKey = `option_${option.toLowerCase()}`;
            const optionText = currentQuestion[optionKey];
            const isSelected = selectedOption === option;
            const isCorrect = option === currentQuestion.correct_answer;
            
            // ✅ Ranglar tizimi
            let buttonClass = "w-full text-left p-4 rounded-lg border-2 transition-all duration-300 ";
            
            if (!isAnswered) {
              // Hali javob berilmagan - normal holat
              buttonClass += "border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600";
            } else if (isSelected) {
              // Tanlangan variant
              if (isCorrect) {
                buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"; // ✅ YASHIL
              } else {
                buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"; // ❌ QIZIL
              }
            } else if (isCorrect && isAnswered) {
              // To'g'ri javob (lekin foydalanuvchi tanlamagan) - YASHIL
              buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"; // ✅ YASHIL
            } else {
              // Boshqa variantlar - o'chirilgan
              buttonClass += "border-gray-200 dark:border-gray-700 opacity-50";
            }

            // ✅ Javobdan keyin o'chirish
            if (isAnswered && !isSelected && !isCorrect) {
              buttonClass += " cursor-default";
            }

            return (
              <button
                key={option}
                onClick={() => handleAnswer(option)}
                disabled={isAnswered}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {option}.
                    </span>
                    <span className="ml-2 text-gray-800 dark:text-gray-200">
                      {optionText || 'Option not available'}
                    </span>
                  </div>
                  
                  {/* ✅ Javob belgilari */}
                  {isAnswered && isSelected && (
                    <span className="text-2xl">
                      {isCorrect ? '✅' : '❌'}
                    </span>
                  )}
                  {isAnswered && !isSelected && isCorrect && (
                    <span className="text-2xl text-green-500">✅</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* ✅ Javob haqida qisqa ma'lumot */}
        {isAnswered && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            selectedOption === currentQuestion.correct_answer
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            {selectedOption === currentQuestion.correct_answer ? (
              '✅ To\'g\'ri javob!'
            ) : (
              `❌ Noto\'g\'ri. To\'g\'ri javob: ${currentQuestion.correct_answer}`
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1);
              setSelectedOption(answers[currentIndex - 1] || null);
              setIsAnswered(answers[currentIndex - 1] !== null);
              setShowFeedback(answers[currentIndex - 1] !== null);
            }
          }}
          disabled={currentIndex === 0}
          className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                   rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬅️ Previous
        </button>
        <button
          onClick={handleSubmitTest}
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          📤 Submit Test
        </button>
      </div>
    </div>
  );
};

// ============ TEST RESULT COMPONENT ============
const TestResult = ({ result, questions, answers }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  // ✅ Har bir savol uchun to'g'ri/noto'g'ri hisoblash
  const getQuestionStatus = (q, index) => {
    const userAnswer = answers[index];
    return {
      isCorrect: userAnswer === q.correct_answer,
      userAnswer: userAnswer,
      correctAnswer: q.correct_answer
    };
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-2">
          📊 Test Results
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </p>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-primary-500">{result.totalQuestions || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-500">{result.correctAnswers || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">✅ Correct</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-red-500">{result.wrongAnswers || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">❌ Wrong</div>
          </div>
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-500">{result.score || 0}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Score</div>
          </div>
        </div>

        <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          ⏱️ Time Taken: {Math.floor((result.timeTaken || 0) / 60)} minutes {(result.timeTaken || 0) % 60} seconds
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-6">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full transition-all duration-1000"
            style={{ width: `${result.score || 0}%` }}
          ></div>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                   rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors mb-4"
        >
          {showDetails ? '🔽 Hide Details' : '▶️ Show Details'}
        </button>

        {/* Details */}
        {showDetails && questions && questions.length > 0 && (
          <div className="space-y-4">
            {questions.map((q, index) => {
              const status = getQuestionStatus(q, index);
              
              return (
                <div
                  key={q.id || index}
                  className={`p-4 rounded-lg border-2 ${
                    status.isCorrect
                      ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                      : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">
                      {status.isCorrect ? '✅' : '❌'}
                    </span>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Question {index + 1}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      status.isCorrect
                        ? 'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-300'
                        : 'bg-red-200 dark:bg-red-800 text-red-700 dark:text-red-300'
                    }`}>
                      {status.isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                  </div>
                  
                  <p className="text-gray-900 dark:text-white mb-2">
                    {q.question_text || 'No question text'}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={`font-semibold ${
                      status.isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      Your Answer: {status.userAnswer || 'Not answered'}
                    </div>
                    <div className="font-semibold text-green-600">
                      Correct Answer: {status.correctAnswer || 'N/A'}
                    </div>
                  </div>
                  
                  {/* Variantlar */}
                  <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    {['A', 'B', 'C', 'D'].map(opt => {
                      const optKey = `option_${opt.toLowerCase()}`;
                      return (
                        <span key={opt} className={`mr-3 ${
                          opt === q.correct_answer ? 'text-green-600 font-bold' : ''
                        } ${opt === status.userAnswer && opt !== q.correct_answer ? 'text-red-600 line-through' : ''}`}>
                          {opt}: {q[optKey] || 'N/A'}
                          {opt === q.correct_answer && ' ✓'}
                          {opt === status.userAnswer && opt !== q.correct_answer && ' ✗'}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-center gap-4 flex-wrap">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          🏠 Back to Home
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 
                   rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          🔄 Retry Test
        </button>
        <button
          onClick={() => navigate('/results')}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          📊 My Results
        </button>
      </div>
    </div>
  );
};

export default TestPage;