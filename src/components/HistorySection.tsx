import React, { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, BarChart3, Clock, History, Loader2 } from "lucide-react";
import HistoryFilters from "./HistoryFilters";
import HistoryList from "./HistoryList";
import { useAuth } from "../context/AuthContext";

interface HistorySectionProps {
  onNavigate?: (destination: string) => void;
  onSelectQuiz?: (quizId: string) => void;
  historyItems?: Array<{
    id: string;
    date: string;
    subject: string;
    score: number;
    totalQuestions: number;
    timeTaken: string;
    difficulty: "easy" | "medium" | "hard";
  }>;
  isLoading?: boolean;
}

const HistorySection = ({
  onNavigate = () => {},
  onSelectQuiz = () => {},
  historyItems = [],
  isLoading = false,
}: HistorySectionProps) => {
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    search: "",
    subject: "all",
    sortBy: "newest",
    dateRange: "all-time",
  });

  const { user } = useAuth();

  // Filter history items based on active tab and filters
  const getFilteredHistoryItems = () => {
    let filtered = [...historyItems];

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter((item) => item.difficulty === activeTab);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter((item) =>
        item.subject.toLowerCase().includes(searchTerm),
      );
    }

    // Filter by subject
    if (filters.subject !== "all") {
      filtered = filtered.filter((item) =>
        item.subject.toLowerCase().includes(filters.subject.toLowerCase()),
      );
    }

    // Sort items
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest":
          return b.score - a.score;
        case "lowest":
          return a.score - b.score;
        default:
          return 0;
      }
    });

    // Filter by date range
    if (filters.dateRange !== "all-time") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.date);

        switch (filters.dateRange) {
          case "today":
            return itemDate >= today;
          case "this-week": {
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            return itemDate >= weekStart;
          }
          case "this-month": {
            const monthStart = new Date(
              today.getFullYear(),
              today.getMonth(),
              1,
            );
            return itemDate >= monthStart;
          }
          case "this-year": {
            const yearStart = new Date(today.getFullYear(), 0, 1);
            return itemDate >= yearStart;
          }
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredHistoryItems = getFilteredHistoryItems();

  // Stats for the summary section
  const totalQuizzes = historyItems.length;
  const averageScore =
    historyItems.length > 0
      ? Math.round(
          historyItems.reduce(
            (sum, item) => sum + (item.score / item.totalQuestions) * 100,
            0,
          ) / historyItems.length,
        )
      : 0;
  const totalQuestions = historyItems.reduce(
    (sum, item) => sum + item.totalQuestions,
    0,
  );

  // Calculate average time (assuming time format is MM:SS)
  const calculateAverageTime = () => {
    if (historyItems.length === 0) return "00:00";

    const totalSeconds = historyItems.reduce((sum, item) => {
      const [minutes, seconds] = item.timeTaken.split(":").map(Number);
      return sum + (minutes * 60 + seconds);
    }, 0);

    const avgSeconds = Math.round(totalSeconds / historyItems.length);
    const avgMinutes = Math.floor(avgSeconds / 60);
    const remainingSeconds = avgSeconds % 60;

    return `${avgMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const averageTime = calculateAverageTime();

  if (isLoading) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">
          Loading your quiz history...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("home")}
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Quiz History</h1>
          </div>
        </div>

        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground mb-4">
            Please log in to view your quiz history
          </p>
          <Button onClick={() => onNavigate("login")}>Log In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onNavigate("home")}
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Quiz History</h1>
        </div>
      </div>

      {historyItems.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <p className="text-lg text-muted-foreground mb-4">
            You haven't taken any quizzes yet
          </p>
          <Button onClick={() => onNavigate("home")}>
            Take Your First Quiz
          </Button>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <History className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Total Quizzes</p>
              <p className="text-2xl font-bold">{totalQuizzes}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <BarChart3 className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{averageScore}%</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <Clock className="h-6 w-6 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Average Time</p>
              <p className="text-2xl font-bold">{averageTime}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-primary mb-2"
              >
                <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              <p className="text-sm text-muted-foreground">Total Questions</p>
              <p className="text-2xl font-bold">{totalQuestions}</p>
            </div>
          </div>

          {/* Filters */}
          <HistoryFilters onFilterChange={setFilters} />

          {/* Tabs and History List */}
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="easy">Easy</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="hard">Hard</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0">
              <HistoryList
                historyItems={filteredHistoryItems}
                onSelectQuiz={onSelectQuiz}
              />
            </TabsContent>
            <TabsContent value="easy" className="mt-0">
              <HistoryList
                historyItems={filteredHistoryItems}
                onSelectQuiz={onSelectQuiz}
              />
            </TabsContent>
            <TabsContent value="medium" className="mt-0">
              <HistoryList
                historyItems={filteredHistoryItems}
                onSelectQuiz={onSelectQuiz}
              />
            </TabsContent>
            <TabsContent value="hard" className="mt-0">
              <HistoryList
                historyItems={filteredHistoryItems}
                onSelectQuiz={onSelectQuiz}
              />
            </TabsContent>
          </Tabs>

          {filteredHistoryItems.length === 0 && (
            <div className="text-center py-8 border border-dashed rounded-lg">
              <p className="text-muted-foreground">
                No quiz history matches your filters.
              </p>
              <Button
                variant="link"
                onClick={() => {
                  setFilters({
                    search: "",
                    subject: "all",
                    sortBy: "newest",
                    dateRange: "all-time",
                  });
                  setActiveTab("all");
                }}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HistorySection;
