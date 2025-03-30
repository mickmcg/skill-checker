import React from "react";
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

interface QuizHistoryItem {
  id: string;
  date: string;
  subject: string;
  score: number;
  totalQuestions: number;
  timeTaken: string;
  difficulty: "easy" | "medium" | "hard";
}

interface HistoryListProps {
  historyItems?: QuizHistoryItem[];
  onSelectQuiz?: (quizId: string) => void;
}

const HistoryList = ({
  historyItems = [
    {
      id: "quiz-1",
      date: "2023-06-15",
      subject: "JavaScript Fundamentals",
      score: 8,
      totalQuestions: 10,
      timeTaken: "12:45",
      difficulty: "medium",
    },
    {
      id: "quiz-2",
      date: "2023-06-10",
      subject: "React Hooks",
      score: 7,
      totalQuestions: 10,
      timeTaken: "15:20",
      difficulty: "hard",
    },
    {
      id: "quiz-3",
      date: "2023-06-05",
      subject: "CSS Flexbox",
      score: 9,
      totalQuestions: 10,
      timeTaken: "08:30",
      difficulty: "easy",
    },
  ],
  onSelectQuiz = () => {},
}: HistoryListProps) => {
  // Function to format date in a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Function to determine badge color based on difficulty
  const getDifficultyBadgeVariant = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "secondary";
      case "medium":
        return "default";
      case "hard":
        return "destructive";
      default:
        return "default";
    }
  };

  // Function to determine score color based on performance
  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80) return "text-green-500";
    if (percentage >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="w-full bg-background p-4 space-y-4">
      {historyItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No quiz history available yet. Complete a quiz to see your results
            here.
          </p>
        </div>
      ) : (
        historyItems.map((item) => (
          <Card
            key={item.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onSelectQuiz(item.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{item.subject}</CardTitle>
                <Badge variant={getDifficultyBadgeVariant(item.difficulty)}>
                  {item.difficulty.charAt(0).toUpperCase() +
                    item.difficulty.slice(1)}
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
                  <Award className="h-5 w-5 mb-1 text-primary" />
                  <span className="text-xs text-muted-foreground">Score</span>
                  <span
                    className={`font-medium ${getScoreColor(item.score, item.totalQuestions)}`}
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
                  <BarChart className="h-5 w-5 mb-1 text-primary" />
                  <span className="text-xs text-muted-foreground">
                    Performance
                  </span>
                  <span className="font-medium">
                    {Math.round((item.score / item.totalQuestions) * 100)}%
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
