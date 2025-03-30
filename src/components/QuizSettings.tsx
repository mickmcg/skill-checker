import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Clock, Brain, Award, Timer } from "lucide-react";

interface QuizSettingsProps {
  onStartQuiz?: (settings: QuizSettingsType) => void;
  selectedSubject?: string;
}

export interface QuizSettingsType {
  numberOfQuestions: number;
  difficulty: string;
  timeLimit: number;
  subject: string;
}

const QuizSettings = ({
  onStartQuiz = () => {},
  selectedSubject = "General Knowledge",
}: QuizSettingsProps) => {
  const [settings, setSettings] = useState<QuizSettingsType>({
    numberOfQuestions: 10,
    difficulty: "medium",
    timeLimit: 30,
    subject: selectedSubject,
  });

  const handleNumberOfQuestionsChange = (value: number[]) => {
    setSettings({ ...settings, numberOfQuestions: value[0] });
  };

  const handleTimeLimitChange = (value: number[]) => {
    setSettings({ ...settings, timeLimit: value[0] });
  };

  const handleDifficultyChange = (value: string) => {
    setSettings({ ...settings, difficulty: value });
  };

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartQuiz = async () => {
    setIsLoading(true);
    setError(null);
    try {
      onStartQuiz(settings);
    } catch (err) {
      setError("Failed to start quiz. Please try again.");
      console.error("Error starting quiz:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Quiz Settings
        </CardTitle>
        <CardDescription className="text-center">
          Customize your quiz on{" "}
          <span className="font-medium">{settings.subject}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Number of Questions</h3>
          </div>
          <div className="px-2">
            <Slider
              defaultValue={[settings.numberOfQuestions]}
              max={30}
              min={5}
              step={5}
              onValueChange={handleNumberOfQuestionsChange}
              className="my-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>5</span>
              <span>10</span>
              <span>15</span>
              <span>20</span>
              <span>25</span>
              <span>30</span>
            </div>
          </div>
          <div className="text-center text-sm font-medium mt-2">
            Selected: {settings.numberOfQuestions} questions
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Difficulty Level</h3>
          </div>
          <Select
            defaultValue={settings.difficulty}
            onValueChange={handleDifficultyChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Time Limit per Question (seconds)</h3>
          </div>
          <div className="px-2">
            <Slider
              defaultValue={[settings.timeLimit]}
              max={120}
              min={10}
              step={10}
              onValueChange={handleTimeLimitChange}
              className="my-4"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>10s</span>
              <span>30s</span>
              <span>60s</span>
              <span>90s</span>
              <span>120s</span>
            </div>
          </div>
          <div className="text-center text-sm font-medium mt-2">
            Selected: {settings.timeLimit} seconds per question
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Quiz Summary</h3>
          </div>
          <ul className="space-y-1 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Subject:</span>
              <span className="font-medium">{settings.subject}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Questions:</span>
              <span className="font-medium">{settings.numberOfQuestions}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Difficulty:</span>
              <span className="font-medium capitalize">
                {settings.difficulty}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Time per question:</span>
              <span className="font-medium">{settings.timeLimit} seconds</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Total time:</span>
              <span className="font-medium">
                {settings.numberOfQuestions * settings.timeLimit} seconds
              </span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {error && (
          <div className="w-full p-3 text-sm bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
        <Button
          onClick={handleStartQuiz}
          className="w-full py-6 text-lg font-medium"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Generating Quiz...
            </>
          ) : (
            "Start Quiz"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default QuizSettings;
