import React, { useState } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface AnswerOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface AnswerOptionsProps {
  options?: AnswerOption[];
  onAnswerSelected?: (optionId: string, isCorrect: boolean) => void;
  showFeedback?: boolean;
  selectedAnswerId?: string | null;
  disabled?: boolean;
}

const AnswerOptions = ({
  options = [
    { id: "1", text: "Paris", isCorrect: true },
    { id: "2", text: "London", isCorrect: false },
    { id: "3", text: "Berlin", isCorrect: false },
    { id: "4", text: "Madrid", isCorrect: false },
  ],
  onAnswerSelected = () => {},
  showFeedback = false,
  selectedAnswerId = null,
  disabled = false,
}: AnswerOptionsProps) => {
  const handleOptionClick = (optionId: string, isCorrect: boolean) => {
    // Allow clicking only if not disabled and feedback is not yet shown
    if (disabled || showFeedback) return;
    onAnswerSelected(optionId, isCorrect);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-card p-6 rounded-lg shadow-sm"> {/* Replaced bg-white with bg-card */}
      <div className="space-y-4">
        {options.map((option) => {
          const isSelected = selectedAnswerId === option.id;
          const isCorrect = option.isCorrect;

          // Determine feedback states
          const showAsCorrect = showFeedback && isSelected && isCorrect;
          const showAsIncorrect = showFeedback && isSelected && !isCorrect;
          const showCorrectAnswer = showFeedback && !isSelected && isCorrect;

          // Determine icon
          let icon = null;
          if (showAsCorrect) {
            icon = <CheckCircle className="ml-2 h-5 w-5 text-success" />;
          } else if (showAsIncorrect) {
            icon = <XCircle className="ml-2 h-5 w-5 text-danger" />;
          } else if (showCorrectAnswer) {
            // Optionally show a check next to the correct answer even if not selected
            // icon = <CheckCircle className="ml-2 h-5 w-5 text-success opacity-70" />;
          }

          return (
            <Button
              key={option.id}
              variant="outline"
              className={cn(
                "w-full justify-start text-left h-auto p-4 text-base font-normal border-2 transition-all relative", // Added relative for potential absolute positioning of icons if needed later
                // Base state (no selection, no feedback) - default outline button

                // Selected state, no feedback yet
                !showFeedback && isSelected && "border-primary bg-primary/5",

                // Feedback states
                showAsCorrect && "border-success bg-success/10 text-success-foreground hover:bg-success/15",
                showAsIncorrect && "border-danger bg-danger/10 text-danger-foreground hover:bg-danger/15",
                showCorrectAnswer && "border-success/50 bg-success/5", // Subtle highlight for the actual correct answer

                // Disabled state (applies if prop `disabled` is true OR feedback is shown)
                (disabled || showFeedback) && "opacity-70 cursor-not-allowed",
              )}
              onClick={() => handleOptionClick(option.id, option.isCorrect)}
              // Disable button if explicitly disabled OR if feedback is being shown
              disabled={disabled || showFeedback}
            >
              <div className="flex items-center justify-between w-full">
                <span className="flex-1 mr-2">{option.text}</span>
                {icon} {/* Render the icon */}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default AnswerOptions;
