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
  subjectStrengths?: Array<{ subject: string; score: number }>;
  subjectWeaknesses?: Array<{ subject: string; score: number }>;
}

const PerformanceMetrics = ({
  timeSpent = "12:45",
  correctAnswers = 8,
  totalQuestions = 10,
  averageResponseTime = "18s",
  subjectStrengths = [
    { subject: "History", score: 90 },
    { subject: "Geography", score: 85 },
  ],
  subjectWeaknesses = [
    { subject: "Mathematics", score: 40 },
    { subject: "Science", score: 55 },
  ],
}: PerformanceMetricsProps) => {
  const correctPercentage = Math.round((correctAnswers / totalQuestions) * 100);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Performance Analysis
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"> {/* Changed md:grid-cols-4 to md:grid-cols-2 */}
        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Time Spent</p>
                <p className="text-xl font-bold">{timeSpent}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Accuracy</p>
                <p className="text-xl font-bold">{correctPercentage}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-xl font-bold">
                  {correctAnswers}/{totalQuestions}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Avg. Response Time</p>
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
