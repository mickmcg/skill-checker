import React from "react";
import { cn } from "../lib/utils"; // Import cn utility

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  timeRemaining?: number;
  totalTime?: number;
  showTimer?: boolean;
}

const ProgressBar = ({
  currentQuestion = 1,
  totalQuestions = 10,
  timeRemaining = 60,
  totalTime = 120,
  showTimer = true,
}: ProgressBarProps) => {
  // Calculate progress percentage
  const progressPercentage = ((currentQuestion - 1) / totalQuestions) * 100;

  // Calculate time progress percentage
  const timeProgressPercentage = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0; // Ensure totalTime is positive

  return (
    <div className="w-full p-4 bg-card rounded-lg shadow-sm"> {/* Replaced bg-white with bg-card */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-foreground"> {/* Replaced text-gray-700 */}
          Question {currentQuestion} of {totalQuestions}
        </div>
        {showTimer && (
          <div className="text-sm font-medium text-foreground"> {/* Replaced text-gray-700 */}
            Time: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="w-full bg-muted h-2 rounded-full overflow-hidden"> {/* Replaced bg-gray-200 */}
        <div
          className="bg-primary h-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {showTimer && totalTime > 0 && ( // Ensure totalTime is positive to avoid division by zero issues
        <div className="mt-2 w-full bg-muted h-1 rounded-full overflow-hidden"> {/* Replaced bg-gray-200 */}
          <div
            className={cn(
              "h-full transition-all duration-300 ease-in-out",
              timeProgressPercentage < 25 ? "bg-danger" : // Red for < 25%
              timeProgressPercentage < 50 ? "bg-warning" : // Amber for 25% - 50%
              "bg-success" // Green for >= 50%
            )}
            style={{ width: `${timeProgressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
