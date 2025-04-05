import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, ArrowUpDown } from 'lucide-react'; // Import ArrowLeft and ArrowUpDown
import Header from './Header'; // Import the Header component
// Import useQuiz and centralized options
// Import availableDifficulties directly for type checking
import { useQuiz, categoriesByTopic, availableTopics, availableDifficulties } from '@/context/QuizContext';
import { Button } from '@/components/ui/button'; // Import Button for sortable headers
import { useMemo } from 'react'; // Import useMemo for sorting
import { useLocation, useNavigate } from 'react-router-dom'; // Import hooks for URL manipulation


// Update interface for new data fields
interface LeaderboardEntry {
  rank: number;
  user_display_name: string;
  avg_percentage: number; // Changed from score
  quiz_count: number;
  total_questions_answered: number;
  user_id: string;
}

// Type for sorting state
type SortColumn = 'rank' | 'user_display_name' | 'avg_percentage' | 'quiz_count' | 'total_questions_answered';
type SortDirection = 'asc' | 'desc';

// Derive Difficulty type from imported constant
type Difficulty = typeof availableDifficulties[number];

// Mock data removed, will use data from QuizContext

// Define constants for the "All" filter options
const ALL_TOPICS_VALUE = "__ALL_TOPICS__";
const ALL_CATEGORIES_VALUE = "__ALL_CATEGORIES__"; // Keep existing one
const ALL_DIFFICULTIES_VALUE = "__ALL_DIFFICULTIES__";

