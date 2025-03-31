import React from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, Award, BarChart } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn utility

// Interface for the formatted history item data passed as props
interface QuizHistoryItem {
  id: string;
  date: string; // Formatted date string
  subject: string;
  score: number;
  totalQuestions: number;
  timeTaken: string; // Formatted MM:SS string
  difficulty: "easy" | "medium" | "hard";
}

interface HistoryListProps {
  historyItems?: QuizHistoryItem[];
  // onSelectQuiz prop is removed
}

const HistoryList = ({
  historyItems = [], // Default to empty array
}: HistoryListProps) => {
  const navigate = useNavigate(); // Use navigate hook

  // Function to format date (keep existing helper)
  const formatDate = (dateString: string) => {
    // Check if dateString is valid before creating Date object
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return "Invalid Date";
    }
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to determine score color class
  const getScoreColorClass = (score: number, total: number) => {
    if (total === 0) return "text-muted-foreground"; // Use muted for zero total
    const percentage = (score / total) * 100;
    // Use new success/danger classes based on 60% threshold
    return percentage >= 60 ? "text-success" : "text-danger";
  };

  // Function to determine difficulty text color class
  const getDifficultyTextColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-success";
      case "medium": return "text-warning";
      case "hard": return "text-danger";
      default: return "text-muted-foreground";
    }
  };


  return (
    // Removed max-w-3xl and mx-auto, parent component handles width/centering
    // Removed p-4 and space-y-4 as parent handles spacing now
    <div className="w-full bg-background space-y-4">
      {historyItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No quiz history available yet.
          </p>
        </div>
      ) : (
        historyItems.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            // Update onClick to navigate to the details page
            onClick={() => navigate(`/history/${item.id}`)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.subject}</CardTitle>
                {/* Apply specific classes for each difficulty */}
                <Badge
                  className={cn(
                    "capitalize", // Ensure text is capitalized
                    item.difficulty === 'easy' && "bg-green-600 text-white border-transparent", // White text on green bg
                    item.difficulty === 'medium' && "bg-yellow-500 text-white border-transparent", // White text on yellow bg
                    item.difficulty === 'hard' && "bg-red-600 text-white border-transparent" // White text on red bg
                  )}
                >
                  {item.difficulty}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                {formatDate(item.date)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center">
                  {/* Apply score color to icon */}
                  <Award className={`h-5 w-5 mb-1 ${getScoreColorClass(item.score, item.totalQuestions)}`} />
                  <span className="text-xs text-muted-foreground">Score</span>
                  {/* Apply score color to text */}
                  <span
                    className={`font-medium ${getScoreColorClass(item.score, item.totalQuestions)}`}
                  >
                    {item.score}/{item.totalQuestions}
                  </span>
                </div>
                <div className="flex flex-col items-center">
                  <Clock className="h-5 w-5 mb-1 text-primary" />
                  <span className="text-xs text-muted-foreground">Time</span>
                  <span className="font-medium">{item.timeTaken}</span>
                </div>
                <div className="flex flex-col items-center">
                  {/* Apply score color to icon */}
                  <BarChart className={`h-5 w-5 mb-1 ${getScoreColorClass(item.score, item.totalQuestions)}`} />
                  <span className="text-xs text-muted-foreground">
                    Performance
                  </span>
                  {/* Apply score color to text */}
                  <span className={`font-medium ${getScoreColorClass(item.score, item.totalQuestions)}`}>
                    {item.totalQuestions > 0 ? Math.round((item.score / item.totalQuestions) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <div className="w-full text-right">
                <span className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  View Details →
                </span>
              </div>
            </CardFooter>
          </Card>
        ))
      )}
    </div>
  );
};

export default HistoryList;
