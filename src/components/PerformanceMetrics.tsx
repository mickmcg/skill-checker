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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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

      {/* Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 text-green-500 mr-2" />
              <span>Strengths</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectStrengths.map((item, index) => (
                <div key={`strength-${index}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.subject}</span>
                    <span className="text-sm font-bold">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 text-red-500 mr-2" />
              <span>Areas for Improvement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectWeaknesses.map((item, index) => (
                <div key={`weakness-${index}`} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{item.subject}</span>
                    <span className="text-sm font-bold">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips for Improvement */}
      <Card className="bg-white mt-6">
        <CardHeader>
          <CardTitle>Tips for Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-sm text-gray-600">
              Focus on studying{" "}
              {subjectWeaknesses[0]?.subject || "weaker subjects"} to improve
              your overall performance.
            </li>
            <li className="text-sm text-gray-600">
              Try to reduce your average response time while maintaining
              accuracy.
            </li>
            <li className="text-sm text-gray-600">
              Review questions you answered incorrectly to understand the
              correct answers.
            </li>
            <li className="text-sm text-gray-600">
              Take regular quizzes to track your progress over time.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;
