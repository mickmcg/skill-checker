import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import {
  Card,
  CardContent,
  CardFooter,
} from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";
import { Slider } from "./ui/slider";
import { Button } from './ui/button';
// Import Check icon for save confirmation
import { ArrowLeft, Clock, Brain, Award, Timer, AlertCircle, Layers, Save, Check } from 'lucide-react';
import { useQuiz, QuizSettingsType, categoriesByTopic, availableDifficulties } from '../context/QuizContext';
// Assuming updateUserPreferences exists in useAuth return type
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
// Import useToast
import { useToast } from "./ui/use-toast";

// Helper function to determine initial settings (remains the same)
const getInitialSettings = (user: ReturnType<typeof useAuth>['user']): QuizSettingsType => {
  // ... (existing code)
  const defaultTopic = 'general-knowledge';
  const defaultCategory = categoriesByTopic[defaultTopic]?.[0] || 'General';

  if (user && user.default_num_questions !== undefined && user.default_time_per_question !== undefined) {
    // User logged in and has defaults defined
    const validDifficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    const userDifficulty = user.default_difficulty && validDifficulties.includes(user.default_difficulty as any)
      ? user.default_difficulty as 'easy' | 'medium' | 'hard'
      : 'medium'; // Fallback difficulty if stored value is invalid or missing

    console.log("QuizSettings: Initializing with USER DEFAULTS");
    return {
      numberOfQuestions: user.default_num_questions,
      difficulty: userDifficulty,
      timeLimit: user.default_time_per_question,
      topic: defaultTopic, // Start with default topic/category
      category: defaultCategory,
    };
  } else {
    // Not logged in or no defaults set - use fallback values
    console.log("QuizSettings: Initializing with FALLBACK DEFAULTS (5q, 30s)");
    return {
      numberOfQuestions: 5, // Fallback default
      difficulty: 'medium', // Default difficulty
      timeLimit: 30, // Fallback default
      topic: defaultTopic, // Default topic
      category: defaultCategory, // Default category
    };
  }
};


