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
  // Use the selectedAnswerId from props directly instead of local state
  // This ensures the component resets properly when the parent resets selectedAnswerId
  const handleOptionClick = (optionId: string, isCorrect: boolean) => {
    if (disabled || selectedAnswerId !== null) return;

    onAnswerSelected(optionId, isCorrect);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        {options.map((option) => {
          const isSelected = selectedAnswerId === option.id;
          const showCorrectIndicator = showFeedback && isSelected;

          return (
            <Button
              key={option.id}
              variant="outline"
              className={cn(
                "w-full justify-start text-left h-auto p-4 text-base font-normal border-2 transition-all",
                isSelected && "border-primary bg-primary/5",
                disabled && "opacity-70 cursor-not-allowed",
              )}
              onClick={() => handleOptionClick(option.id, option.isCorrect)}
              disabled={disabled}
            >
              <div className="flex items-center w-full">
                <span className="flex-1">{option.text}</span>
                {/* Feedback indicators removed */}
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

export default AnswerOptions;
