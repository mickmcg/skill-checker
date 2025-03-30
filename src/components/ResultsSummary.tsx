import React from "react";
import ScoreDisplay from "./ScoreDisplay";
import PerformanceMetrics from "./PerformanceMetrics";
import ActionButtons from "./ActionButtons";
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { Share2, Download, FileSearch, LogIn } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";

interface ResultsSummaryProps {
  score?: number;
  totalQuestions?: number;
  timeTaken?: number; // in seconds
  subject?: string;
  correctAnswers?: number;
  averageResponseTime?: string;
  subjectStrengths?: Array<{ subject: string; score: number }>;
  subjectWeaknesses?: Array<{ subject: string; score: number }>;
  onRetry?: () => void;
  onNewQuiz?: () => void;
  onViewHistory?: () => void;
  onReturnHome?: () => void;
}

const ResultsSummary = ({
  score = 7,
  totalQuestions = 10,
  timeTaken = 120,
  subject = "JavaScript",
  correctAnswers = 7,
  averageResponseTime = "12s",
  subjectStrengths = [
    { subject: "Functions", score: 90 },
    { subject: "Arrays", score: 85 },
  ],
  subjectWeaknesses = [
    { subject: "Closures", score: 40 },
    { subject: "Promises", score: 55 },
  ],
  onRetry = () => {},
  onNewQuiz = () => {},
  onViewHistory = () => {},
  onReturnHome = () => {},
}: ResultsSummaryProps) => {
  const { user } = useAuth();

  // Format date for the certificate/results
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
              onClick={onViewHistory}
              className="ml-2"
            >
              Log In
            </Button>
          </div>
        )}
      </div>

      <div className="flex justify-end mb-6 gap-2">
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          onClick={onViewHistory}
        >
          <FileSearch className="h-4 w-4" />
          {user ? "View History" : "Review Answers"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <Card className="bg-white shadow-sm overflow-hidden">
            <div className="p-1 bg-primary/10">
              <h2 className="text-center text-lg font-semibold text-primary">
                Score Summary
              </h2>
            </div>
            <div className="p-4">
              <ScoreDisplay
                score={score}
                totalQuestions={totalQuestions}
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
              <PerformanceMetrics
                timeSpent={`${Math.floor(timeTaken / 60)}:${(timeTaken % 60).toString().padStart(2, "0")}`}
                correctAnswers={correctAnswers}
                totalQuestions={totalQuestions}
                averageResponseTime={averageResponseTime}
                subjectStrengths={subjectStrengths}
                subjectWeaknesses={subjectWeaknesses}
              />
            </div>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="mb-8">
        <Card className="bg-white shadow-sm overflow-hidden">
          <div className="p-1 bg-primary/10">
            <h2 className="text-center text-lg font-semibold text-primary">
              Next Steps
            </h2>
          </div>
          <div className="p-4">
            <ActionButtons
              onRetry={onRetry}
              onNewQuiz={onNewQuiz}
              onViewHistory={onViewHistory}
              onReturnHome={onReturnHome}
            />
          </div>
        </Card>
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        <p>
          Thank you for using Skill Checker!{" "}
          {user ? "Your results have been saved to your history." : ""}
        </p>
        <p className="mt-1">
          Continue practicing to improve your skills in {subject}.
        </p>
      </div>
    </div>
  );
};

export default ResultsSummary;
