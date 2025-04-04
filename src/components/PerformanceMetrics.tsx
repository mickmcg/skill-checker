import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Clock, Brain, Target, Award } from "lucide-react";

interface PerformanceMetricsProps {
  timeSpent?: string;
  correctAnswers?: number;
  totalQuestions?: number;
  averageResponseTime?: string;
  topicStrengths?: Array<{ topic: string; score: number }>; // Renamed prop and inner field
  topicWeaknesses?: Array<{ topic: string; score: number }>; // Renamed prop and inner field
}

const PerformanceMetrics = ({
  timeSpent = "12:45",
  correctAnswers = 8,
  totalQuestions = 10,
  averageResponseTime = "18s",
  topicStrengths = [ // Renamed prop and inner field
    { topic: "History", score: 90 },
    { topic: "Geography", score: 85 },
  ],
  topicWeaknesses = [ // Renamed prop and inner field
    { topic: "Mathematics", score: 40 },
    { topic: "Science", score: 55 },
  ],
}: PerformanceMetricsProps) => {
  // Handle division by zero for percentage calculation
  const correctPercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  // Determine color based on percentage
  const scoreColorClass = correctPercentage >= 60 ? "text-success" : "text-danger";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 bg-card p-6 rounded-lg shadow-sm"> {/* Replaced bg-white with bg-card */}
      <h2 className="text-2xl font-bold text-center text-foreground mb-6"> {/* Replaced text-gray-800 with text-foreground */}
        Performance Analysis
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"> {/* Changed md:grid-cols-4 to md:grid-cols-2 */}
        <Card className="bg-card"> {/* Replaced bg-white with bg-card */}
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p> {/* Replaced text-gray-500 with text-muted-foreground */}
                <p className="text-xl font-bold">{timeSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card"> {/* Replaced bg-white with bg-card */}
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              {/* Apply color to icon */}
              <Target className={`h-5 w-5 ${scoreColorClass}`} />
              <div>
                <p className="text-sm text-muted-foreground">Accuracy</p> {/* Replaced text-gray-500 with text-muted-foreground */}
                {/* Apply color to value */}
                <p className={`text-xl font-bold ${scoreColorClass}`}>{correctPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card"> {/* Replaced bg-white with bg-card */}
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              {/* Apply color to icon */}
              <Brain className={`h-5 w-5 ${scoreColorClass}`} />
              <div>
                <p className="text-sm text-muted-foreground">Score</p> {/* Replaced text-gray-500 with text-muted-foreground */}
                {/* Apply color to value */}
                <p className={`text-xl font-bold ${scoreColorClass}`}>
                  {correctAnswers}/{totalQuestions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card"> {/* Replaced bg-white with bg-card */}
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg. Response Time</p> {/* Replaced text-gray-500 with text-muted-foreground */}
                <p className="text-xl font-bold">{averageResponseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </div>
  );
};

export default PerformanceMetrics;
