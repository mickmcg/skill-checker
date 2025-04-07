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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination"; // Import Pagination components
import { getUserQuizHistory, QuizHistoryItem, getQuizHistoryAggregates, HistoryFiltersType } from "../lib/quiz-history"; // Import the updated function, type, aggregates function, and filters type

// Define the structure of history items fetched from DB (matching schema)
interface HistoryItem { // This interface seems unused now, consider removing if QuizHistoryItem covers everything
  id: string;
  date: string; // Correct: timestamptz column
  topic: string; // Changed from subject
  category: string | null; // Added category
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
  topic: string; // Direct from DB
  category: string; // Direct from DB (or empty string if null)
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10); // Or your desired page size
  const [totalItems, setTotalItems] = useState(0);
  const [historyAggregates, setHistoryAggregates] = useState({
    totalCount: 0,
    averageScore: 0,
    averageTimeSeconds: 0,
    totalQuestionsSum: 0, // Added for the "Total Questions" card
  });
  const [aggregatesLoading, setAggregatesLoading] = useState(true); // Loading state for aggregates
  const [aggregatesError, setAggregatesError] = useState<string | null>(null); // Error state for aggregates


  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    search: "",
    topic: "all", // Renamed from subject
    sortBy: "newest",
    dateRange: "all-time",
    // Add difficulty from activeTab for consistency when passing to fetch functions
    difficulty: "all", // Initialize difficulty filter
  });

  // --- Data Fetching Effect ---
  useEffect(() => {
    const fetchHistory = async () => {
      console.log("HistorySection: useEffect triggered. User:", user); // Log user
      if (!user) {
        console.log("HistorySection: No user found, skipping fetch.");
        setIsLoading(false); // Not logged in, stop loading
        setLocalHistoryItems([]); // Clear any previous items
        return;
      }

      console.log("HistorySection: Starting fetch..."); // Log start
      setIsLoading(true);
      setFetchError(null);

      // Combine filters state and activeTab for the API call
      const combinedFilters: HistoryFiltersType = {
        ...filters,
        difficulty: activeTab, // Use activeTab for difficulty filter
      };
      console.log("HistorySection: Fetching history with filters:", combinedFilters); // Log filters

      try {
        // Fetch paginated data using the updated function with filters
        const { data, count } = await getUserQuizHistory(user.id, currentPage, pageSize, combinedFilters);

        // console.log("HistorySection: Supabase response - Error:", error); // Error is now thrown
        console.log("HistorySection: Supabase response - Data:", data); // Log data
        console.log("HistorySection: Supabase response - Count:", count); // Log count

        // Error handling is done via catch block

        // Update total items count
        setTotalItems(count ?? 0);

        // Format data for display using correct field names from QuizHistoryItem (imported type)
        const formattedData: FormattedHistoryItem[] = (data || []).map((item: QuizHistoryItem) => {
          // No parsing needed anymore, use direct fields
          return {
            id: item.id,
            date: new Date(item.date).toLocaleDateString(), // Use item.date
            topic: item.topic, // Use direct topic field
            category: item.category ?? '', // Use direct category field, default to empty string if null
            score: item.score,
            totalQuestions: item.total_questions,
            // Format time_taken (seconds) into MM:SS - Use item.time_taken
            timeTaken: `${Math.floor(item.time_taken / 60).toString().padStart(2, '0')}:${(item.time_taken % 60).toString().padStart(2, '0')}`,
            difficulty: item.difficulty,
          }; // Added closing brace for the returned object
        }); // Added closing parenthesis for the map function

        console.log("HistorySection: Formatted data:", formattedData); // Log formatted data
        console.log("HistorySection: Formatted data:", formattedData); // Log formatted data
        setLocalHistoryItems(formattedData);

      } catch (err) {
        // More detailed error logging
        console.error("HistorySection: Error caught during fetch:", err);
        if (err instanceof Error) {
          console.error("HistorySection: Error name:", err.name);
          console.error("HistorySection: Error message:", err.message);
          console.error("HistorySection: Error stack:", err.stack);
        }
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setFetchError(`Failed to load history: ${message}`);
        setLocalHistoryItems([]); // Clear items on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
    // Re-run when user, currentPage, pageSize, filters, or activeTab changes
  }, [user, currentPage, pageSize, filters, activeTab]);

  // --- Aggregates Fetching Effect ---
  useEffect(() => {
    const fetchAggregates = async () => {
      if (!user) {
        setHistoryAggregates({ totalCount: 0, averageScore: 0, averageTimeSeconds: 0, totalQuestionsSum: 0 });
        setAggregatesLoading(false);
        setAggregatesError(null);
        return;
      }

      setAggregatesLoading(true);
      setAggregatesError(null);

      // Combine filters state and activeTab for the API call
      const combinedFilters: HistoryFiltersType = {
        ...filters,
        difficulty: activeTab, // Use activeTab for difficulty filter
      };
      console.log("HistorySection: Fetching aggregates with filters:", combinedFilters); // Log filters

      try {
        // Fetch aggregates using the updated function with filters
        const aggregates = await getQuizHistoryAggregates(user.id, combinedFilters);
        setHistoryAggregates(aggregates);
      } catch (err) {
        console.error("HistorySection: Error fetching aggregates:", err);
        const message = err instanceof Error ? err.message : "An unknown error occurred";
        setAggregatesError(`Failed to load summary stats: ${message}`);
        // Keep previous aggregates or reset? Resetting might be clearer.
        setHistoryAggregates({ totalCount: 0, averageScore: 0, averageTimeSeconds: 0, totalQuestionsSum: 0 });
      } finally {
        setAggregatesLoading(false);
      }
    };

    fetchAggregates();
    // Re-run when user, filters, or activeTab changes
  }, [user, filters, activeTab]);


  // --- Filtering Logic ---
  // NOTE: Client-side filtering is no longer needed.
  // The `localHistoryItems` state now directly holds the filtered and paginated data
  // fetched from `getUserQuizHistory`.
  // const getFilteredHistoryItems = () => { ... }; // REMOVED
  // const filteredHistoryItems = getFilteredHistoryItems(); // REMOVED

  // --- Stats Calculation ---
  // NOTE: Stats are calculated based on aggregates fetched separately using filters.
  // The following calculations based on `filteredHistoryItems` are no longer needed for the summary cards.
  // const totalQuizzes = filteredHistoryItems.length;
  // const averageScore = ...
  // const totalQuestions = ...
  // const averageTime = ...

  // --- Pagination Logic ---
  const totalPages = Math.ceil(totalItems / pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Optional: Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };


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
                  {/* Use totalCount from aggregates */}
                  <p className="text-2xl font-bold text-foreground">{aggregatesLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : historyAggregates.totalCount}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center"> {/* Replaced bg-slate-50 */}
                  <BarChart3 className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  {/* Use averageScore from aggregates, round it */}
                  <p className="text-2xl font-bold text-foreground">{aggregatesLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${Math.round(historyAggregates.averageScore)}%`}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg flex flex-col items-center justify-center"> {/* Replaced bg-slate-50 */}
                  <Clock className="h-6 w-6 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Average Time</p>
                  {/* Use averageTimeSeconds from aggregates, format it */}
                  <p className="text-2xl font-bold text-foreground">
                    {aggregatesLoading ? <Loader2 className="h-6 w-6 animate-spin" /> :
                      `${Math.floor(historyAggregates.averageTimeSeconds / 60).toString().padStart(2, '0')}:${Math.round(historyAggregates.averageTimeSeconds % 60).toString().padStart(2, '0')}`
                    }
                  </p>
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
                  {/* Use totalQuestionsSum from aggregates */}
                  <p className="text-2xl font-bold text-foreground">{aggregatesLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : historyAggregates.totalQuestionsSum}</p>
                </div>
              </div>

              {/* Filters */}
              {/* Pass current filters state down */}
              <HistoryFilters
                currentFilters={filters} // Pass the current state
                onFilterChange={(newFilterValues) => {
                  setCurrentPage(1); // Reset page to 1 when filters change
                  setFilters(prevFilters => ({
                    ...prevFilters, // Keep existing filters like sortBy, dateRange
                  ...newFilterValues, // Update search, topic
                  // Difficulty is handled by activeTab, not part of this filter state update
                }));
              }} />

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

                {/* Pass localHistoryItems directly, as it's now filtered+paginated */}
                <TabsContent value="all" className="mt-0">
                  <HistoryList
                    historyItems={localHistoryItems}
                    // onSelectQuiz={onSelectQuiz} // Remove if not implemented/needed
                  />
                </TabsContent>
                <TabsContent value="easy" className="mt-0">
                  <HistoryList
                    historyItems={localHistoryItems}
                    // onSelectQuiz={onSelectQuiz}
                  />
                </TabsContent>
                <TabsContent value="medium" className="mt-0">
                  <HistoryList
                    historyItems={localHistoryItems}
                    // onSelectQuiz={onSelectQuiz}
                  />
                </TabsContent>
                <TabsContent value="hard" className="mt-0">
                  <HistoryList
                    historyItems={localHistoryItems}
                    // onSelectQuiz={onSelectQuiz}
                  />
                </TabsContent>
              </Tabs>

              {/* Show empty state message if filters result in no items */}
              {localHistoryItems.length === 0 && !isLoading && ( // Check isLoading to avoid flicker
                <div className="text-center py-8 border border-dashed border-border rounded-lg"> {/* Use theme border */}
                  <p className="text-muted-foreground">
                    No quiz history matches your current filters.
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setFilters({
                        search: "",
                        topic: "all", // Renamed from subject
                        sortBy: "newest",
                        dateRange: "all-time",
                        difficulty: "all", // Add difficulty back when resetting
                      });
                      setActiveTab("all"); // Also reset the active tab visually
                    }}
                  >
                    Clear all filters
                  </Button>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center pt-4">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePreviousPage();
                          }}
                          aria-disabled={currentPage <= 1}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {/* Basic page number rendering - can be enhanced */}
                      {[...Array(totalPages)].map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(i + 1);
                            }}
                            isActive={currentPage === i + 1}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      {/* Add Ellipsis logic if needed for many pages */}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNextPage();
                          }}
                          aria-disabled={currentPage >= totalPages}
                          className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
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