const QuizSettings = () => {
  const navigate = useNavigate();
  const { user, updateUserPreferences } = useAuth(); // Get user and updateUserPreferences from context
  const { toast } = useToast(); // Initialize toast
  const {
    quizSettings: contextSettings,
    setQuizSettings: setContextSettings,
    generateQuestions,
    isGeneratingQuestions,
    questionError,
    availableDifficulties: contextDifficulties,
  } = useQuiz();

  // Initialize state using the helper function based on user status
  const [localSettings, setLocalSettings] = useState<QuizSettingsType>(() => getInitialSettings(user));
  const [isSaving, setIsSaving] = useState(false); // State for save button loading

  // Effect to synchronize state (remains the same)
  useEffect(() => {
    // console.log("QuizSettings: Sync Effect running. Initial Local:", localSettings, "Context:", contextSettings, "User Defaults Loaded:", user?.default_num_questions !== undefined);
    // REMOVED LOGIC THAT OVERWRITES INITIAL STATE WITH contextSettings or user defaults after mount.
    // getInitialSettings now handles the correct initial state based on user status at mount time.
    // If user logs in/out *while* on this page, the settings won't automatically update,
    // but this avoids overwriting user selections made after the page loaded.
    console.log("QuizSettings: Mount/User Effect running. User ID:", user?.id);

    // Potential future logic to handle user login/logout *after* mount could go here,
    // but needs careful implementation to avoid overwriting user's manual changes.
    // For now, we rely on getInitialSettings for the initial state.

  }, [user?.id]); // Depend only on user ID to potentially react to login/logout, though no action is taken currently.


  // Effect to reset category when topic changes in local state
  useEffect(() => {
    const currentTopicCategories = categoriesByTopic[localSettings.topic] || [];
    const defaultCategory = currentTopicCategories[0] || 'General';
    // Check if the current category is valid for the current topic
    if (!currentTopicCategories.includes(localSettings.category || '')) {
        console.log("QuizSettings: Resetting category due to topic change or invalid category for topic.");
        const updatedSettings = { ...localSettings, category: defaultCategory };
        setLocalSettings(updatedSettings);
        // Update context immediately when category resets due to topic change
        setContextSettings(updatedSettings);
    }
    // This effect should primarily depend on the topic to reset the category.
    // Adding localSettings.category might cause issues if category changes trigger this effect again.
  }, [localSettings.topic, setContextSettings]); // Depend on topic and context setter


  // Update local state and context when form values change
  const handleSettingChange = (field: keyof QuizSettingsType, value: any) => {
    console.log(`QuizSettings: Handling change for ${field}:`, value);
    const newSettings = { ...localSettings, [field]: value };
    // If changing topic, category might be reset by the effect above,
    // so we calculate the potential default category here too for immediate update.
    if (field === 'topic') {
        const newTopicCategories = categoriesByTopic[value] || [];
        const defaultCategoryForNewTopic = newTopicCategories[0] || 'General';
        // Only reset category if the current one isn't valid for the new topic
        if (!newTopicCategories.includes(newSettings.category || '')) {
            newSettings.category = defaultCategoryForNewTopic;
            console.log(`QuizSettings: Category reset during ${field} change to: ${newSettings.category}`);
        }
    }
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
    if (value && availableDifficulties.includes(value as any)) {
      handleSettingChange('difficulty', value as typeof availableDifficulties[number]);
    }
  };

  const handleCategoryChange = (value: string) => {
    // Ensure category is valid for the current topic before setting
    const currentTopicCategories = categoriesByTopic[localSettings.topic] || [];
    if (value && currentTopicCategories.includes(value)) {
        handleSettingChange('category', value);
    } else if (value) {
        console.warn(`QuizSettings: Attempted to set invalid category "${value}" for topic "${localSettings.topic}". Ignoring.`);
    }
  };


  const handleStartQuiz = async () => {
    if (!localSettings) return;
    console.log("QuizSettings: Starting quiz with settings:", localSettings);
    // Ensure context is updated one last time before generating
    setContextSettings(localSettings);
    setContextSettings(localSettings);
    await generateQuestions(localSettings);
  };

  // Handle Save Default Settings
  const handleSaveDefaults = async () => {
    if (!user || !updateUserPreferences) {
      toast({
        title: "Error",
        description: "You must be logged in to save default settings.",
        variant: "destructive",
      });
      return;
    }
    if (!localSettings) return;

    setIsSaving(true);
    console.log("QuizSettings: Saving default settings:", localSettings);
    try {
      await updateUserPreferences({
        default_num_questions: localSettings.numberOfQuestions,
        default_time_per_question: localSettings.timeLimit,
        default_difficulty: localSettings.difficulty,
        // Note: Default topic/category are not saved currently, only num_questions, time, difficulty
      });
      toast({
        title: "Success!",
        description: "Your default quiz settings have been saved.",
        action: <Check className="h-5 w-5 text-green-500" />, // Add a visual checkmark
      });
    } catch (error) {
      console.error("QuizSettings: Error saving default settings:", error);
      toast({
        title: "Error Saving Settings",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  // Ensure contextDifficulties has a fallback if useQuiz returns undefined/empty
  const difficultiesToShow = contextDifficulties && contextDifficulties.length > 0 ? contextDifficulties : ['easy', 'medium', 'hard'];
  const categoriesToShow = categoriesByTopic[localSettings.topic] || ['General'];

  return (
    <div className="space-y-4 bg-background min-h-screen">
      <Header />
      <Card className="w-full max-w-7xl mx-auto bg-card shadow-lg p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-full text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Quiz Settings</h1>
        </div>
        <CardContent className="space-y-6 p-0">
          {/* Category Selector */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Category</h3>
            </div>
            {categoriesToShow.length > 0 ? (
              <ToggleGroup
                type="single"
                value={localSettings.category}
                onValueChange={(value) => { if (value) { handleCategoryChange(value); } }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              >
                {categoriesToShow.map((cat) => (
                  <ToggleGroupItem
                    key={cat}
                    value={cat}
                  aria-label={`Toggle ${cat}`}
                  className={cn( "py-3 text-sm border", localSettings.category === cat ? "bg-primary/20 border-primary text-primary-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground" : "bg-card hover:bg-muted" )}
                >
                  {cat}
                </ToggleGroupItem>
                ))}
              </ToggleGroup>
            ) : (
              <p className="text-sm text-muted-foreground">No categories available for this topic.</p>
            )}
          </div>

          {/* Number of Questions Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Number of Questions</h3>
            </div>
            <div className="px-2 pt-2 pb-6">
              <Slider
                value={[localSettings.numberOfQuestions]}
                max={30} min={1} step={1}
                onValueChange={handleNumberOfQuestionsChange}
                className="w-full"
              />
              <div className="relative h-6">
                <div className="absolute left-0 right-0 bottom-0 text-sm text-muted-foreground">
                  {[1, 5, 10, 15, 20, 25, 30].map((value) => {
                    const min = 1; const max = 30;
                    const percentage = ((value - min) / (max - min)) * 100;
                    return ( <span key={value} className="absolute -translate-x-1/2" style={{ left: `${percentage}%` }} > {value} </span> );
                  })}
                </div>
              </div>
            </div>
            <div className="text-center text-sm font-medium text-foreground mt-2"> Selected: {localSettings.numberOfQuestions} questions </div>
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
              {difficultiesToShow.map((difficulty) => (
                <ToggleGroupItem
                  key={difficulty} value={difficulty} aria-label={`Toggle ${difficulty}`}
                  className={cn( "py-4 text-lg border capitalize", localSettings.difficulty === difficulty ? difficulty === 'easy' ? "bg-success/20 border-success text-success-foreground data-[state=on]:bg-success data-[state=on]:text-success-foreground" : difficulty === 'medium' ? "bg-warning/20 border-warning text-warning-foreground data-[state=on]:bg-warning data-[state=on]:text-warning-foreground" : "bg-danger/20 border-danger text-danger-foreground data-[state=on]:bg-danger data-[state=on]:text-danger-foreground" : "bg-card hover:bg-muted" )}
                > {difficulty} </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          {/* Time Limit Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Time Limit per Question (seconds)</h3>
            </div>
            <div className="px-2 pt-2 pb-6">
              <Slider
                value={[localSettings.timeLimit]}
                max={120} min={10} step={10}
                onValueChange={handleTimeLimitChange}
                className="w-full"
              />
              <div className="relative h-6">
                <div className="absolute left-0 right-0 bottom-0 text-sm text-muted-foreground">
                  {[10, 30, 60, 90, 120].map((value) => {
                    const min = 10; const max = 120;
                    const percentage = ((value - min) / (max - min)) * 100;
                    return ( <span key={value} className="absolute -translate-x-1/2" style={{ left: `${percentage}%` }} > {value}s </span> );
                  })}
                </div>
              </div>
            </div>
            <div className="text-center text-sm font-medium text-foreground mt-2"> Selected: {localSettings.timeLimit} seconds per question </div>
          </div>

          {/* Quiz Summary Section */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="font-medium text-foreground">Quiz Summary</h3>
            </div>
            <ul className="space-y-1 text-sm">
              <li className="flex justify-between"> <span className="text-muted-foreground">Topic:</span> <span className="font-medium text-foreground capitalize">{localSettings.topic.replace(/-/g, ' ')}</span> </li>
              <li className="flex justify-between"> <span className="text-muted-foreground">Category:</span> <span className="font-medium text-foreground">{localSettings.category}</span> </li>
              <li className="flex justify-between"> <span className="text-muted-foreground">Questions:</span> <span className="font-medium text-foreground">{localSettings.numberOfQuestions}</span> </li>
              <li className="flex justify-between"> <span className="text-muted-foreground">Difficulty:</span> <span className={cn( "font-medium capitalize", localSettings.difficulty === 'easy' && "text-success", localSettings.difficulty === 'medium' && "text-warning", localSettings.difficulty === 'hard' && "text-danger" )}> {localSettings.difficulty} </span> </li>
              <li className="flex justify-between"> <span className="text-muted-foreground">Time per question:</span> <span className="font-medium text-foreground">{localSettings.timeLimit} seconds</span> </li>
              <li className="flex justify-between"> <span className="text-muted-foreground">Total time:</span> <span className="font-medium text-foreground"> {localSettings.numberOfQuestions * localSettings.timeLimit} seconds </span> </li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {/* Error Message (remains the same) */}
          {questionError && ( <div className="w-full p-3 text-sm bg-destructive/10 text-destructive rounded-md flex items-center gap-2"> <AlertCircle className="h-4 w-4" /> {questionError} </div> )}

          {/* Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row gap-4">
            {/* Save Defaults Button (Only if logged in) */}
            {user && updateUserPreferences && (
              <Button
                onClick={handleSaveDefaults}
                className="w-full sm:w-auto flex-1 py-3 text-base font-medium"
                variant="outline"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Defaults
                  </>
                )}
              </Button>
            )}

            {/* Start Quiz Button */}
            <Button
              onClick={handleStartQuiz}
              className="w-full flex-1 py-3 text-base font-medium bg-green-500 hover:bg-green-600 text-white" // Adjusted padding/text size
              disabled={isGeneratingQuestions || isSaving} // Disable if saving defaults too
            >
              {isGeneratingQuestions ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg>
                  Generating Quiz...
                </>
              ) : (
                "Start Quiz"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizSettings;
