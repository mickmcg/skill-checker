import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Removed import { getMockQuestions } from "./MockQuizData";
import Header from './Header';
import SubjectSelector from './SubjectSelector';
import { useAuth } from '../context/AuthContext';
import { useQuiz, QuizSettingsType } from '../context/QuizContext'; // Import context hook and type
import { getUserQuizHistory } from '../lib/quiz-history'; // Keep history related imports
import { QuizHistoryItem } from '../lib/quiz-history';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setQuizSettings, clearQuizData } = useQuiz(); // Use context setters

  // History state remains local to Home or could be moved to its own context/component
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Clear quiz data when navigating back to home
  useEffect(() => {
    clearQuizData();
  }, [clearQuizData]);


  // Fetch user's quiz history when they log in or component mounts if user exists
  useEffect(() => {
    if (user) {
      fetchUserHistory();
    } else {
      // Clear history if user logs out
      setQuizHistory([]);
    }
  }, [user]);

  const fetchUserHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const history = await getUserQuizHistory(user.id);
      setQuizHistory(history);
    } catch (error) {
      console.error('Error fetching quiz history:', error);
      // Handle error display if needed
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubjectSelect = (subject: string) => {
    // Set initial settings with the selected subject and navigate
    const initialSettings: QuizSettingsType = {
      subject: subject,
      difficulty: 'medium', // Default difficulty
      numberOfQuestions: 1, // Set default number of questions to 1 here
      timeLimit: 30, // Default time limit
    };
    setQuizSettings(initialSettings);
    navigate('/quiz-settings');
  };

  // Memoize handleViewHistory to prevent unnecessary re-renders
  const handleViewHistory = useCallback(() => {
    if (!user) {
      navigate('/login'); // Navigate to login if not authenticated
    } else {
      // fetchUserHistory(); // Consider if fetching here is needed or handled by HistorySection
      navigate('/history'); // Navigate to history page
    }
  }, [user, navigate]); // Add dependencies

  // The Home component now only renders the subject selection part
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header might be part of a main layout in App.tsx */}
      <Header activePage="home" /> {/* Remove onViewHistory prop */}
      <main className="flex-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <div className="max-w-4xl mx-auto text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Skill Checker
            </h1>
            <p className="text-xl text-gray-600">
              Test your knowledge with AI-generated quizzes on any subject.
              Select a topic below to get started.
            </p>
            {user && (
              <p className="mt-2 text-primary font-medium">
                Hello, {user.email}! Your progress will be saved.
              </p>
            )}
          </div>
          <SubjectSelector onSubjectSelect={handleSubjectSelect} />
        </motion.div>
      </main>
      {/* Footer might be part of a main layout in App.tsx */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            © 2025 Skill Checker - Test your knowledge with AI-generated
            quizzes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
