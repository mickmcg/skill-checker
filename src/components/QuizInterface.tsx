import React, { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowRight, Clock, AlertCircle } from "lucide-react";
import QuestionDisplay from "./QuestionDisplay";
import AnswerOptions from "./AnswerOptions";
import ProgressBar from "./ProgressBar";

interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  image?: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
}

interface QuizInterfaceProps {
  questions?: Question[];
  timeLimit?: number; // in seconds
  onComplete?: (score: number, timeSpent: number) => void;
  showFeedback?: boolean;
}

const QuizInterface = ({
  questions = [
    {
      id: "q1",
      text: "What is the capital city of France?",
      category: "Geography",
      difficulty: "easy" as const,
      options: [
        { id: "a1", text: "Paris", isCorrect: true },
        { id: "a2", text: "London", isCorrect: false },
        { id: "a3", text: "Berlin", isCorrect: false },
        { id: "a4", text: "Madrid", isCorrect: false },
      ],
    },
    {
      id: "q2",
      text: "Which planet is known as the Red Planet?",
      category: "Astronomy",
      difficulty: "medium" as const,
      options: [
        { id: "a1", text: "Venus", isCorrect: false },
        { id: "a2", text: "Mars", isCorrect: true },
        { id: "a3", text: "Jupiter", isCorrect: false },
        { id: "a4", text: "Saturn", isCorrect: false },
      ],
    },
    {
      id: "q3",
      text: "What is the chemical symbol for gold?",
      category: "Chemistry",
      difficulty: "medium" as const,
      options: [
        { id: "a1", text: "Go", isCorrect: false },
        { id: "a2", text: "Gd", isCorrect: false },
        { id: "a3", text: "Au", isCorrect: true },
        { id: "a4", text: "Ag", isCorrect: false },
      ],
    },
  ],
  timeLimit = 120,
  onComplete = () => {},
  showFeedback = false, // Changed default to false to disable immediate feedback
}: QuizInterfaceProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (quizCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleQuizComplete();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizCompleted]);

  const handleAnswerSelected = (optionId: string, isCorrect: boolean) => {
    setSelectedAnswerId(optionId);

    // Record the answer without showing feedback
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    // Automatically move to next question after a short delay
    setTimeout(() => {
      moveToNextQuestion();
    }, 300);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswerId(null);
      setShowingFeedback(false);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = () => {
    setQuizCompleted(true);
    onComplete(score, timeSpent);
  };

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
              <Button
                className="px-6 py-2"
                onClick={() => onComplete(score, timeSpent)}
              >
                View Results Summary
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Progress and Timer */}
        <ProgressBar
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          timeRemaining={timeRemaining}
          totalTime={timeLimit}
          showTimer={true}
        />

        {/* Question Display */}
        <QuestionDisplay
          question={currentQuestion.text}
          category={currentQuestion.category}
          difficulty={currentQuestion.difficulty}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={questions.length}
          image={currentQuestion.image}
        />

        {/* Answer Options */}
        <AnswerOptions
          options={currentQuestion.options}
          onAnswerSelected={handleAnswerSelected}
          showFeedback={showingFeedback}
          selectedAnswerId={selectedAnswerId}
          disabled={showingFeedback}
        />

        {/* Next Button removed as we auto-advance */}

        {/* Time Warning */}
        {timeRemaining < timeLimit * 0.25 && !showingFeedback && (
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
