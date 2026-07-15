import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get('/api/tests/results');
      setResults(response.data.results);
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        My Test Results
      </h2>

      {results.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            You haven't taken any tests yet.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            Take a Test
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {result.subject_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(result.completed_at).toLocaleDateString()} at{' '}
                    {new Date(result.completed_at).toLocaleTimeString()}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-500">{result.score}%</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold">
                      <span className="text-green-600">{result.correct_answers}</span>
                      <span className="text-gray-400">/</span>
                      <span className="text-red-600">{result.wrong_answers}</span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Correct/Wrong</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {Math.floor(result.time_taken / 60)}m {result.time_taken % 60}s
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">Time</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;