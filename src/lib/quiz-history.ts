import { supabase } from "./supabase";

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

export async function getUserQuizHistory(userId: string) {
  const { data, error } = await supabase
    .from("quiz_history")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
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
