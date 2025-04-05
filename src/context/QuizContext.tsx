import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase'; // Import Supabase client
import { saveQuizResult, QuizHistoryItem, SavedQuestion } from '../lib/quiz-history'; // Import saving function and types
import { useAuth } from './AuthContext'; // Import auth context hook

// --- Centralized Quiz Options ---
// Define categories for each topic
export const categoriesByTopic: Record<string, string[]> = {
  programming: ["Java", "Python", "Node.js", "React", ".NET Core", "Go"],
  databases: ["SQL", "NoSQL", "Performance", "MySQL", "PostgreSQL", "Oracle"],
  networking: ["Protocols", "Topologies", "Security", "Hardware", "General", "Cloud Networking"],
  linux: ["Command Line", "System Admin", "Scripting", "Security", "General", "Kernel"],
  "cloud-native": ["Containers", "AWS", "Azure", "GCP", "Kubernetes", "Serverless"],
  "general-knowledge": ["History", "Geography", "Mathematics", "Arts", "Science", "Technology"],
  // Add more topics and categories as needed
};

export const availableTopics = Object.keys(categoriesByTopic);
export const availableDifficulties = ['easy', 'medium', 'hard'] as const; // Use const assertion for stricter type

// Define the shape of the quiz settings
export interface QuizSettingsType {
  topic: string; // Renamed from subject
  category?: string; // Added optional category
  difficulty: typeof availableDifficulties[number]; // Use the defined difficulties type
  numberOfQuestions: number;
  timeLimit: number;
}

// Define the shape of the context data
interface QuizContextProps {
  // Expose the centralized options
  categoriesByTopic: Record<string, string[]>;
  availableTopics: string[];
  availableDifficulties: readonly ('easy' | 'medium' | 'hard')[];

  quizSettings: QuizSettingsType | null;
  setQuizSettings: (settings: QuizSettingsType | null) => void;
  quizQuestions: any[]; // Consider defining a stricter type for questions
  setQuizQuestions: (questions: any[]) => void;
  isGeneratingQuestions: boolean;
  questionError: string | null;
  generateQuestions: (settings: QuizSettingsType) => Promise<void>;
  clearQuizData: () => void;
  // Add state for results
  quizScore: number | null;
  totalQuestions: number | null;
  timeSpent: number | null;
  // Add questionsWithAnswers parameter with specific type
  setQuizResults: (score: number, questionsCount: number, time: number, questionsWithAnswers: SavedQuestion[]) => void;
  savedQuizId: string | null; // Add state for the saved quiz ID
}

// Create the context
const QuizContext = createContext<QuizContextProps | undefined>(undefined);

// Define the shape for results state (optional, could just use individual states)
interface QuizResultState {
    score: number | null;
    totalQuestions: number | null;
    timeSpent: number | null;
}

// Create the provider component
interface QuizProviderProps {
  children: ReactNode;
}

