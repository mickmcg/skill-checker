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
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Slider } from "./ui/slider";
// Removed Select imports as they are no longer needed for category
import { Button } from './ui/button';
import { ArrowLeft, Clock, Brain, Award, Timer, AlertCircle, Layers } from 'lucide-react'; // Added ArrowLeft, AlertCircle, Layers for Category
import { useQuiz, QuizSettingsType } from '../context/QuizContext';
import { cn } from '../lib/utils';

// Define categories for each topic
const categoriesByTopic: Record<string, string[]> = {
  programming: ["Java", "Python", "Node.js", "React", ".NET Core", "Go"],
  databases: ["SQL", "NoSQL", "Performance", "MySQL", "PostgreSQL", "Oracle"],
  networking: ["Protocols", "Topologies", "Security", "Hardware", "General", "Cloud Networking"],
  linux: ["Command Line", "System Admin", "Scripting", "Security", "General", "Kernel"],
  "cloud-native": ["Containers", "Orchestration", "AWS", "Azure", "GCP", "Kubernetes", "Serverless"],
  "general-knowledge": ["History", "Geography", "Current Events", "Arts", "Science", "Technology"],
  // Add more topics and categories as needed
};

const QuizSettings = () => {
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
    contextSettings || {
      numberOfQuestions: 1,
      difficulty: 'medium',
      timeLimit: 30,
      topic: 'general-knowledge', // Default topic if none in context
      category: categoriesByTopic['general-knowledge']?.[0] || 'General', // Default category
    }
  );

  // Effect to update local state if context changes (e.g., navigating back or topic change)
  useEffect(() => {
    if (contextSettings) {
      // Ensure category is valid for the topic, or set a default
      const currentTopicCategories = categoriesByTopic[contextSettings.topic] || [];
      const defaultCategory = currentTopicCategories[0] || 'General';
      const categoryToSet = contextSettings.category && currentTopicCategories.includes(contextSettings.category)
        ? contextSettings.category
        : defaultCategory;

      setLocalSettings({
        ...contextSettings,
        category: categoryToSet,
      });
    } else {
      // If no settings in context, set defaults including category
      const defaultTopic = 'general-knowledge';
      const defaultCategories = categoriesByTopic[defaultTopic] || [];
      const defaultCategory = defaultCategories[0] || 'General';
      setLocalSettings({
        numberOfQuestions: 1,
        difficulty: 'medium',
        timeLimit: 30,
        topic: defaultTopic,
        category: defaultCategory,
      });
    }
  }, [contextSettings]); // Rerun when context settings change

  // Effect to reset category when topic changes
  useEffect(() => {
    const currentTopicCategories = categoriesByTopic[localSettings.topic] || [];
    const defaultCategory = currentTopicCategories[0] || 'General';
    // Only update if the current category isn't valid for the new topic
    if (!currentTopicCategories.includes(localSettings.category || '')) {
        const newSettings = { ...localSettings, category: defaultCategory };
        setLocalSettings(newSettings);
        setContextSettings(newSettings); // Also update context
    }
  }, [localSettings.topic]); // Rerun only when topic changes

  // Update local state and context when form values change
  const handleSettingChange = (field: keyof QuizSettingsType, value: any) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    setContextSettings(newSettings); // Update context immediately
  };

  const handleNumberOfQuestionsChange = (value: number[]) => {
    handleSettingChange('numberOfQuestions', value[0]);
  };

  const handleTimeLimitChange = (value: number[]) => {
    handleSettingChange('timeLimit', value[0]);
  };

  const handleDifficultyChange = (value: string) => {
    if (value) { // Ensure a value is selected in ToggleGroup
      handleSettingChange('difficulty', value as 'easy' | 'medium' | 'hard');
    }
  };

  const handleCategoryChange = (value: string) => {
    handleSettingChange('category', value);
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
      {/* Removed relative positioning and pt-12 */}
      <Card className="w-full max-w-7xl mx-auto bg-card shadow-lg p-6 space-y-6"> {/* Use p-6 like HistorySection, add space-y-6 */}
        {/* New Header structure like HistorySection */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full text-muted-foreground hover:text-foreground" // Added text colors
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span> {/* Screen reader text */}
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Quiz Settings</h1>
          {/* Optional: Add description back if needed, maybe below the title */}
          {/* <p className="text-muted-foreground ml-auto">Customize your quiz on <span className="font-medium text-primary capitalize">{localSettings.topic.replace('-', ' ')}</span></p> */}
        </div>
        {/* Removed CardHeader */}
        <CardContent className="space-y-6 p-0"> {/* Remove default padding from CardContent as Card now has p-6 */}
          {/* Category Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Category</h3>
            </div>
            {/* Replace Select with ToggleGroup for Category */}
            <ToggleGroup
              type="single"
              value={localSettings.category}
              onValueChange={(value) => {
                // Ensure a value is always selected
                if (value) {
                  handleCategoryChange(value);
                }
              }}
              // Adjust grid columns based on number of categories, or use flex wrap
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
            >
              {(categoriesByTopic[localSettings.topic] || ['General']).map((cat) => (
                <ToggleGroupItem
                  key={cat}
                  value={cat}
                  aria-label={`Toggle ${cat}`}
                  className={cn(
                    "py-3 text-sm border", // Adjusted padding/text size slightly
                    localSettings.category === cat
                      ? "bg-primary/20 border-primary text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" // Theme-aware primary colors for selected
                      : "bg-card hover:bg-muted" // Theme-aware default/hover
                  )}
                >
                  {cat}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Number of Questions Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Number of Questions</h3>
            </div>
            {/* Wrapper for Slider and Labels with bottom padding */}
            <div className="px-2 pt-2 pb-6"> {/* Added pb-6 */}
              <Slider
                value={[localSettings.numberOfQuestions]}
                max={30}
                min={1}
                step={1}
                onValueChange={handleNumberOfQuestionsChange}
                className="w-full"
              />
              {/* Container for Labels, placed within wrapper */}
              <div className="relative h-6"> {/* Height to contain labels */}
                <div className="absolute left-0 right-0 bottom-0 text-sm text-muted-foreground">
                  {[1, 5, 10, 15, 20, 25, 30].map((value) => {
                    const min = 1;
                    const max = 30;
                    const percentage = ((value - min) / (max - min)) * 100;
                    return (
                      <span
                        key={value}
                        className="absolute -translate-x-1/2"
                        style={{ left: `${percentage}%` }}
                      >
                        {value}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Selected text follows the wrapper */}
            <div className="text-center text-sm font-medium text-foreground mt-2">
              Selected: {localSettings.numberOfQuestions} questions
            </div>
          </div>

          {/* Difficulty Level Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Difficulty Level</h3>
            </div>
            <ToggleGroup
              type="single"
              value={localSettings.difficulty}
              onValueChange={handleDifficultyChange}
              className="grid grid-cols-3 gap-2"
            >
              <ToggleGroupItem
                value="easy"
                aria-label="Toggle easy"
                className={cn(
                  "py-4 text-lg border",
                  localSettings.difficulty === 'easy'
                    ? "bg-success/20 border-success text-success-foreground data-[state=on]:bg-success data-[state=on]:text-success-foreground"
                    : "bg-card hover:bg-muted"
                )}
              >
                Easy
              </ToggleGroupItem>
              <ToggleGroupItem
                value="medium"
                aria-label="Toggle medium"
                className={cn(
                  "py-4 text-lg border",
                  localSettings.difficulty === 'medium'
                    ? "bg-warning/20 border-warning text-warning-foreground data-[state=on]:bg-warning data-[state=on]:text-warning-foreground"
                    : "bg-card hover:bg-muted"
                )}
              >
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem
                value="hard"
                aria-label="Toggle hard"
                className={cn(
                  "py-4 text-lg border",
                  localSettings.difficulty === 'hard'
                    ? "bg-danger/20 border-danger text-danger-foreground data-[state=on]:bg-danger data-[state=on]:text-danger-foreground"
                    : "bg-card hover:bg-muted"
                )}
              >
                Hard
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Time Limit Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Time Limit per Question (seconds)</h3>
            </div>
            {/* Wrapper for Slider and Labels with bottom padding */}
            <div className="px-2 pt-2 pb-6"> {/* Added pb-6 */}
              <Slider
                value={[localSettings.timeLimit]}
                max={120}
                min={10}
                step={10}
                onValueChange={handleTimeLimitChange}
                className="w-full"
              />
              {/* Container for Labels, placed within wrapper */}
              <div className="relative h-6"> {/* Height to contain labels */}
                <div className="absolute left-0 right-0 bottom-0 text-sm text-muted-foreground">
                  {[10, 30, 60, 90, 120].map((value) => {
                    const min = 10;
                    const max = 120;
                    const percentage = ((value - min) / (max - min)) * 100;
                    return (
                      <span
                        key={value}
                        className="absolute -translate-x-1/2"
                        style={{ left: `${percentage}%` }}
                      >
                        {value}s
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
            {/* Selected text follows the wrapper */}
            <div className="text-center text-sm font-medium text-foreground mt-2">
              Selected: {localSettings.timeLimit} seconds per question
            </div>
          </div>

          {/* Quiz Summary Section */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Quiz Summary</h3>
            </div>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Topic:</span>
                <span className="font-medium text-foreground capitalize">{localSettings.topic.replace('-', ' ')}</span>
              </li>
               <li className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium text-foreground">{localSettings.category}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Questions:</span>
                <span className="font-medium text-foreground">{localSettings.numberOfQuestions}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Difficulty:</span>
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
                <span className="font-medium text-foreground">{localSettings.timeLimit} seconds</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Total time:</span>
                <span className="font-medium text-foreground">
                  {localSettings.numberOfQuestions * localSettings.timeLimit} seconds
                </span>
              </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {/* Display error from context */}
          {questionError && (
            <div className="w-full p-3 text-sm bg-destructive/10 text-destructive rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {questionError}
            </div>
          )}
          {/* Removed the wrapper div and the back button from here */}
          <Button
            onClick={handleStartQuiz}
            className="w-full py-6 text-lg font-medium bg-green-500 hover:bg-green-600 text-white" // Make Start Quiz full width again
            disabled={isGeneratingQuestions}
          >
            {isGeneratingQuestions ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
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
          {/* Removed closing div for button wrapper */}
        </CardFooter>
      </Card>
    </div> // Close the wrapper div
  );
};

export default QuizSettings;
