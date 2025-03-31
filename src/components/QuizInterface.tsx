import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ArrowRight, Clock, AlertCircle, Loader2, XCircle } from 'lucide-react'; // Added Loader2, XCircle
import QuestionDisplay from './QuestionDisplay';
import AnswerOptions from './AnswerOptions';
import ProgressBar from './ProgressBar';
import { useQuiz } from '../context/QuizContext'; // Import the context hook

// Keep the Question interface if it matches the structure from context
interface Question {
  id: string; // Assuming questions from context have an id
  text: string;
  category?: string; // Make optional if not always present
  difficulty?: 'easy' | 'medium' | 'hard'; // Make optional
  image?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string; // Add explanation if provided by context/API
}

// Remove QuizInterfaceProps

const QuizInterface = () => { // Removed default questions from props destructuring
  const navigate = useNavigate();
  const {
    quizQuestions,
    quizSettings,
    isGeneratingQuestions,
    questionError,
    clearQuizData,
    setQuizResults, // Get the results setter from context
  } = useQuiz();

  // Local state for quiz progression
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(quizSettings?.timeLimit || 30); // Initialize with context timeLimit or default
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [timerActive, setTimerActive] = useState(false); // Start timer only when questions are ready
  const [userAnswers, setUserAnswers] = useState<Record<string, string | null>>({}); // Track user answers { [questionId]: optionId | null }
  const [isReadyToComplete, setIsReadyToComplete] = useState(false); // Re-add flag

  // Extracted questions and settings from context
  const questions = quizQuestions as Question[]; // Cast if necessary, ensure type safety
  const timeLimit = quizSettings?.timeLimit || 30; // Default if not set

  // Effect to initialize timer and time remaining when questions/settings are ready
  useEffect(() => {
    if (questions && questions.length > 0 && quizSettings) {
      setTimeRemaining(quizSettings.timeLimit);
      setTimerActive(true); // Start the timer
      setCurrentQuestionIndex(0); // Reset index
      setScore(0); // Reset score
      setTimeSpent(0); // Reset time spent
      setQuizCompleted(false); // Reset completion status
      setSelectedAnswerId(null);
      setUserAnswers({}); // Reset answers
      setIsReadyToComplete(false); // Reset flag
    }
  }, [questions, quizSettings]); // Rerun when questions or settings change

  // Wrap in useCallback and add dependencies
  // Define handleQuizComplete BEFORE the effects that use it
  const handleQuizComplete = useCallback(() => {
    // Ensure we capture the very last selected answer if completion happens immediately
    const lastQuestionId = questions[currentQuestionIndex]?.id;
    const finalAnswers = {
        ...userAnswers,
        // Use selectedAnswerId state which holds the last clicked ID
        ...(lastQuestionId && selectedAnswerId ? { [lastQuestionId]: selectedAnswerId } : {})
    };

    // Prevent multiple completions
    if (quizCompleted) return;

    setTimerActive(false);
    setQuizCompleted(true);
     console.log(`Quiz Complete! Score: ${score}, Time: ${timeSpent}`);

    // Prepare questions data using the finalAnswers
    const questionsWithAnswers = questions.map(q => {
      const selectedOptionId = finalAnswers[q.id] ?? null;
      console.log(`Preparing QID: ${q.id}, Selected Option ID: ${selectedOptionId}, Options Available:`, q.options.map(o => o.id));
      const selectedOption = q.options.find(opt => opt.id === selectedOptionId);
      const correctAnswerOption = q.options.find(opt => opt.isCorrect);
      console.log(` -> Found selectedOption object:`, selectedOption);

       return {
         id: q.id,
         question: q.text,
         options: q.options.map(opt => opt.text),
         correctAnswer: correctAnswerOption?.text ?? 'N/A',
         userAnswer: selectedOption?.text ?? null,
       };
     });

     setQuizResults(score, questions.length, timeSpent, questionsWithAnswers);
     navigate('/results');
   }, [score, timeSpent, questions, setQuizResults, navigate, userAnswers, selectedAnswerId, currentQuestionIndex, quizCompleted]); // Add quizCompleted dependency

  // Timer effect
  useEffect(() => {
    if (!timerActive || quizCompleted || !quizSettings) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizComplete(); // Call without arguments
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timerActive, quizCompleted, quizSettings, handleQuizComplete]);

  // Effect to trigger completion after the final answer state is set
  useEffect(() => {
    // Only run if the flag is set and quiz isn't already completed
    if (isReadyToComplete && !quizCompleted) {
      console.log("Completion effect triggered. Calling handleQuizComplete.");
      handleQuizComplete();
      setIsReadyToComplete(false); // Reset the flag
    }
  }, [isReadyToComplete, handleQuizComplete, quizCompleted]); // Dependencies for this effect

  const handleAnswerSelected = (optionId: string, isCorrect: boolean) => {
    if (quizCompleted || selectedAnswerId) return;

    setSelectedAnswerId(optionId);
    setTimerActive(false);

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    const currentQuestionId = questions[currentQuestionIndex]?.id;
    if (currentQuestionId) {
      // Update userAnswers state
      setUserAnswers(prev => ({ ...prev, [currentQuestionId]: optionId }));

      const isLastQuestion = currentQuestionIndex === questions.length - 1;

      if (isLastQuestion) {
        // Set the flag to trigger completion effect AFTER state update is processed
        console.log("Last question answered. Setting isReadyToComplete flag.");
        setIsReadyToComplete(true);
      } else {
        // If not the last question, move after a delay
        setTimeout(() => {
          moveToNextQuestion();
        }, 500);
      }
    } else {
       // Fallback if currentQuestionId is null
       console.warn("Could not get currentQuestionId in handleAnswerSelected");
       if (currentQuestionIndex < questions.length - 1) {
         setTimeout(() => { moveToNextQuestion(); }, 500);
       } else {
         handleQuizComplete(); // Complete as fallback
       }
    }
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setTimeRemaining(timeLimit);
      setTimerActive(true);
    }
    // Completion handled by the effect
  };

  // --- Render Logic ---

  // 1. Handle Loading State
  if (isGeneratingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-gray-600">Generating your quiz...</p>
      </div>
    );
  }

  // 2. Handle Error State
  if (questionError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
        <XCircle className="h-12 w-12 text-red-500 mb-4" />
        <p className="text-lg font-medium text-red-600 mb-2">Error Generating Quiz</p>
        <p className="text-gray-700 text-center mb-4">{questionError}</p>
        <Button onClick={() => navigate('/quiz-settings')}>Try Again</Button>
      </div>
    );
  }

  // 3. Handle No Questions/Settings (e.g., direct navigation)
  if (!questions || questions.length === 0 || !quizSettings) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-lg text-gray-600 mb-4">No quiz loaded.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  // 4. Render Quiz Interface (if loading/error/no questions checks pass)
  const currentQuestion = questions[currentQuestionIndex];

  // This completion logic inside render might be redundant if handleQuizComplete navigates
  // Keeping it temporarily as a fallback display before navigation occurs.
  if (quizCompleted) {
     return (
       <div className="flex flex-col items-center justify-center h-full w-full bg-gray-50 p-6">
         <Card className="w-full max-w-3xl bg-white shadow-md">
           <CardContent className="p-8">
             <div className="text-center">
               <h2 className="text-2xl font-bold text-gray-800 mb-4">
                 Quiz Completed!
               </h2>
               <p className="text-lg text-gray-600 mb-6">
                 Your score: {score} out of {questions.length}
               </p>
               <p className="text-md text-gray-500 mb-8">
                 Time spent: {Math.floor(timeSpent / 60)}:
                 {(timeSpent % 60).toString().padStart(2, "0")}
               </p>
               {/* Button might navigate to a dedicated results page */}
               <Button
                 className="px-6 py-2"
                 onClick={() => navigate('/')} // Navigate home or to results
               >
                 Go Home
               </Button>
             </div>
           </CardContent>
         </Card>
       </div>
     );
   }


  // Ensure currentQuestion is valid before rendering
   if (!currentQuestion) {
     // This case should ideally not be reached if questions array is validated
     console.error("Error: currentQuestion is undefined at index", currentQuestionIndex);
     return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-lg text-red-600">An error occurred loading the question.</p>
            <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
     );
   }


  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Consider adding Header here if needed */}
      {/* <Header /> */}
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <ProgressBar
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          timeRemaining={timeRemaining}
          totalTime={timeLimit} // Use timeLimit from context/state
          showTimer={true}
        />

        <QuestionDisplay
          question={currentQuestion.text}
          // Ensure these properties exist on your question object from context
          category={currentQuestion.category || 'General'}
          difficulty={currentQuestion.difficulty || 'medium'}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          image={currentQuestion.image}
        />

        <AnswerOptions
          options={currentQuestion.options}
          onAnswerSelected={handleAnswerSelected}
          showFeedback={false} // Feedback logic might need adjustment based on requirements
          selectedAnswerId={selectedAnswerId}
          disabled={!!selectedAnswerId} // Disable after selection
        />

        {/* Time Warning */}
        {timeRemaining < timeLimit * 0.25 && !selectedAnswerId && (
          <div className="flex items-center justify-center mt-4 text-red-500">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Time is running out!</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizInterface;