export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [quizSettings, setQuizSettingsState] = useState<QuizSettingsType | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);
  // Add state for results
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [timeSpent, setTimeSpent] = useState<number | null>(null);
  const [savedQuizId, setSavedQuizId] = useState<string | null>(null); // State for saved quiz ID
  const { user } = useAuth(); // Get user from AuthContext


  // Memoize setter functions
  const setQuizSettings = useCallback((settings: QuizSettingsType | null) => {
    setQuizSettingsState(settings);
    // Clear previous questions and error when settings change
    if (settings) { // Only clear if new settings are provided
      setQuizQuestions([]);
      setQuestionError(null);
    }
  }, [setQuizSettingsState, setQuizQuestions, setQuestionError]); // Add setters as dependencies

  const generateQuestions = useCallback(async (settings: QuizSettingsType) => {
    setIsGeneratingQuestions(true);
    setQuestionError(null);
    setQuizQuestions([]); // Clear previous questions
    setQuizSettingsState(settings); // Store settings used for generation

    try {
      console.log("Calling Supabase Edge Function to generate questions via Context");

      // Get the current session and access token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw new Error(`Error getting session: ${sessionError.message}`);
      }

      if (!sessionData.session) {
        throw new Error("User not authenticated. Cannot generate questions.");
      }

      const accessToken = sessionData.session.access_token;

      const response = await fetch(
        // Ensure this URL is correct and ideally from environment variables
        "https://tggxsfowwjarzuexohxj.supabase.co/functions/v1/generate-quiz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add Authorization header using the fetched access token
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            topic: settings.topic, // Use topic
            category: settings.category, // Add category
            numberOfQuestions: settings.numberOfQuestions,
            difficulty: settings.difficulty,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Supabase function error response:", errorData);
        throw new Error(`Failed to generate questions. Status: ${response.status}. ${errorData}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("No questions were returned by the function.");
      }

      console.log("Generated questions from Supabase via Context:", data);
      setQuizQuestions(data);
      navigate('/quiz'); // Navigate on success

    } catch (error) {
      console.error("Error generating questions in Context:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      setQuestionError(
        `Unable to generate questions. Please try again. Error: ${errorMessage}`
      );
      // Optionally navigate to an error page or stay on settings page
      // navigate('/quiz'); // Can still navigate to show the error on the quiz page if desired
    } finally {
      setIsGeneratingQuestions(false);
    }
  }, [navigate, setQuizQuestions, setIsGeneratingQuestions, setQuestionError, setQuizSettingsState]); // Add dependencies

  const clearQuizData = useCallback(() => {
    setQuizSettingsState(null);
    setQuizQuestions([]);
    setIsGeneratingQuestions(false);
    setQuestionError(null);
    // Clear results when starting a new quiz setup
    setQuizScore(null);
    setTotalQuestions(null);
    setTimeSpent(null);
    setSavedQuizId(null); // Reset saved ID
  }, [setQuizSettingsState, setQuizQuestions, setIsGeneratingQuestions, setQuestionError, setQuizScore, setTotalQuestions, setTimeSpent, setSavedQuizId]); // Add all relevant setters

  // Function to set results in context - Memoized
  // Add questionsWithAnswers parameter with specific type
  const setQuizResults = useCallback((score: number, questionsCount: number, time: number, questionsWithAnswers: SavedQuestion[]) => {
    setQuizScore(score);
    setTotalQuestions(questionsCount);
    setTimeSpent(time);
    // Optionally clear questions/settings here if desired after results are set
    // Optionally clear questions/settings here if desired after results are set
    // setQuizQuestions([]);
    // setQuizSettingsState(null); // Decide if settings should be cleared here

    // --- Save the result to Supabase ---
    if (user && quizSettings) {
      const quizData: QuizHistoryItem = {
        user_id: user.id,
        date: new Date().toISOString(),
        topic: quizSettings.topic, // Use topic field
        category: quizSettings.category ?? null, // Use category field, defaulting to null
        score: score,
        total_questions: questionsCount,
        time_taken: time,
        difficulty: quizSettings.difficulty,
        // Use the passed questionsWithAnswers array
        questions: questionsWithAnswers,
      };

      // Add detailed logging before saving
      console.log('Attempting to save quiz result with data:', JSON.stringify(quizData, null, 2));

      saveQuizResult(quizData)
        .then(savedResult => {
          console.log('Quiz result saved successfully:', savedResult);
          if (savedResult && savedResult.id) {
            setSavedQuizId(savedResult.id); // Store the ID
            console.log('Saved Quiz ID:', savedResult.id);
          } else {
             console.warn('Saved result did not contain an ID.');
             setSavedQuizId(null); // Ensure it's null if saving failed or ID missing
          }
        })
        .catch(error => {
          console.error('Error saving quiz result:', error);
          setSavedQuizId(null); // Ensure it's null on error
          // Optionally show error notification to user
        });
    } else {
      console.warn('Cannot save quiz result: User or quiz settings missing.');
    }
    // --- End save logic ---

  }, [setQuizScore, setTotalQuestions, setTimeSpent, user, quizSettings, setSavedQuizId]); // Removed saveQuizResult, added setSavedQuizId

  // Memoize the context value object itself
  const value = useMemo(() => ({
    quizSettings,
    setQuizSettings, // Pass memoized function
    quizQuestions,
    setQuizQuestions, // Pass original setter if needed, or wrap if complex logic added
    isGeneratingQuestions,
    questionError,
    generateQuestions, // Pass memoized function
    clearQuizData, // Pass memoized function
    quizScore,
    totalQuestions,
    timeSpent,
    setQuizResults, // Pass memoized function
    savedQuizId, // Expose saved ID
    // Add centralized options to the value
    categoriesByTopic,
    availableTopics,
    availableDifficulties,
  }), [
    quizSettings, setQuizSettings, quizQuestions, setQuizQuestions,
    isGeneratingQuestions, questionError, generateQuestions, clearQuizData,
    quizScore, totalQuestions, timeSpent, setQuizResults, savedQuizId,
    // Add dependencies for the new values (they are constant, but good practice)
    categoriesByTopic, availableTopics, availableDifficulties,
  ]); // Include all values/functions in dependency array

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
};

// Create a custom hook for using the context
export const useQuiz = (): QuizContextProps => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
