import React, { useState, useEffect, useCallback, useRef } from "react"; // Added useRef
import { useParams, useNavigate } from "react-router-dom"; // Import hooks
import { supabase } from "../lib/supabase"; // Import supabase client
import { PostgrestSingleResponse } from '@supabase/supabase-js'; // Import Supabase type
import { cn } from "../lib/utils"; // Import cn for conditional classes
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card"; // Corrected path
import { Button } from "./ui/button"; // Corrected path
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./ui/dialog"; // Added Dialog components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs"; // Corrected path
import { Badge } from "./ui/badge"; // Corrected path
import { Separator } from "./ui/separator"; // Corrected path & already imported, ensure no duplicate
import {
  ArrowLeft,
  Clock,
  Award,
  CheckCircle,
  XCircle,
  BarChart,
  Loader2, // For loading state
  AlertCircle, // For error state
  Sparkles, // For AI button
} from "lucide-react";
import { Progress } from "./ui/progress"; // Corrected path
import Header from "./Header"; // Import Header

// Interface for the structure of questions stored in the JSONB column
interface StoredQuestion {
  id?: string;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string | null;
}

// Interface for the fetched quiz history record
interface QuizHistoryRecord {
  id: string;
  date: string; // timestamptz
  topic: string; // Changed from subject
  category: string | null; // Added category
  score: number;
  total_questions: number;
  time_taken: number; // seconds
  difficulty: string;
  questions: StoredQuestion[];
  user_id: string;
}

