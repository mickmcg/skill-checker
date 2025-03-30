import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { getMockQuestions } from "./MockQuizData";
import Header from "./Header";
import SubjectSelector from "./SubjectSelector";
import QuizSettings from "./QuizSettings";
import QuizInterface from "./QuizInterface";
import ResultsSummary from "./ResultsSummary";
import HistorySection from "./HistorySection";
import AuthForms from "./AuthForms";
import { useAuth } from "../context/AuthContext";
import { saveQuizResult, getUserQuizHistory } from "../lib/quiz-history";
import { QuizHistoryItem } from "../lib/quiz-history";
import { supabase } from "../lib/supabase";

type AppState = "home" | "settings" | "quiz" | "results" | "history" | "login";

// Define QuizSettingsType locally since it's not exported from QuizSettings
interface QuizSettingsType {
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  numberOfQuestions: number;
  timeLimit: number;
}

const Home = () => {
  const [appState, setAppState] = useState<AppState>("home");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [quizSettings, setQuizSettings] = useState<QuizSettingsType | null>(
    null,
  );
  const [quizScore, setQuizScore] = useState<{
    score: number;
    timeSpent: number;
  } | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const { user } = useAuth();

  // Fetch user's quiz history when they log in
  useEffect(() => {
    if (user) {
      fetchUserHistory();
    }
  }, [user]);

  const fetchUserHistory = async () => {
    if (!user) return;

    setLoadingHistory(true);
    try {
      const history = await getUserQuizHistory(user.id);
      setQuizHistory(history);
    } catch (error) {
      console.error("Error fetching quiz history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // State for quiz questions
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionError, setQuestionError] = useState<string | null>(null);

  // Function to generate questions using the Supabase Edge Function
  const generateQuestions = async (
    subject: string,
    numberOfQuestions: number = 5,
    difficulty: string = "medium",
  ) => {
    setIsGeneratingQuestions(true);
    setQuestionError(null);

    try {
      console.log("Calling Supabase Edge Function to generate questions");

      // Call the Supabase Edge Function
      // Directly call the Supabase Edge Function using fetch
      const response = await fetch("https://tggxsfowwjarzuexohxj.supabase.co/functions/v1/supabase-functions-generate-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: subject,
          numberOfQuestions: numberOfQuestions,
          difficulty: difficulty,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("No questions were returned");
      }

      console.log("Generated questions from Supabase:", data);
      setQuizQuestions(data);
      return data;
    } catch (error) {
      console.error("Error generating questions:", error);
      setQuestionError(
        "Unable to generate questions. Please try again or select a different subject. Error: " +
          (error instanceof Error ? error.message : String(error)),
      );
      throw error;
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  const handleSubjectSelect = (subject: string) => {
    setSelectedSubject(subject);
    setAppState("settings");
  };

  const handleStartQuiz = async (settings: QuizSettingsType) => {
    setQuizSettings(settings);

    // Generate questions based on the selected subject and difficulty
    try {
      await generateQuestions(
        settings.subject,
        settings.numberOfQuestions,
        settings.difficulty,
      );
      setAppState("quiz");
    } catch (error) {
      console.error("Error starting quiz:", error);
      setAppState("quiz"); // Still go to quiz page to show the error message
    }
  };

  const handleQuizComplete = async (score: number, timeSpent: number) => {
    setQuizScore({ score, timeSpent });

    // Save quiz result to database if user is logged in
    if (user && quizSettings) {
      try {
        const quizData: QuizHistoryItem = {
          user_id: user.id,
          date: new Date().toISOString(),
          subject: quizSettings.subject,
          score: score,
          total_questions: quizQuestions.length || 0,
          time_taken: timeSpent,
          difficulty: quizSettings.difficulty,
          questions: quizQuestions.map((q) => ({
            ...q,
            userAnswer: q.options.find((o) => o.isCorrect)?.id || null,
          })),
        };

        await saveQuizResult(quizData);
        // Refresh history after saving
        fetchUserHistory();
      } catch (error) {
        console.error("Error saving quiz result:", error);
      }
    }

    setAppState("results");
  };

  const handleReturnHome = () => {
    setAppState("home");
    setSelectedSubject("");
    setQuizSettings(null);
    setQuizScore(null);
  };

  const handleRetryQuiz = () => {
    setAppState("quiz");
    setQuizScore(null);
  };

  const handleNewQuiz = () => {
    setAppState("home");
    setSelectedSubject("");
    setQuizSettings(null);
    setQuizScore(null);
  };

  const handleViewHistory = () => {
    if (!user) {
      setAppState("login");
      return;
    }
    fetchUserHistory();
    setAppState("history");
  };

  const handleNavigate = (destination: string) => {
    setAppState(destination as AppState);
  };

  const handleAuthSuccess = () => {
    setAppState("home");
  };

  const renderContent = () => {
    switch (appState) {
      case "home":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Skill Checker
              </h1>
              <p className="text-xl text-gray-600">
                Test your knowledge with AI-generated quizzes on any subject.
                Select a topic below to get started.
              </p>
              {user && (
                <p className="mt-2 text-primary font-medium">
                  Hello, {user.email}! Your progress will be saved.
                </p>
              )}
            </div>
            <SubjectSelector onSubjectSelect={handleSubjectSelect} />
          </motion.div>
        );

      case "settings":
        return (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <QuizSettings
              onStartQuiz={handleStartQuiz}
              selectedSubject={selectedSubject}
            />
          </motion.div>
        );

      case "quiz":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8"
          >
            {isGeneratingQuestions ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
                <p className="text-lg font-medium">
                  Generating quiz questions...
                </p>
              </div>
            ) : questionError ? (
              <div className="flex flex-col items-center justify-center h-64 p-6 bg-red-50 rounded-lg">
                <div className="text-red-600 mb-4 text-xl">⚠️</div>
                <p className="text-lg font-medium text-red-600 mb-2">
                  Error generating questions
                </p>
                <p className="text-gray-600 mb-4">{questionError}</p>
                <div className="text-sm text-gray-500 mb-4 p-4 bg-gray-100 rounded overflow-auto max-w-full">
                  <p>
                    This is likely a CORS issue with the Supabase Edge Function.
                  </p>
                  <p>
                    Please check the browser console for detailed error
                    messages.
                  </p>
                </div>
                <Button onClick={() => setAppState("settings")}>
                  Go Back to Settings
                </Button>
              </div>
            ) : (
              <QuizInterface
                questions={quizQuestions.length > 0 ? quizQuestions : []}
                timeLimit={quizSettings?.timeLimit || 30}
                onComplete={handleQuizComplete}
                showFeedback={false}
              />
            )}
          </motion.div>
        );

      case "results":
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <ResultsSummary
              score={quizScore?.score || 0}
              totalQuestions={quizQuestions.length || 3}
              timeTaken={quizScore?.timeSpent || 0}
              subject={quizSettings?.subject || "General Knowledge"}
              correctAnswers={quizScore?.score || 0}
              onRetry={handleRetryQuiz}
              onNewQuiz={handleNewQuiz}
              onViewHistory={handleViewHistory}
              onReturnHome={handleReturnHome}
            />
          </motion.div>
        );

      case "history":
        return (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <HistorySection
              onNavigate={handleNavigate}
              onSelectQuiz={(quizId) => console.log(`Selected quiz: ${quizId}`)}
              historyItems={quizHistory.map((item) => ({
                id: item.id || "",
                date: item.date,
                subject: item.subject,
                score: item.score,
                totalQuestions: item.total_questions,
                timeTaken: `${Math.floor(item.time_taken / 60)}:${(item.time_taken % 60).toString().padStart(2, "0")}`,
                difficulty: item.difficulty,
              }))}
              isLoading={loadingHistory}
            />
          </motion.div>
        );

      case "login":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6">
                Login or Create Account
              </h2>
              <AuthForms onSuccess={handleAuthSuccess} />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        activePage={
          appState === "history"
            ? "history"
            : appState === "home"
              ? "home"
              : undefined
        }
        onViewHistory={handleViewHistory}
      />
      <main className="flex-1">{renderContent()}</main>
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          <p>
            © 2023 Skill Checker - Test your knowledge with AI-generated
            quizzes
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
