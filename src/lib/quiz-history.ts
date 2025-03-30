import { supabase } from "./supabase";

export type QuizHistoryItem = {
  id?: string;
  user_id: string;
  date: string;
  subject: string;
  score: number;
  total_questions: number;
  time_taken: number;
  difficulty: "easy" | "medium" | "hard";
  questions?: any[];
};

export async function saveQuizResult(quizData: QuizHistoryItem) {
  const { data, error } = await supabase
    .from("quiz_history")
    .insert(quizData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserQuizHistory(userId: string) {
  const { data, error } = await supabase
    .from("quiz_history")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getQuizDetails(quizId: string) {
  const { data, error } = await supabase
    .from("quiz_history")
    .select("*")
    .eq("id", quizId)
    .single();

  if (error) throw error;
  return data;
}