export function Leaderboard() {
  // Get available options from context
  const {
    availableTopics: contextTopics,
    categoriesByTopic: contextCategoriesByTopic,
    availableDifficulties: contextDifficulties,
  } = useQuiz();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // Initialize state to default to "All" options
  const [selectedTopic, setSelectedTopic] = useState<string>(ALL_TOPICS_VALUE);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_VALUE);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(ALL_DIFFICULTIES_VALUE);
  // Add state for sorting
  const [sortColumn, setSortColumn] = useState<SortColumn>('avg_percentage'); // Default sort by avg %
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc'); // Default descending

  const location = useLocation(); // Get current location
  const navigate = useNavigate(); // Get navigate function

  // Get current categories based on selected topic (only relevant if a specific topic is chosen)
  const currentCategories = selectedTopic === ALL_TOPICS_VALUE
    ? [] // No specific categories if "All Topics" is selected
    : contextCategoriesByTopic[selectedTopic] || [];

  // Effect to reset category if the selected topic changes and the category becomes invalid
  useEffect(() => {
    // Only reset if a specific topic is selected AND the current category isn't "All" or valid for the topic
    if (selectedTopic !== ALL_TOPICS_VALUE && selectedCategory !== ALL_CATEGORIES_VALUE && !currentCategories.includes(selectedCategory)) {
      setSelectedCategory(ALL_CATEGORIES_VALUE); // Reset to "All Categories"
    }
    // If "All Topics" is selected, ensure "All Categories" is also selected
    if (selectedTopic === ALL_TOPICS_VALUE && selectedCategory !== ALL_CATEGORIES_VALUE) {
       setSelectedCategory(ALL_CATEGORIES_VALUE);
    }
  }, [selectedTopic, selectedCategory, currentCategories]);

  // Effect to initialize filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topicFromUrl = params.get('topic');
    const categoryFromUrl = params.get('category');
    const difficultyFromUrl = params.get('difficulty');

    // Validate and set topic
    if (topicFromUrl && contextTopics.includes(topicFromUrl)) {
      setSelectedTopic(topicFromUrl);
    } else {
      setSelectedTopic(ALL_TOPICS_VALUE); // Default to All if invalid/missing
    }

    // Validate and set category (depends on topic)
    // Note: This logic might need refinement if category depends on the *initial* topic from URL
    const initialTopicCategories = topicFromUrl && contextCategoriesByTopic[topicFromUrl]
      ? contextCategoriesByTopic[topicFromUrl]
      : [];
    if (categoryFromUrl && topicFromUrl !== ALL_TOPICS_VALUE && initialTopicCategories.includes(categoryFromUrl)) {
      setSelectedCategory(categoryFromUrl);
    } else {
      setSelectedCategory(ALL_CATEGORIES_VALUE); // Default to All
    }

    // Validate and set difficulty
    // Check if the value from URL is one of the valid difficulties
    const isValidDifficulty = (value: string | null): value is Difficulty => {
      return availableDifficulties.includes(value as Difficulty);
    };

    if (isValidDifficulty(difficultyFromUrl)) {
      setSelectedDifficulty(difficultyFromUrl);
    } else {
      setSelectedDifficulty(ALL_DIFFICULTIES_VALUE); // Default to All if invalid/missing
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount


  // Effect to update URL query params when filters change
  useEffect(() => {
    const params = new URLSearchParams(location.search); // Start with existing params if any

    if (selectedTopic !== ALL_TOPICS_VALUE) {
      params.set('topic', selectedTopic);
    } else {
      params.delete('topic'); // Remove if 'All'
    }

    if (selectedCategory !== ALL_CATEGORIES_VALUE) {
      params.set('category', selectedCategory);
    } else {
      params.delete('category'); // Remove if 'All'
    }

    if (selectedDifficulty !== ALL_DIFFICULTIES_VALUE) {
      params.set('difficulty', selectedDifficulty);
    } else {
      params.delete('difficulty'); // Remove if 'All'
    }

    // Construct the new path with updated params
    const newPath = `${location.pathname}?${params.toString()}`;

    // Use replaceState to update URL without adding to history
    window.history.replaceState(null, '', newPath);

  }, [selectedTopic, selectedCategory, selectedDifficulty, location.pathname, location.search]);


  const fetchLeaderboard = useCallback(async () => {
    console.log("Leaderboard: Starting fetch..."); // Log start
    setLoading(true);
    setError(null);
    setLeaderboardData([]); // Clear previous data

    try {
      const rpcParams = {
        // Pass empty string if "All" is selected, otherwise pass the value
        p_topic: selectedTopic === ALL_TOPICS_VALUE ? '' : selectedTopic,
        p_category: selectedCategory === ALL_CATEGORIES_VALUE ? '' : selectedCategory,
        p_difficulty: selectedDifficulty === ALL_DIFFICULTIES_VALUE ? '' : selectedDifficulty,
        p_limit: 10, // Fetch top 10
      };
      console.log("Leaderboard: Calling RPC with params:", rpcParams); // Log params
      const { data, error: rpcError } = await supabase.rpc('get_leaderboard', rpcParams);

      console.log("Leaderboard: RPC response - Error:", rpcError); // Log error
      console.log("Leaderboard: RPC response - Data:", data); // Log data

      if (rpcError) {
        throw rpcError;
      }

      setLeaderboardData(data || []);
      console.log("Leaderboard: Data set successfully."); // Log success
    } catch (err: any) {
      console.error("Leaderboard: Error caught during fetch:", err); // Log caught error
      if (err instanceof Error) {
          console.error("Leaderboard: Error name:", err.name);
          console.error("Leaderboard: Error message:", err.message);
          console.error("Leaderboard: Error stack:", err.stack);
      }
      setError(`Failed to fetch leaderboard: ${err.message || 'Unknown error'}`);
    } finally {
      console.log("Leaderboard: Fetch finished."); // Log finish
      setLoading(false);
    }
  }, [selectedTopic, selectedCategory, selectedDifficulty]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]); // Re-fetch when filters change

  // Memoized sorted data
  const sortedLeaderboardData = useMemo(() => {
    const sorted = [...leaderboardData]; // Create a mutable copy
    sorted.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      let comparison = 0;
      if (valA > valB) {
        comparison = 1;
      } else if (valA < valB) {
        comparison = -1;
      }

      return sortDirection === 'desc' ? comparison * -1 : comparison;
    });
    return sorted;
  }, [leaderboardData, sortColumn, sortDirection]);

  // Handler for changing sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle direction if same column clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to descending (or ascending based on preference)
      setSortColumn(column);
      setSortDirection('desc'); // Default to desc for new column
    }
  };

  // Helper to render sort icon
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30" />;
    }
    return sortDirection === 'desc' ?
      <ArrowUpDown className="ml-2 h-4 w-4" /> : // Replace with specific down/up arrows if desired
      <ArrowUpDown className="ml-2 h-4 w-4" />; // Replace with specific down/up arrows if desired
  };


  return (
    // Replicate outer structure from HistorySection/QuizSettings
    <div className="space-y-4 flex flex-col min-h-screen bg-background">
      <Header />
      {/* Add main and wrapper div like other sections */}
      <main className="flex-grow">
        {/* Wrapper div handles max-width and padding */}
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
          {/* Header section like HistorySection */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")} // Navigate back
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Leaderboard</h1>
            </div>
            {/* Add any right-aligned elements here if needed */}
          </div>

          {/* Card no longer needs max-width or margin */}
          <Card className="w-full bg-card shadow-lg">
            {/* CardHeader removed */}
            {/* Remove default padding from CardContent as wrapper has p-6 */}
            <CardContent className="p-0">
              {/* Add inner padding/margin if needed, or adjust layout */}
              <div className="p-6 space-y-6"> {/* Added inner div with padding */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> {/* Removed mb-6 */}
                  {/* Topic Filter */}
                  <div>
            <Label htmlFor="topic-select">Topic</Label>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger id="topic-select">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent>
                {/* Add "All Topics" option */}
                <SelectItem value={ALL_TOPICS_VALUE}>All Topics</SelectItem>
                {/* Map over topics from context */}
                {contextTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {/* Capitalize topic names for display */}
                    {topic.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Filter */}
          <div>
            <Label htmlFor="category-select">Category (Optional)</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category-select">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {/* Use the constant value for "All Categories" */}
                <SelectItem value={ALL_CATEGORIES_VALUE}>All Categories</SelectItem>
                {/* Map over categories for the *currently selected* topic (disable if "All Topics" selected) */}
                {selectedTopic !== ALL_TOPICS_VALUE && currentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <Label htmlFor="difficulty-select">Difficulty</Label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger id="difficulty-select">
                <SelectValue placeholder="Select Difficulty" />
              </SelectTrigger>
              <SelectContent>
                {/* Add "All Difficulties" option */}
                <SelectItem value={ALL_DIFFICULTIES_VALUE}>All Difficulties</SelectItem>
                {/* Map over difficulties from context */}
                {contextDifficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {/* Capitalize difficulty names */}
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : leaderboardData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                {/* Make headers sortable */}
                <TableHead className="w-[70px]"> {/* Adjusted width */}
                   <Button variant="ghost" onClick={() => handleSort('rank')} className="px-1">
                     Rank {renderSortIcon('rank')}
                   </Button>
                </TableHead>
                <TableHead>
                   <Button variant="ghost" onClick={() => handleSort('user_display_name')} className="px-1">
                     User {renderSortIcon('user_display_name')}
                   </Button>
                </TableHead>
                <TableHead className="text-right">
                   <Button variant="ghost" onClick={() => handleSort('avg_percentage')} className="px-1">
                     Avg % {renderSortIcon('avg_percentage')}
                   </Button>
                </TableHead>
                <TableHead className="text-right">
                   <Button variant="ghost" onClick={() => handleSort('quiz_count')} className="px-1">
                     Quizzes {renderSortIcon('quiz_count')}
                   </Button>
                </TableHead>
                 <TableHead className="text-right">
                   <Button variant="ghost" onClick={() => handleSort('total_questions_answered')} className="px-1">
                     Questions {renderSortIcon('total_questions_answered')}
                   </Button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Use sorted data */}
              {sortedLeaderboardData.map((entry) => (
                <TableRow key={`${entry.user_id}-${entry.rank}`}>
                  <TableCell className="font-medium">{entry.rank}</TableCell>
                  <TableCell>{entry.user_display_name}</TableCell>
                  {/* Display new fields */}
                  <TableCell className="text-right">{entry.avg_percentage.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">{entry.quiz_count}</TableCell>
                  <TableCell className="text-right">{entry.total_questions_answered}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground mt-4">
            No scores found for the selected criteria.
                  </p>
                )}
              </div> {/* Close inner padded div */}
            </CardContent>
          </Card>
        </div> {/* Close wrapper div */}
      </main>
    </div> // Close outer layout div
  );
}
