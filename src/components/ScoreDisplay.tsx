import React from "react";
import { Trophy, Award, Star } from "lucide-react";
import { Badge } from "./ui/badge"; // Import Badge component

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
  // Handle division by zero and calculate percentage
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Determine color based on score percentage (>= 60% is success)
  const scoreColorClass = percentage >= 60 ? "text-success" : "text-danger";

  // Determine badge based on score percentage
  const getBadge = () => {
    if (percentage >= 90)
      return {
        icon: <Trophy className="h-4 w-4 mr-1 text-yellow-500" />, // Adjusted size and margin
        text: "Expert",
        variant: "default" as const, // Use default badge variant
      };
    if (percentage >= 70)
      return {
        icon: <Award className="h-4 w-4 mr-1 text-blue-500" />, // Adjusted size and margin
        text: "Proficient",
        variant: "default" as const,
      };
    if (percentage >= 50)
      return {
        icon: <Star className="h-4 w-4 mr-1 text-green-500" />, // Adjusted size and margin
        text: "Intermediate",
        variant: "default" as const,
      };
    return {
      icon: <Star className="h-4 w-4 mr-1 text-muted-foreground" />, // Adjusted size and margin, use theme color
      text: "Beginner",
      variant: "secondary" as const, // Use secondary variant for beginner
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
    <div className="w-full max-w-md mx-auto p-6 rounded-lg shadow-md bg-card border border-border"> {/* Replaced bg-white, border-gray-200 */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Score</h2> {/* Replaced text-gray-800 */}
        <p className="text-muted-foreground text-sm">{subject} Quiz Results</p> {/* Replaced text-gray-600 */}
      </div>

      <div className="flex flex-col items-center mb-6"> {/* Changed to flex-col for badge placement */}
        <div className="relative w-36 h-36 flex items-center justify-center mb-4"> {/* Added margin-bottom */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Use theme-aware border color for the background circle */}
            <circle
              className="text-border"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
            />
            <circle
              className={scoreColorClass} // Apply dynamic color class here
              strokeWidth="8"
              strokeDasharray={`${percentage * 2.51} 251.2`} // 2 * PI * R (40) = 251.2
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="40"
              cx="50"
              cy="50"
              transform="rotate(-90 50 50)" // Start circle from the top
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold ${scoreColorClass}`}> {/* Apply color class */}
              {percentage}%
            </span>
            <span className={`text-sm ${scoreColorClass}`}> {/* Apply color class */}
              {score}/{totalQuestions}
            </span>
          </div>
        </div>
        {/* Display Badge */}
        <Badge variant={badge.variant} className="flex items-center">
          {badge.icon}
          {badge.text}
        </Badge>
      </div>

      {/* Optional: Display time taken if provided */}
      {timeTaken !== undefined && (
        <div className="text-center text-sm text-muted-foreground">
          Time Taken: {formatTime(timeTaken)}
        </div>
      )}
    </div>
  );
};

export default ScoreDisplay;
