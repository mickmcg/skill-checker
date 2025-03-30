import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  ArrowLeft,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  BarChart,
} from "lucide-react";
import { Progress } from "../components/ui/progress";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string | null;
}

interface QuizDetailsProps {
  quizId?: string;
  subject?: string;
  date?: string;
  score?: number;
  totalQuestions?: number;
  timeTaken?: number;
  questions?: QuizQuestion[];
  onBackToHistory?: () => void;
  onBackToHome?: () => void;
}

const QuizDetails: React.FC<QuizDetailsProps> = ({
  quizId = "quiz-123",
  subject = "JavaScript Fundamentals",
  date = "2023-06-15",
  score = 8,
  totalQuestions = 10,
  timeTaken = 420, // in seconds
  questions = [
    {
      id: "q1",
      question: "What is JavaScript primarily used for?",
      options: [
        "Server-side scripting",
        "Client-side web development",
        "Database management",
        "Operating system development",
      ],
      correctAnswer: "Client-side web development",
      userAnswer: "Client-side web development",
    },
    {
      id: "q2",
      question: "Which of the following is not a JavaScript data type?",
      options: ["String", "Boolean", "Float", "Object"],
      correctAnswer: "Float",
      userAnswer: "String",
    },
    {
      id: "q3",
      question: "What does DOM stand for?",
      options: [
        "Document Object Model",
        "Data Object Model",
        "Document Oriented Middleware",
        "Digital Ordinance Model",
      ],
      correctAnswer: "Document Object Model",
      userAnswer: "Document Object Model",
    },
    {
      id: "q4",
      question:
        "Which method is used to add an element at the end of an array?",
      options: ["push()", "append()", "addToEnd()", "concat()"],
      correctAnswer: "push()",
      userAnswer: "push()",
    },
    {
      id: "q5",
      question: "What is the correct way to create a function in JavaScript?",
      options: [
        "function = myFunction() {}",
        "function myFunction() {}",
        "create myFunction() {}",
        "new Function() {}",
      ],
      correctAnswer: "function myFunction() {}",
      userAnswer: "function myFunction() {}",
    },
    {
      id: "q6",
      question: "Which operator is used for strict equality comparison?",
      options: ["==", "===", "=", "!="],
      correctAnswer: "===",
      userAnswer: "===",
    },
    {
      id: "q7",
      question: 'What is the purpose of the "this" keyword in JavaScript?',
      options: [
        "To refer to the current function",
        "To refer to the current object",
        "To refer to the parent object",
        "To refer to the global object only",
      ],
      correctAnswer: "To refer to the current object",
      userAnswer: "To refer to the current object",
    },
    {
      id: "q8",
      question:
        "Which method is used to remove the last element from an array?",
      options: ["pop()", "removeLast()", "delete()", "splice()"],
      correctAnswer: "pop()",
      userAnswer: "pop()",
    },
    {
      id: "q9",
      question: "What is a closure in JavaScript?",
      options: [
        "A way to secure JavaScript code",
        "A function having access to the parent scope, even after the parent function has closed",
        "A method to close browser windows",
        "A way to end JavaScript execution",
      ],
      correctAnswer:
        "A function having access to the parent scope, even after the parent function has closed",
      userAnswer:
        "A function having access to the parent scope, even after the parent function has closed",
    },
    {
      id: "q10",
      question: "Which of these is not a JavaScript framework or library?",
      options: ["React", "Angular", "Vue", "Jakarta"],
      correctAnswer: "Jakarta",
      userAnswer: "Jakarta",
    },
  ],
  onBackToHistory = () => console.log("Back to history"),
  onBackToHome = () => console.log("Back to home"),
}) => {
  // Calculate metrics
  const correctAnswers = questions.filter(
    (q) => q.userAnswer === q.correctAnswer,
  ).length;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const scorePercentage = (score / totalQuestions) * 100;

  // Format time taken
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={onBackToHistory} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
          <h1 className="text-2xl font-bold">Quiz Details</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{subject}</CardTitle>
                <p className="text-sm text-gray-500">
                  Completed on {new Date(date).toLocaleDateString()}
                </p>
              </div>
              <Badge
                className="text-lg px-3 py-1"
                variant={scorePercentage >= 70 ? "success" : "destructive"}
              >
                {score}/{totalQuestions} ({scorePercentage.toFixed(0)}%)
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Time Taken</p>
                  <p className="font-medium">{formatTime(timeTaken)}</p>
                </div>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                <div>
                  <p className="text-sm text-gray-500">Correct Answers</p>
                  <p className="font-medium">{correctAnswers}</p>
                </div>
              </div>
              <div className="flex items-center">
                <XCircle className="h-5 w-5 mr-2 text-red-500" />
                <div>
                  <p className="text-sm text-gray-500">Incorrect Answers</p>
                  <p className="font-medium">{incorrectAnswers}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Performance</p>
              <Progress value={scorePercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all" className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Questions</TabsTrigger>
            <TabsTrigger value="correct">
              Correct ({correctAnswers})
            </TabsTrigger>
            <TabsTrigger value="incorrect">
              Incorrect ({incorrectAnswers})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">{renderQuestions(questions)}</TabsContent>

          <TabsContent value="correct">
            {renderQuestions(
              questions.filter((q) => q.userAnswer === q.correctAnswer),
            )}
          </TabsContent>

          <TabsContent value="incorrect">
            {renderQuestions(
              questions.filter((q) => q.userAnswer !== q.correctAnswer),
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBackToHistory}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
          <Button onClick={onBackToHome}>
            <Award className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

const renderQuestions = (questions: QuizQuestion[]) => {
  return (
    <div className="space-y-6">
      {questions.map((question, index) => {
        const isCorrect = question.userAnswer === question.correctAnswer;

        return (
          <Card
            key={question.id}
            className={`border-l-4 ${isCorrect ? "border-l-green-500" : "border-l-red-500"}`}
          >
            <CardContent className="pt-6">
              <div className="mb-4">
                <p className="font-medium mb-1">Question {index + 1}</p>
                <p className="text-lg">{question.question}</p>
              </div>

              <div className="space-y-2 mb-4">
                {question.options.map((option, optIndex) => {
                  const isUserAnswer = option === question.userAnswer;
                  const isCorrectAnswer = option === question.correctAnswer;

                  let bgColor = "";
                  if (isUserAnswer && isCorrectAnswer)
                    bgColor = "bg-green-50 border-green-200";
                  else if (isUserAnswer && !isCorrectAnswer)
                    bgColor = "bg-red-50 border-red-200";
                  else if (isCorrectAnswer)
                    bgColor = "bg-green-50 border-green-200";

                  return (
                    <div
                      key={optIndex}
                      className={`p-3 border rounded-md flex items-center ${bgColor}`}
                    >
                      <div className="w-6 h-6 rounded-full border flex items-center justify-center mr-3">
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <span>{option}</span>
                      {isUserAnswer && (
                        <span className="ml-auto">
                          {isCorrectAnswer ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </span>
                      )}
                      {!isUserAnswer && isCorrectAnswer && (
                        <span className="ml-auto">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {question.userAnswer !== question.correctAnswer && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-sm font-medium text-amber-800">
                    Correct Answer: {question.correctAnswer}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QuizDetails;
