import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { cn } from "../lib/utils"; // Import cn utility

interface QuestionDisplayProps {
  question: string;
  category?: string;
  difficulty?: "easy" | "medium" | "hard";
  questionNumber?: number;
  totalQuestions?: number;
  image?: string;
}

const QuestionDisplay = ({
  question = "What is the capital city of France?",
  category = "Geography",
  difficulty = "medium",
  questionNumber = 1,
  totalQuestions = 10,
  image,
}: QuestionDisplayProps) => {
  // Map difficulty to a valid badge variant
  const difficultyVariant = {
    easy: "default" as const, // Use default variant
    medium: "default" as const, // Use default variant
    hard: "destructive" as const, // Use destructive variant
  }[difficulty];

  // Optional: Add specific text color classes if needed based on difficulty
  const difficultyTextColor = {
    easy: "text-success", // Assuming success color is defined
    medium: "text-warning", // Assuming warning color is defined
    hard: "", // Destructive variant handles color
  }[difficulty];


  return (
    <div className="w-full max-w-3xl mx-auto bg-card p-6 rounded-lg shadow-sm"> {/* Replaced bg-white with bg-card */}
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="text-sm">
          {category}
        </Badge>
        {/* Apply variant and optional text color */}
        <Badge variant={difficultyVariant} className={cn(difficultyTextColor)}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Badge>
      </div>

      <div className="mb-2 text-sm text-muted-foreground font-medium"> {/* Replaced text-gray-500 */}
        Question {questionNumber} of {totalQuestions}
      </div>

      {/* Use bg-card for inner card to match outer container */}
      <Card className="border-0 shadow-none bg-card">
        <CardContent className="p-0">
          <h2 className="text-xl font-semibold mb-4 text-foreground"> {/* Replaced text-gray-800 */}
            {question}
          </h2>

          {image && (
            <div className="mt-4 mb-6">
              <img
                src={image}
                alt="Question visual aid"
                className="rounded-md w-full max-h-64 object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuestionDisplay;
