import React from "react";
import { Trophy, Award, Star } from "lucide-react";

interface ScoreDisplayProps {
  score: number;
  totalQuestions: number;
  timeTaken?: number; // in seconds
  subject?: string;
}

const ScoreDisplay = ({
  score = 7,
  totalQuestions = 10,
  timeTaken = 120,
  subject = "JavaScript",
}: ScoreDisplayProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  // Determine badge based on score percentage
  const getBadge = () => {
    if (percentage >= 90)
      return {
        icon: <Trophy className="h-6 w-6 text-yellow-500" />,
        text: "Expert",
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
      };
    if (percentage >= 70)
      return {
        icon: <Award className="h-6 w-6 text-blue-500" />,
        text: "Proficient",
        color: "bg-blue-100 text-blue-800 border-blue-300",
      };
    if (percentage >= 50)
      return {
        icon: <Star className="h-6 w-6 text-green-500" />,
        text: "Intermediate",
        color: "bg-green-100 text-green-800 border-green-300",
      };
    return {
      icon: <Star className="h-6 w-6 text-gray-500" />,
      text: "Beginner",
      color: "bg-gray-100 text-gray-800 border-gray-300",
    };
  };

  const badge = getBadge();

  // Format time taken
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 rounded-lg shadow-md bg-white border border-gray-200">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Score</h2>
        <p className="text-gray-600 text-sm">{subject} Quiz Results</p>
      </div>

      <div className="flex justify-center items-center mb-6">
        <div className="relative w-36 h-36 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              className="text-gray-200"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className="text-primary"
              strokeWidth="8"
              strokeDasharray={`${percentage * 2.51} 251.2`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-gray-800">
              {percentage}%
            </span>
            <span className="text-sm text-gray-600">
              {score}/{totalQuestions}
            </span>
          </div>
        </div>
      </div>


    </div>
  );
};

export default ScoreDisplay;
