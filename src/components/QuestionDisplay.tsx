import React from "react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

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
  // Map difficulty to color
  const difficultyColor = {
    easy: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    hard: "bg-red-100 text-red-800",
  }[difficulty];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <Badge variant="outline" className="text-sm">
          {category}
        </Badge>
        <Badge className={`${difficultyColor}`}>
          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
        </Badge>
      </div>

      <div className="mb-2 text-sm text-gray-500 font-medium">
        Question {questionNumber} of {totalQuestions}
      </div>

      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
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
