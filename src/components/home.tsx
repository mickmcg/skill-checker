import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// Removed import { getMockQuestions } from "./MockQuizData";
import Header from './Header';
import TopicSelector from './TopicSelector'; // Renamed import
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

  const handleTopicSelect = (topic: string) => { // Renamed handler and parameter
    // Set initial settings with the selected topic and navigate
    const initialSettings: QuizSettingsType = {
      topic: topic, // Renamed field
      // category will be set in QuizSettings
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
    // Removed p-4 from the main wrapper to allow header to touch edges
    <div className="min-h-screen bg-background space-y-4"> {/* Replaced bg-gray-50 with bg-background */}
      <Header activePage="home" />
      {/* Removed flex-1 from main, space-y handles spacing */}
      {/* Added padding here to keep content spaced from edges, except header */}
      <main className="p-4">
        {/* Removed container, mx-auto, px-4, py-8 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className=""
        >
          {/* Changed to max-w-7xl for consistency */}
          <div className="max-w-7xl mx-auto text-center mb-12">
            {/* Use theme-aware text color */}
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Welcome to Skill Checker
            </h1>
            {/* Use theme-aware text color */}
            <p className="text-xl text-muted-foreground">
              Test your knowledge with AI-generated quizzes on IT subjects.
              Select a topic below to get started.
            </p>
            {user && (
              <p className="mt-2 text-primary font-medium">
                Hello, {user.email}! Your progress will be saved.
              </p>
            )}
          </div>
          <TopicSelector onTopicSelect={handleTopicSelect} /> {/* Renamed component and prop */}
        </motion.div>
      </main>
      {/* Removed footer for consistency with other screens */}
    </div>
  );
};

export default Home;
