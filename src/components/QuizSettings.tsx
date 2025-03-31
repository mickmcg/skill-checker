import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Header from './Header';
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
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Clock, Brain, Award, Timer } from 'lucide-react';
import { useQuiz, QuizSettingsType } from '../context/QuizContext'; // Import context hook and type

// Remove QuizSettingsProps interface and component props

const QuizSettings = () => { // Remove props from component definition
  const navigate = useNavigate(); // Add navigate hook
  const {
    quizSettings: contextSettings, // Get settings from context
    setQuizSettings: setContextSettings, // Function to update context settings
    generateQuestions,
    isGeneratingQuestions, // Use context loading state
    questionError, // Use context error state
  } = useQuiz();

  // Local state to manage form inputs, initialized from context or defaults
  const [localSettings, setLocalSettings] = useState<QuizSettingsType>(
    contextSettings || { // Initialize with context settings or defaults
      numberOfQuestions: 1, // Default to 1 question
      difficulty: 'medium',
      timeLimit: 30,
      subject: 'General Knowledge', // Default subject if none in context
    }
  );

  // Effect to update local state if context changes (e.g., navigating back)
  useEffect(() => {
    if (contextSettings) {
      setLocalSettings(contextSettings);
    }
    // Optional: Add logic if contextSettings is null (e.g., redirect or set defaults)
    else {
        // If no settings in context (e.g., direct navigation), maybe redirect or set defaults
        // navigate('/'); // Example: redirect to home
         setLocalSettings({
             numberOfQuestions: 1, // Ensure useEffect fallback also defaults to 1
             difficulty: 'medium',
             timeLimit: 30,
             subject: 'General Knowledge',
         });
    }
  }, [contextSettings]);

  // Update local state and context when form values change
  const handleNumberOfQuestionsChange = (value: number[]) => {
    const newSettings = { ...localSettings, numberOfQuestions: value[0] };
    setLocalSettings(newSettings);
    setContextSettings(newSettings); // Update context as well
  };

  const handleTimeLimitChange = (value: number[]) => {
    const newSettings = { ...localSettings, timeLimit: value[0] };
    setLocalSettings(newSettings);
    setContextSettings(newSettings);
  };

  const handleDifficultyChange = (value: string) => {
    // Ensure the value matches the expected type if necessary
    const newSettings = { ...localSettings, difficulty: value as 'easy' | 'medium' | 'hard' };
    setLocalSettings(newSettings);
    setContextSettings(newSettings);
  };

  // Use context's generateQuestions function
  const handleStartQuiz = async () => {
    if (!localSettings) return; // Should not happen if initialized correctly
    // generateQuestions handles loading state and navigation internally now
    await generateQuestions(localSettings);
  };

  return (
    <>
      <Header />
      <Card className="w-full max-w-3xl mx-auto bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Quiz Settings
          </CardTitle>
          <CardDescription className="text-center">
            Customize your quiz on{' '}
            {/* Display subject from local state */}
            <span className="font-medium">{localSettings.subject}</span>
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
                value={[localSettings.numberOfQuestions]} // Use value for controlled component
                max={30}
                min={1} // Set min to 1
                step={1} // Set step to 1
                onValueChange={handleNumberOfQuestionsChange}
                className="my-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>1</span>
                <span>5</span>
                <span>10</span>
                <span>15</span>
                <span>20</span>
                <span>25</span>
                <span>30</span>
              </div>
            </div>
            <div className="text-center text-sm font-medium mt-2">
              Selected: {localSettings.numberOfQuestions} questions
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Difficulty Level</h3>
            </div>
            <Select
              value={localSettings.difficulty} // Use value for controlled component
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
                value={[localSettings.timeLimit]} // Use value for controlled component
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
              Selected: {localSettings.timeLimit} seconds per question
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
                <span className="font-medium">{localSettings.subject}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Questions:</span>
                <span className="font-medium">{localSettings.numberOfQuestions}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                <span className="font-medium capitalize">
                  {localSettings.difficulty}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Time per question:</span>
                <span className="font-medium">{localSettings.timeLimit} seconds</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Total time:</span>
                <span className="font-medium">
                  {localSettings.numberOfQuestions * localSettings.timeLimit} seconds
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {/* Display error from context */}
          {questionError && (
            <div className="w-full p-3 text-sm bg-red-50 text-red-600 rounded-md">
              {questionError}
            </div>
          )}
          <Button
            onClick={handleStartQuiz}
            className="w-full py-6 text-lg font-medium"
            disabled={isGeneratingQuestions} // Use context loading state
          >
            {isGeneratingQuestions ? ( // Use context loading state
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
    </>
  );
};

export default QuizSettings;
