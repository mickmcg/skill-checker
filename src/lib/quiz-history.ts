import { supabase } from "./supabase";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js"; // Import for type safety

// Define the structure of the question data as it should be saved
export type SavedQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string | null;
};

export type QuizHistoryItem = {
  id?: string;
  user_id: string;
  date: string;
  topic: string; // Renamed from subject
  category: string | null; // Changed from optional string
  score: number;
  total_questions: number;
  time_taken: number;
  difficulty: "easy" | "medium" | "hard";
  questions?: SavedQuestion[]; // Use the specific type
};

// Define a type for the filters
export type HistoryFiltersType = {
  search: string;
  topic: string; // 'all' or specific topic
  difficulty: string; // 'all', 'easy', 'medium', 'hard'
  sortBy: string; // 'newest', 'oldest', 'highest', 'lowest'
  dateRange: string; // 'all-time', 'today', 'this-week', 'this-month', 'this-year'
};

// Helper function to apply filters to a Supabase query
const applyHistoryFilters = (
  query: PostgrestFilterBuilder<any, any, any>, // Use a more specific type if schema is generated
  userId: string,
  filters?: HistoryFiltersType // Make filters optional to handle undefined case
): PostgrestFilterBuilder<any, any, any> => {
  query = query.eq("user_id", userId);

  // Only apply filters if the filters object is provided
  if (filters) {
    // Difficulty Filter (from activeTab)
    if (filters.difficulty && filters.difficulty !== "all") {
      query = query.eq("difficulty", filters.difficulty);
    }

    // Topic Filter
    if (filters.topic && filters.topic !== "all") {
      // Assuming 'topic' in filters is the exact topic name or a substring
      // Use ilike for case-insensitive partial matching if needed, or eq for exact match
      query = query.ilike("topic", `%${filters.topic}%`);
    }

    // Search Filter (Topic or Category)
    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      // Use 'or' condition to search in both topic and category
      query = query.or(`topic.ilike.${searchTerm},category.ilike.${searchTerm}`);
    }

    // Date Range Filter
    if (filters.dateRange && filters.dateRange !== "all-time") {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let startDate: Date | null = null;

    switch (filters.dateRange) {
      case "today":
        startDate = todayStart;
        break;
      case "this-week":
        startDate = new Date(todayStart);
        startDate.setDate(todayStart.getDate() - todayStart.getDay()); // Assuming Sunday is the start of the week
        break;
      case "this-month":
        startDate = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);
        break;
      case "this-year":
        startDate = new Date(todayStart.getFullYear(), 0, 1);
        break;
    }

    if (startDate) {
      // Ensure the date is formatted correctly for Supabase (ISO 8601)
      query = query.gte("date", startDate.toISOString());
    }
  }
} // End of check for filters object

  return query;
};


export async function getUserQuizHistory(
  userId: string,
  page: number = 1,
  pageSize: number = 10,
  filters: HistoryFiltersType // Add filters parameter
) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("quiz_history")
    .select("*", { count: "exact" }); // Fetch total count

  // Apply common filters
  query = applyHistoryFilters(query, userId, filters);

  // Apply Sorting
  switch (filters.sortBy) {
    case "oldest":
      query = query.order("date", { ascending: true });
      break;
    case "highest":
      query = query.order("score", { ascending: false });
      break;
    case "lowest":
      query = query.order("score", { ascending: true });
      break;
    case "newest": // Default case
    default:
      query = query.order("date", { ascending: false });
      break;
  }

  // Apply pagination range *after* filtering and sorting
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) throw error;
  // Ensure count is not null, default to 0 if it is
  // Count returned here is the total count *after* filters are applied
  return { data: data || [], count: count ?? 0 };
}

export async function saveQuizResult(quizData: QuizHistoryItem) {
  // Directly insert quizData, assuming it now has topic and category fields
  // matching the database columns.
  const { data, error } = await supabase
    .from("quiz_history")
    .insert(quizData) // Insert the original quizData
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Function to get aggregate stats for the history, now accepting filters
export async function getQuizHistoryAggregates(userId: string, filters: HistoryFiltersType) {

  let query = supabase
    .from("quiz_history")
    // Select only needed columns + count. head: false is important to get data for calculation.
    .select("score, total_questions, time_taken", { count: "exact", head: false });

  // Apply common filters
  query = applyHistoryFilters(query, userId, filters);

  const { data, error, count } = await query;

  if (error) {
      console.error("Error fetching aggregates:", error);
      throw error;
  }

  // Calculate aggregates client-side for now
  // TODO: Consider moving aggregation to a database function for performance
  const totalScoreSum = data?.reduce((sum, item) => sum + item.score, 0) ?? 0;
  const totalQuestionsSum = data?.reduce((sum, item) => sum + item.total_questions, 0) ?? 0;
  const totalTimeSum = data?.reduce((sum, item) => sum + item.time_taken, 0) ?? 0;
  const totalCount = count ?? 0; // Total number of quizzes

  return {
    totalCount,
    totalScoreSum,
    totalQuestionsSum,
    totalTimeSum,
    averageScore: totalCount > 0 ? (totalScoreSum / totalQuestionsSum) * 100 : 0,
    averageTimeSeconds: totalCount > 0 ? totalTimeSum / totalCount : 0,
  };
}
