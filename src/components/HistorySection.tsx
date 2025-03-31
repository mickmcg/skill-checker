import React, { useState, useEffect } from "react"; // Import useEffect
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ArrowLeft, BarChart3, Clock, History, Loader2, AlertCircle } from "lucide-react"; // Added AlertCircle
import HistoryFilters from "./HistoryFilters";
import HistoryList from "./HistoryList";
import Header from "./Header"; // Import Header component
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase"; // Import supabase client

// Define the structure of history items fetched from DB (matching schema)
interface HistoryItem {
  id: string;
  date: string; // Correct: timestamptz column
  subject: string;
  score: number;
  total_questions: number;
  time_taken: number; // Correct: int4 column for seconds
  difficulty: "easy" | "medium" | "hard";
  user_id: string;
}

// Define the structure expected by the HistoryList component
interface FormattedHistoryItem {
  id: string;
  date: string; // Formatted date string
  subject: string;
  score: number;
  totalQuestions: number; // Camel case
  timeTaken: string; // Formatted MM:SS string
  difficulty: "easy" | "medium" | "hard";
}

// Remove props interface, component will fetch its own data
// interface HistorySectionProps { ... }

const HistorySection = () => { // Removed props
  const navigate = useNavigate(); // Use navigate hook
  const { user } = useAuth();

  // Internal state for history data, loading, and errors
  const [localHistoryItems, setLocalHistoryItems] = useState<FormattedHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading initially
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    search: "",
    subject: "all",
    sortBy: "newest",
    dateRange: "all-time",
  });

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setIsLoading(false); // Not logged in, stop loading
        setLocalHistoryItems([]); // Clear any previous items
        return;
      }

      setIsLoading(true);
      setFetchError(null);

      try {
        // Correct Supabase query chaining - await the whole chain
        const query = supabase
          .from("quiz_history")
          .select("*")
          .eq("user_id", user.id)
          .order("date", { ascending: false }); // Correct column name: 'date'
        const { data, error } = await query; // Await the final query object

        if (error) {
          throw error;
        }

        // Format data for display using correct field names from HistoryItem
        const formattedData: FormattedHistoryItem[] = data.map((item: HistoryItem) => ({
          id: item.id,
          date: new Date(item.date).toLocaleDateString(), // Use item.date
          subject: item.subject,
          score: item.score,
          totalQuestions: item.total_questions,
          // Format time_taken (seconds) into MM:SS - Use item.time_taken
          timeTaken: `${Math.floor(item.time_taken / 60).toString().padStart(2, '0')}:${(item.time_taken % 60).toString().padStart(2, '0')}`,
          difficulty: item.difficulty,
        }));

        setLocalHistoryItems(formattedData);

      } catch (err) {
        console.error("Error fetching quiz history:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setFetchError(`Failed to load history: ${message}`);
        setLocalHistoryItems([]); // Clear items on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [user]); // Re-run when user changes

  // --- Filtering Logic ---
  // Filter history items based on active tab and filters
  const getFilteredHistoryItems = () => {
    // Use localHistoryItems state instead of prop
    let filtered = [...localHistoryItems];

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
          // Ensure dates are valid before comparing
          const dateB = new Date(b.date).getTime();
          const dateA = new Date(a.date).getTime();
          return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
        case "oldest":
          const dateAOld = new Date(a.date).getTime();
          const dateBOld = new Date(b.date).getTime();
          return (isNaN(dateAOld) ? 0 : dateAOld) - (isNaN(dateBOld) ? 0 : dateBOld);
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
        if (isNaN(itemDate.getTime())) return false; // Skip invalid dates

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

  // --- Stats Calculation ---
  // Use localHistoryItems state instead of prop
  const totalQuizzes = localHistoryItems.length;
  const averageScore =
    localHistoryItems.length > 0
      ? Math.round(
          localHistoryItems.reduce(
            (sum, item) => sum + (item.score / item.totalQuestions) * 100,
            0,
          ) / localHistoryItems.length,
        )
      : 0;
  // Use localHistoryItems state instead of prop
  const totalQuestions = localHistoryItems.reduce(
    (sum, item) => sum + item.totalQuestions,
    0,
  );

  // Calculate average time (using formatted MM:SS string)
  const calculateAverageTime = () => {
    // Use localHistoryItems state instead of prop
    if (localHistoryItems.length === 0) return "00:00";

    const totalSeconds = localHistoryItems.reduce((sum, item) => {
      // Parse the formatted MM:SS string back to seconds
      const timeParts = item.timeTaken.split(":");
      if (timeParts.length !== 2) return sum; // Skip if format is wrong
      const minutes = parseInt(timeParts[0], 10);
      const seconds = parseInt(timeParts[1], 10);
      if (isNaN(minutes) || isNaN(seconds)) return sum; // Skip if parsing fails
      return sum + (minutes * 60) + seconds;
    }, 0);


    const avgSeconds = Math.round(totalSeconds / localHistoryItems.length);
    const avgMinutes = Math.floor(avgSeconds / 60);
    const remainingSeconds = avgSeconds % 60;

    return `${avgMinutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const averageTime = calculateAverageTime();

  // --- Render Logic ---

  // Loading State
  if (isLoading && !fetchError) { // Only show loading if no error
    return (
      <div className="flex flex-col min-h-screen bg-background"> {/* Replaced bg-gray-50 */}
        <Header />
        <main className="flex-grow p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl mx-auto bg-card rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px]"> {/* Replaced bg-white */}
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <p className="text-lg text-muted-foreground">
              Loading your quiz history...
            </p>
          </div>
        </main>
      </div>
    );
  }


  // Not Logged In State (handled within the main return now for structure)
  // if (!user) { ... } // Removed separate return

  // Fetch Error State
  if (fetchError && !isLoading) { // Show error only if not loading
     return (
       <div className="flex flex-col min-h-screen bg-background"> {/* Replaced bg-gray-50 */}
         <Header />
         <main className="flex-grow p-6 flex items-center justify-center">
           <div className="w-full max-w-5xl mx-auto bg-card rounded-lg shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px]"> {/* Replaced bg-white */}
             <AlertCircle className="h-10 w-10 text-destructive mb-4" /> {/* Use theme color */}
             <p className="text-lg text-destructive mb-2">Error Loading History</p> {/* Use theme color */}
             <p className="text-muted-foreground text-center mb-4">{fetchError}</p>
             {/* Provide a way to retry or go home */}
             <Button onClick={() => window.location.reload()} className="mr-2">Try Again</Button>
             <Button variant="outline" onClick={() => navigate('/')}>Go Home</Button>
           </div>
         </main>
       </div>
     );
   }

  // --- Main Content Render ---
  return (
    // Removed p-4 from outer div, added p-6 to inner content div
    <div className="space-y-4 flex flex-col min-h-screen bg-background"> {/* Replaced bg-gray-50 */}
      <Header />
      {/* Removed padding from main, handled by wrapper */}
      <main className="flex-grow">
        {/* Changed max-w-3xl to max-w-7xl for wider content, added p-6 */}
        <div className="w-full max-w-7xl mx-auto bg-card rounded-lg shadow-sm p-6 space-y-6"> {/* Replaced bg-white */}
          {/* Header within the card */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")} // Use navigate hook
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Quiz History</h1> {/* Use theme color */}
            </div>
          </div>

          {/* Conditional Rendering based on user login status */}
          {!user ? (
             <div className="text-center py-16">
               <p className="text-lg text-muted-foreground mb-4">
                 Please log in to view your quiz history
               </p>
               <Button onClick={() => navigate("/login")}>Log In</Button>
             </div>
          ) : localHistoryItems.length === 0 ? (
            // Empty State (logged in, no history)
            <div className="text-center py-16 border border-dashed border-border rounded-lg"> {/* Use theme border */}
              <p className="text-lg text-muted-foreground mb-4">
                You haven't taken any quizzes yet
              </p>
              <Button onClick={() => navigate("/")}>
                Take Your First Quiz
              </Button>
            </div>
          ) : (
            // History Exists State
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center"> {/* Replaced bg-slate-50 */}
                  <History className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Total Quizzes</p>
                  <p className="text-2xl font-bold text-foreground">{totalQuizzes}</p> {/* Use theme color */}
                </div>

                <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center"> {/* Replaced bg-slate-50 */}
                  <BarChart3 className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-2xl font-bold text-foreground">{averageScore}%</p> {/* Use theme color */}
                </div>

                <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center"> {/* Replaced bg-slate-50 */}
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Average Time</p>
                  <p className="text-2xl font-bold text-foreground">{averageTime}</p> {/* Use theme color */}
                </div>

                <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center"> {/* Replaced bg-slate-50 */}
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
                  <p className="text-2xl font-bold text-foreground">{totalQuestions}</p> {/* Use theme color */}
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

                {/* Pass filtered items and remove onSelectQuiz if not used */}
                <TabsContent value="all" className="mt-0">
                  <HistoryList
                    historyItems={filteredHistoryItems}
                    // onSelectQuiz={onSelectQuiz} // Remove if not implemented/needed
                  />
                </TabsContent>
                <TabsContent value="easy" className="mt-0">
                  <HistoryList
                    historyItems={filteredHistoryItems}
                    // onSelectQuiz={onSelectQuiz}
                  />
                </TabsContent>
                <TabsContent value="medium" className="mt-0">
                  <HistoryList
                    historyItems={filteredHistoryItems}
                    // onSelectQuiz={onSelectQuiz}
                  />
                </TabsContent>
                <TabsContent value="hard" className="mt-0">
                  <HistoryList
                    historyItems={filteredHistoryItems}
                    // onSelectQuiz={onSelectQuiz}
                  />
                </TabsContent>
              </Tabs>

              {filteredHistoryItems.length === 0 && (
                <div className="text-center py-8 border border-dashed border-border rounded-lg"> {/* Use theme border */}
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
      </main>
    </div>
  );
};

export default HistorySection;
