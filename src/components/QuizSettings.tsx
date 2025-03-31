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
} from "./ui/select"; // Keep Select related imports if used elsewhere, otherwise remove
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group"; // Add ToggleGroup imports
import { Slider } from "./ui/slider";
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Clock, Brain, Award, Timer, AlertCircle } from 'lucide-react'; // Added AlertCircle
import { useQuiz, QuizSettingsType } from '../context/QuizContext'; // Import context hook and type
import { cn } from '../lib/utils'; // Import cn utility

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
    // Removed p-4 from outer div, added to inner Card
    <div className="space-y-4 bg-background min-h-screen"> {/* Added bg-background and min-h-screen */}
      <Header />
      <Card className="w-full max-w-7xl mx-auto bg-card shadow-lg p-4"> {/* Changed max-w-3xl to max-w-7xl, added p-4 */}
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-foreground"> {/* Use theme color */}
            Quiz Settings
          </CardTitle>
          <CardDescription className="text-center text-muted-foreground"> {/* Use theme color */}
            Customize your quiz on{' '}
            {/* Display subject from local state */}
            <span className="font-medium text-primary">{localSettings.subject}</span> {/* Use theme color */}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Number of Questions</h3> {/* Use theme color */}
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
            <div className="text-center text-sm font-medium text-foreground mt-2"> {/* Use theme color */}
              Selected: {localSettings.numberOfQuestions} questions
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Difficulty Level</h3> {/* Use theme color */}
            </div>
            {/* Replace Select with ToggleGroup */}
            <ToggleGroup
              type="single"
              value={localSettings.difficulty}
              onValueChange={(value) => {
                // Ensure a value is always selected, prevent unselecting
                if (value) {
                  handleDifficultyChange(value as 'easy' | 'medium' | 'hard');
                }
              }}
              className="grid grid-cols-3 gap-2" // Use grid for layout
            >
              <ToggleGroupItem
                value="easy"
                aria-label="Toggle easy"
                className={cn(
                  "py-4 text-lg border", // Larger buttons, added base border
                  localSettings.difficulty === 'easy'
                    ? "bg-success/20 border-success text-success-foreground data-[state=on]:bg-success data-[state=on]:text-success-foreground" // Theme-aware success colors
                    : "bg-card hover:bg-muted" // Theme-aware default/hover
                )}
              >
                Easy
              </ToggleGroupItem>
              <ToggleGroupItem
                value="medium"
                aria-label="Toggle medium"
                className={cn(
                  "py-4 text-lg border", // Larger buttons, added base border
                  localSettings.difficulty === 'medium'
                    ? "bg-warning/20 border-warning text-warning-foreground data-[state=on]:bg-warning data-[state=on]:text-warning-foreground" // Theme-aware warning colors
                    : "bg-card hover:bg-muted" // Theme-aware default/hover
                )}
              >
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem
                value="hard"
                aria-label="Toggle hard"
                className={cn(
                  "py-4 text-lg border", // Larger buttons, added base border
                  localSettings.difficulty === 'hard'
                    ? "bg-danger/20 border-danger text-danger-foreground data-[state=on]:bg-danger data-[state=on]:text-danger-foreground" // Theme-aware danger colors
                    : "bg-card hover:bg-muted" // Theme-aware default/hover
                )}
              >
                Hard
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Time Limit per Question (seconds)</h3> {/* Use theme color */}
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
            <div className="text-center text-sm font-medium text-foreground mt-2"> {/* Use theme color */}
              Selected: {localSettings.timeLimit} seconds per question
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg"> {/* Replaced bg-slate-50 */}
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Quiz Summary</h3> {/* Use theme color */}
            </div>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Subject:</span>
                <span className="font-medium text-foreground">{localSettings.subject}</span> {/* Use theme color */}
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Questions:</span>
                <span className="font-medium text-foreground">{localSettings.numberOfQuestions}</span> {/* Use theme color */}
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
                {/* Add conditional text color based on difficulty */}
                <span className={cn(
                  "font-medium capitalize",
                  localSettings.difficulty === 'easy' && "text-success",
                  localSettings.difficulty === 'medium' && "text-warning",
                  localSettings.difficulty === 'hard' && "text-danger"
                )}>
                  {localSettings.difficulty}
                </span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Time per question:</span>
                <span className="font-medium text-foreground">{localSettings.timeLimit} seconds</span> {/* Use theme color */}
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Total time:</span>
                <span className="font-medium text-foreground"> {/* Use theme color */}
                  {localSettings.numberOfQuestions * localSettings.timeLimit} seconds
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {/* Display error from context */}
          {questionError && (
            <div className="w-full p-3 text-sm bg-destructive/10 text-destructive rounded-md flex items-center gap-2"> {/* Use theme colors */}
              <AlertCircle className="h-4 w-4" />
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
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" // Use foreground color for spinner
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
    </div> // Close the wrapper div
  );
};

export default QuizSettings;