const QuizDetails: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState<QuizHistoryRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  // Removed unused state related to the single modal:
  // isModalOpen, selectedQuestionForModal, explanation, isExplanationLoading, explanationError
  // Removed unused fetchExplanation useCallback and its useEffect


  useEffect(() => {
    const fetchQuizDetails = async () => {
      if (!quizId) {
        setFetchError("No Quiz ID provided.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setFetchError(null);

      try {
        // Explicitly select columns and type the response
        const { data, error }: PostgrestSingleResponse<QuizHistoryRecord> = await supabase
          .from("quiz_history")
          // Select new topic and category columns
          .select("id, date, topic, category, score, total_questions, time_taken, difficulty, questions, user_id")
          .eq("id", quizId)
          .single(); // Fetch a single record

        if (error) {
          if (error.code === 'PGRST116') {
             throw new Error(`Quiz with ID ${quizId} not found.`);
          }
          throw error;
        }

        if (!data) {
            throw new Error(`Quiz with ID ${quizId} not found.`);
         }

         // Handle missing or invalid 'questions' data gracefully
         if (!data.questions || !Array.isArray(data.questions)) {
             console.warn("Fetched 'questions' data is missing or not an array:", data.questions, "Defaulting to empty array.");
             data.questions = []; // Default to empty array
         }

         setQuizData(data as QuizHistoryRecord);

      } catch (err) {
        console.error("Error fetching quiz details:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setFetchError(`Failed to load quiz details: ${message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizDetails();
  }, [quizId]);

  if (isLoading) {
    return (
       <div className="flex flex-col min-h-screen bg-background"> {/* Changed bg-gray-50 to bg-background */}
         <Header />
         <main className="flex-grow p-6 flex items-center justify-center">
           <Loader2 className="h-10 w-10 text-primary animate-spin" />
         </main>
       </div>
    );
  }

  if (fetchError) {
    return (
       <div className="flex flex-col min-h-screen bg-background"> {/* Changed bg-gray-50 to bg-background */}
         <Header />
         <main className="flex-grow p-6 flex flex-col items-center justify-center">
           <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
           <p className="text-lg text-red-600 mb-2">Error Loading Quiz Details</p>
           <p className="text-muted-foreground text-center mb-4">{fetchError}</p>
           <Button onClick={() => navigate('/history')}>Back to History</Button>
         </main>
       </div>
    );
  }

   if (!quizData) {
     return (
       <div className="flex flex-col min-h-screen bg-background"> {/* Changed bg-gray-50 to bg-background */}
         <Header />
         <main className="flex-grow p-6 flex items-center justify-center">
           <p>Quiz data not found.</p>
      </main>
    </div>
  );
}

// Destructure directly from quizData
const { topic, category, date, score, total_questions, time_taken, questions } = quizData;

// Safely calculate correct/incorrect answers, defaulting to 0 if questions are missing/empty
const validQuestions = Array.isArray(questions) ? questions : [];
   const correctAnswers = validQuestions.filter(
     (q) => q && q.userAnswer === q.correctAnswer, // Add check for q existence
   ).length;
   const scorePercentage = total_questions > 0 ? (score / total_questions) * 100 : 0;
   const incorrectAnswers = total_questions > 0 ? total_questions - correctAnswers : 0; // Ensure total_questions > 0

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-background"> {/* Changed bg-gray-50 to bg-background */}
      <Header />
      <main className="flex-grow p-6">
        <div className="max-w-7xl mx-auto"> {/* Changed max-w-4xl to max-w-7xl */}
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate("/history")} className="mr-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Button>
            <h1 className="text-2xl font-bold">Quiz Details</h1>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  {/* Display Topic (Category) directly */}
                  <CardTitle className="text-xl capitalize">
                    {topic.replace('-', ' ')}
                    {category && ` (${category})`} {/* Conditionally display category (if not null) */}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground"> {/* Use theme color */}
                    Completed on {new Date(date).toLocaleDateString()}
                  </p>
                </div>
                {/* Correct Badge variant and use theme colors */}
                <Badge
                  className={cn(
                      "text-lg px-3 py-1", // Keep size
                      // Use theme-aware success/destructive colors
                      scorePercentage >= 60 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  )}
                  // Use appropriate variants based on theme/design system
                  variant={scorePercentage >= 60 ? "default" : "destructive"} // Adjust variant if needed
                >
                  {score}/{total_questions} ({scorePercentage.toFixed(0)}%)
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-muted-foreground" /> {/* Use theme color */}
                  <div>
                    <p className="text-sm text-muted-foreground">Time Taken</p> {/* Use theme color */}
                    <p className="font-medium">{formatTime(time_taken)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-success" /> {/* Use theme color */}
                  <div>
                    <p className="text-sm text-muted-foreground">Correct Answers</p> {/* Use theme color */}
                    <p className="font-medium">{correctAnswers}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <XCircle className="h-5 w-5 mr-2 text-destructive" /> {/* Use theme color */}
                  <div>
                    <p className="text-sm text-muted-foreground">Incorrect Answers</p> {/* Use theme color */}
                    <p className="font-medium">{incorrectAnswers}</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-muted-foreground mb-2">Performance</p> {/* Use theme color */}
                <Progress value={scorePercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Removed the single Explanation Modal Dialog component from here */}


          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="mb-4">
             <TabsTrigger value="all">All Questions ({validQuestions.length})</TabsTrigger>
             <TabsTrigger value="correct" disabled={correctAnswers === 0}>
               Correct ({correctAnswers})
             </TabsTrigger>
             <TabsTrigger value="incorrect" disabled={incorrectAnswers === 0}>
               Incorrect ({incorrectAnswers})
             </TabsTrigger>
           </TabsList>

           {/* Remove extra arguments from renderQuestions calls */}
           <TabsContent value="all">
             {renderQuestions(validQuestions)}
           </TabsContent>

           <TabsContent value="correct">
             {renderQuestions(
               validQuestions.filter((q) => q && q.userAnswer === q.correctAnswer)
             )}
           </TabsContent>

           <TabsContent value="incorrect">
             {renderQuestions(
               validQuestions.filter((q) => q && q.userAnswer !== q.correctAnswer)
             )}
           </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/history")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to History
            </Button>
            <Button onClick={() => navigate("/")}>
              <Award className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};


// New component to handle fetching and displaying explanation within the modal
const ExplanationDialogContent = ({ question }: { question: StoredQuestion }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasFetchedRef = useRef(false); // Ref to track fetch status

  const fetchExplanationForContent = useCallback(async () => {
    // No need to check ref here, useEffect handles it
    setIsLoading(true);
    setExplanation(null);
    setError(null);
    try {
      console.log("Invoking Supabase function 'explain-question' for:", question.question);
      const { data: funcData, error: funcError } = await supabase.functions.invoke('explain-question', {
        body: { question: question.question, answer: question.correctAnswer },
      });

      if (funcError) {
        console.error("Supabase function invocation error:", funcError);
        let detailedError = funcError.message;
        try {
          const errorJson = JSON.parse(funcError.message);
          detailedError = errorJson.error || errorJson.message || funcError.message;
        } catch (_) { /* Ignore parsing error */ }
        throw new Error(detailedError);
      }

      if (!funcData || !funcData.explanation) {
        console.error("Invalid response from Supabase function:", funcData);
        throw new Error("Received no explanation from the AI function.");
      }

      console.log("Received explanation:", funcData.explanation);
      setExplanation(funcData.explanation);

    } catch (err) {
      console.error("Error fetching explanation:", err);
      const message = err instanceof Error ? err.message : "An unknown error occurred while fetching the explanation.";
      setError(`Failed to get explanation: ${message}`);
    } finally {
      setIsLoading(false);
    }
  // Only depend on the question object's relevant fields to avoid unnecessary refetches if the whole object reference changes
  }, [question.question, question.correctAnswer]);

  // Fetch explanation when the component mounts, prevent double fetch with ref
  useEffect(() => {
    // Only fetch if the ref is false (meaning fetch hasn't been initiated for this mount)
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true; // Set ref to true immediately
      fetchExplanationForContent();
    }
    // Dependency array still includes the fetch function,
    // but the ref prevents re-fetching on StrictMode double mount.
    // If the question prop itself changes, hasFetchedRef would need resetting,
    // but in this Dialog structure, the component remounts anyway.
  }, [fetchExplanationForContent]);

  return (
    <div className="py-4 min-h-[150px] max-h-[400px] overflow-y-auto">
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 text-primary animate-spin mr-2" />
          <span>Generating explanation...</span>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center h-full text-destructive">
          <AlertCircle className="h-8 w-8 mb-2" />
          <span>{error}</span>
          <Button variant="outline" size="sm" className="mt-4" onClick={fetchExplanationForContent}>
            Retry
          </Button>
        </div>
      )}
      {!isLoading && !error && explanation && (
        <p className="whitespace-pre-wrap">{explanation}</p>
      )}
    </div>
  );
};


// Modify renderQuestions function signature - remove state setters and fix syntax
const renderQuestions = (questions: StoredQuestion[]) => {
  if (!Array.isArray(questions)) {
      return <p>Question data is unavailable or invalid.</p>;
  }

  return (
    <div className="space-y-6">
      {questions.map((question, index) => {
        if (!question || typeof question.question !== 'string' || !Array.isArray(question.options)) {
            console.warn("Skipping invalid question object:", question);
            return null;
        }

        const isCorrect = question.userAnswer === question.correctAnswer;

        return (
          <Card
            key={question.id || `q-${index}`}
            className={`border-l-4 ${isCorrect ? "border-success" : "border-destructive"}`}
          >
            {/* Wrap CardContent and Trigger in Dialog */}
            <Dialog>
              <CardContent className="pt-6">
                 {/* Question Header with Explain Button */}
                 <div className="flex justify-between items-start mb-4">
                   <div>
                     <p className="font-medium mb-1">Question {index + 1}</p>
                     <p className="text-lg">{question.question}</p>
                   </div>
                   {/* Use DialogTrigger here */}
                   <DialogTrigger asChild>
                     <Button
                       variant="outline"
                       size="sm"
                       // Remove unused onClick logic
                       className="flex items-center gap-1"
                     >
                       <Sparkles className="h-4 w-4" />
                       Explain with AI
                     </Button>
                   </DialogTrigger>
                 </div>

                <div className="space-y-2 mb-4">
                {question.options.map((option, optIndex) => {
                  const userAnswer = question.userAnswer ?? null;
                  const correctAnswer = question.correctAnswer ?? null;
                  const isUserAnswer = userAnswer !== null && option === userAnswer;
                  const isCorrectAnswer = correctAnswer !== null && option === correctAnswer;
                  // Removed bgColor variable declaration

                  return (
                    <div
                      key={optIndex}
                      // Use cn for conditional theme-aware styling
                      className={cn(
                        "p-3 border rounded-md flex items-center", // Base styles
                        isCorrectAnswer && "bg-success/10 border-success/30", // Correct answer highlight
                        isUserAnswer && !isCorrectAnswer && "bg-destructive/10 border-destructive/30" // Incorrect user answer highlight
                      )}
                    >
                      <div className="w-6 h-6 rounded-full border flex items-center justify-center mr-3">
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <span className="flex-1 text-foreground">{option}</span> {/* Added text-foreground */}
                      {isUserAnswer && (
                        <span className="ml-auto">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

                {!isCorrect && question.correctAnswer && (
                  // Use theme-aware success colors
                  <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-md">
                    <p className="text-sm font-medium text-success flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                      Correct Answer: {question.correctAnswer}
                    </p>
                  </div>
                )}
              </CardContent>

              {/* Dialog Content for this specific question */}
              <DialogContent className="sm:max-w-[625px]">
                <DialogHeader>
                  <DialogTitle>AI Explanation</DialogTitle>
                  <DialogDescription>
                    Explanation for: "{question.question}"
                  </DialogDescription>
                </DialogHeader>
                <Separator />
                {/* Render the new component to handle fetching/display */}
                <ExplanationDialogContent question={question} />
                <Separator />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Close
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog> {/* Close the Dialog wrapper */}
          </Card>
        );
      })}
    </div>
  );
};

export default QuizDetails;
