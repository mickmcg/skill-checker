import React from "react";

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
  const timeProgressPercentage = (timeRemaining / totalTime) * 100;

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm font-medium text-gray-700">
          Question {currentQuestion} of {totalQuestions}
        </div>
        {showTimer && (
          <div className="text-sm font-medium text-gray-700">
            Time: {Math.floor(timeRemaining / 60)}:
            {(timeRemaining % 60).toString().padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300 ease-in-out"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {showTimer && (
        <div className="mt-2 w-full bg-gray-200 h-1 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ease-in-out ${timeRemaining < totalTime * 0.25 ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${timeProgressPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
