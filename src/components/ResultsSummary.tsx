import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Import useLocation
import ScoreDisplay from './ScoreDisplay';
import PerformanceMetrics from './PerformanceMetrics';
import ActionButtons from './ActionButtons';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Share2, Download, FileSearch, LogIn, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { Button } from './ui/button';
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext'; // Import useQuiz

// Remove ResultsSummaryProps interface

const ResultsSummary = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get location
  const { user } = useAuth();
  const {
    quizScore,
    totalQuestions,
    timeSpent,
    quizSettings,
    clearQuizData,
    savedQuizId, // Get the saved quiz ID from context
    // Add quizQuestions if needed for detailed answer review
  } = useQuiz();

  // Handle cases where results data might be missing (e.g., direct navigation)
  useEffect(() => {
    if (quizScore === null || totalQuestions === null || timeSpent === null || !quizSettings) {
      console.warn('Results data missing, redirecting to home.');
      // Redirect to home if essential data is missing
      // navigate('/');
    }
  }, [quizScore, totalQuestions, timeSpent, quizSettings, navigate]);

  // Provide default values or handle loading/missing state gracefully
  const score = quizScore ?? 0;
  const questionsCount = totalQuestions ?? 0;
  const timeTaken = timeSpent ?? 0;
  const subject = quizSettings?.subject ?? 'Unknown Subject';
  const correctAnswers = score; // Assuming score is the count of correct answers

  // Placeholder data for metrics - replace with actual calculations if needed
  const averageResponseTime = questionsCount > 0 ? `${(timeTaken / questionsCount).toFixed(1)}s` : 'N/A';
  const subjectStrengths = []; // Placeholder - requires analysis of questions/answers
  const subjectWeaknesses = []; // Placeholder

  // Format date for the certificate/results
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Define navigation handlers using navigate and context functions
  const handleRetry = () => {
    // Need to re-trigger question generation with the same settings
    if (quizSettings) {
      // Option 1: Navigate back to settings (simpler)
      // navigate('/quiz-settings');
      // Option 2: Re-call generateQuestions directly (might need context update)
      // generateQuestions(quizSettings); // Assuming generateQuestions is available via context
      console.warn("Retry functionality needs context update or navigation logic");
      navigate('/quiz-settings'); // Navigate back to settings for now
    } else {
      navigate('/'); // Fallback
    }
  };

  const handleNewQuiz = () => {
    clearQuizData(); // Clear context
    navigate('/'); // Navigate to home to select a new subject
  };

  const handleViewHistory = () => {
    if (!user) {
      // Pass location state when navigating to login
      navigate('/login', { state: { from: location } });
    } else if (savedQuizId) {
      navigate(`/history/${savedQuizId}`); // Navigate to specific history if ID exists
    } else {
      // Fallback if user is logged in but ID is missing (e.g., save failed)
      console.warn('Saved quiz ID not found, navigating to general history.');
      navigate('/history');
    }
  };

  const handleReturnHome = () => {
    clearQuizData();
    navigate('/');
  };

  // Render loading or error state if data is missing initially
   if (quizScore === null || totalQuestions === null || timeSpent === null || !quizSettings) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
         <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
         <p className="text-lg text-gray-600 mb-4">Loading results or no results found.</p>
         <Button onClick={() => navigate('/')}>Go Home</Button>
       </div>
     );
   }

  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quiz Results</h1>
        <p className="text-gray-600">
          Completed on {currentDate} • {subject}
        </p>
        {!user && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md inline-flex items-center gap-2">
            <LogIn className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-blue-700">
              Log in to save your results and track your progress
            </span>
            <Button
              size="sm"
              variant="outline"
              // Pass location state when navigating to login
              onClick={() => navigate('/login', { state: { from: location } })}
              className="ml-2"
            >
              Log In
            </Button>
          </div>
        )}
      </div>

      {/* Action buttons (Share, Download, History) */}
      <div className="flex justify-end mb-6 gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1" disabled> {/* Disable unimplemented */}
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1" disabled> {/* Disable unimplemented */}
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={handleViewHistory}
        >
          <FileSearch className="h-4 w-4" />
          {user ? 'View History' : 'Log In'}
        </Button>
      </div>

      {/* Score and Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-sm overflow-hidden">
            <div className="p-1 bg-primary/10">
              <h2 className="text-center text-lg font-semibold text-primary">
                Score Summary
              </h2>
            </div>
            <div className="p-4">
              {/* Pass data from context */}
              <ScoreDisplay
                score={score}
                totalQuestions={questionsCount}
                timeTaken={timeTaken}
                subject={subject}
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white shadow-sm overflow-hidden">
            <div className="p-1 bg-primary/10">
              <h2 className="text-center text-lg font-semibold text-primary">
                Performance Analysis
              </h2>
            </div>
            <div className="p-4">
              {/* Pass data from context/calculations */}
              <PerformanceMetrics
                timeSpent={`${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, '0')}`}
                correctAnswers={correctAnswers}
                totalQuestions={questionsCount}
                averageResponseTime={averageResponseTime}
                subjectStrengths={subjectStrengths} // Use placeholder or calculated data
                subjectWeaknesses={subjectWeaknesses} // Use placeholder or calculated data
              />
            </div>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Next Steps */}
      <div className="mb-8">
        <Card className="bg-white shadow-sm overflow-hidden">
          <div className="p-1 bg-primary/10">
            <h2 className="text-center text-lg font-semibold text-primary">
              Next Steps
            </h2>
          </div>
          <div className="p-4">
            {/* Pass handlers */}
            <ActionButtons
              onRetry={handleRetry}
              onNewQuiz={handleNewQuiz}
              onViewHistory={handleViewHistory}
              onReturnHome={handleReturnHome}
            />
          </div>
        </Card>
      </div>

      {/* Footer Text */}
      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          Thank you for using Skill Checker!{' '}
          {/* TODO: Add logic to save results to history via Supabase */}
          {user ? 'Your results might be saved to your history.' : ''}
        </p>
        <p className="mt-1">
          Continue practicing to improve your skills in {subject}.
        </p>
      </div>
    </div>
  );
};

export default ResultsSummary;
