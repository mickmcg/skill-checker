import React, { useEffect, useRef } from 'react'; // Import useRef
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas'; // Import html2canvas
import ScoreDisplay from './ScoreDisplay';
import PerformanceMetrics from './PerformanceMetrics';
import ActionButtons from './ActionButtons';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Share2, Download, FileSearch, LogIn, AlertCircle, ListChecks } from 'lucide-react'; // Added AlertCircle and ListChecks
import { Button } from './ui/button';
import Header from './Header'; // Import Header
import { useAuth } from '../context/AuthContext';
import { useQuiz } from '../context/QuizContext'; // Import useQuiz

// Remove ResultsSummaryProps interface

const ResultsSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const resultsRef = useRef<HTMLDivElement>(null); // Ref for the container to capture
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
  const topic = quizSettings?.topic ?? 'Unknown Topic'; // Use topic field
  const category = quizSettings?.category ?? 'General'; // Also get category
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

  // Navigate to the history page for this quiz, indicating answer review view
  const handleCheckAnswers = () => {
    const destination = savedQuizId ? `/history/${savedQuizId}?view=answers` : '/history';
    const state = savedQuizId ? { from: location, targetQuizId: savedQuizId, view: 'answers' } : { from: location };

    if (!user) {
      // If not logged in, redirect to login, passing the intended destination
      navigate('/login', { state: { ...state, from: destination } });
    } else if (savedQuizId) {
      // If logged in and quiz ID exists, navigate to the specific history with view=answers
      navigate(destination);
    } else {
      // Fallback if logged in but ID is missing (e.g., save failed)
      console.warn('Saved quiz ID not found for answer review, navigating to general history.');
      navigate('/history');
    }
  };

  const handleViewHistory = () => {
    if (!user) {
      // Pass location state when navigating to login
      navigate('/login', { state: { from: location } });
    } else {
      // Always navigate to the general history page
      navigate('/history');
    }
  };

  const handleDownload = () => {
    if (resultsRef.current) {
      html2canvas(resultsRef.current, {
        // Optional: Improve quality or handle specific elements
        scale: 2, // Increase scale for better resolution
        useCORS: true, // If there are external images/resources
        backgroundColor: '#1a202c', // Match dark theme background if needed
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `skill-checker-results-${topic}-${category}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }).catch(err => {
        console.error("Error generating canvas for download:", err);
        // Optionally show an error message to the user
      });
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Skill Checker Quiz Results',
      text: `I scored ${score}/${questionsCount} on the ${topic.replace('-', ' ')} (${category}) quiz!`,
      url: window.location.href, // Share the current page URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Results shared successfully');
      } catch (err) {
        console.error('Error sharing results:', err);
        // Handle errors (e.g., user cancelled share)
      }
    } else {
      console.warn('Web Share API not supported in this browser.');
      // Fallback: Maybe copy text to clipboard or show a message
      alert('Sharing is not supported in your browser. You can copy the link manually.');
    }
  };


  const handleNewQuiz = () => { // Renamed handleReturnHome to handleNewQuiz
    clearQuizData();
    navigate('/');
  };

  // Render loading or error state if data is missing initially
   if (quizScore === null || totalQuestions === null || timeSpent === null || !quizSettings) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6"> {/* Replaced bg-gray-50 */}
         <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
         <p className="text-lg text-muted-foreground mb-4">Loading results or no results found.</p> {/* Replaced text-gray-600 */}
         <Button onClick={() => navigate('/')}>Go Home</Button>
       </div>
     );
   }

  return (
    // Removed p-4 from outer div, added to inner content div
    <div className="bg-background min-h-screen space-y-4"> {/* Replaced bg-gray-50 */}
      <Header /> {/* Added Header */}
      {/* Changed max-w-3xl to max-w-7xl for consistency, added p-4 */}
      {/* Added ref to this div */}
      <div ref={resultsRef} className="w-full max-w-7xl mx-auto space-y-6 p-4 bg-background">
        <div className="text-center"> {/* Removed mb-8, handled by parent space-y */}
          <h1 className="text-3xl font-bold text-foreground mb-2">Quiz Results</h1>
          <p className="text-muted-foreground capitalize">
            Completed on {currentDate} • {topic.replace('-', ' ')} ({category}) {/* Display topic and category */}
          </p>
        {!user && (
          <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md inline-flex items-center gap-2"> {/* Replaced blue colors */}
            <LogIn className="h-4 w-4 text-primary" /> {/* Use primary color */}
            <span className="text-sm text-primary"> {/* Use primary color */}
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
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleShare}> {/* Removed disabled, added onClick */}
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleDownload}> {/* Removed disabled, added onClick */}
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
          {user ? 'Check Answers' : 'Log In'}
        </Button>
      </div>

      {/* Score and Performance Grid */}
      {/* Removed mb-8, handled by parent space-y */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* Added h-full */}
          <Card className="bg-card shadow-sm overflow-hidden h-full">
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
                topic={`${topic.replace('-', ' ')} (${category})`} // Renamed prop, pass combined topic/category
              />
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2">
           {/* Added h-full */}
          <Card className="bg-card shadow-sm overflow-hidden h-full">
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
                topicStrengths={subjectStrengths} // Renamed prop
                topicWeaknesses={subjectWeaknesses} // Renamed prop
              />
              {/* Removed redundant Check Answers Button from here */}
            </div>
          </Card>
        </div>
      </div>

      {/* Removed my-8, handled by parent space-y */}
      <Separator />

      {/* Next Steps */}
      {/* Removed mb-8, handled by parent space-y */}
      <div>
        <Card className="bg-card shadow-sm overflow-hidden"> {/* Replaced bg-white */}
          <div className="p-1 bg-primary/10">
            <h2 className="text-center text-lg font-semibold text-primary">
              Next Steps
            </h2>
          </div>
          <div className="p-4">
            {/* Pass handlers */}
            <ActionButtons
              onRetry={handleRetry}
              onCheckAnswers={handleCheckAnswers}
              onViewHistory={handleViewHistory}
              onNewQuiz={handleNewQuiz} // Changed prop name and handler
            />
          </div>
        </Card>
      </div>
      {/* Removed footer text for consistency */}
      </div> {/* Close max-w-3xl wrapper */}
    </div> // Close top-level wrapper
  );
};

export default ResultsSummary;
