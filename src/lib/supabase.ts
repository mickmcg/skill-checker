import { createClient } from "@supabase/supabase-js";

// Check if environment variables are available, otherwise use placeholder values for development
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://placeholder-project.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Only create the client if we have valid values
const createSupabaseClient = () => {
  if (
    supabaseUrl === "https://placeholder-project.supabase.co" ||
    supabaseAnonKey === "placeholder-anon-key"
  ) {
    console.warn("Supabase environment variables not set. Using mock client.");
    // Return a mock client that won't throw errors but won't work either
    return {
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: null }),
        getSession: () =>
          Promise.resolve({ data: { session: null }, error: null }),
        onAuthStateChange: (callback) => {
          // Return an object with a subscription property that has an unsubscribe method
          return {
            data: { subscription: { unsubscribe: () => {} } },
            error: null,
          };
        },
        signInWithPassword: () =>
          Promise.resolve({
            data: null,
            error: new Error("Supabase not configured"),
          }),
        signUp: () =>
          Promise.resolve({
            data: null,
            error: new Error("Supabase not configured"),
          }),
        signOut: () => Promise.resolve({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => Promise.resolve({ data: [], error: null }),
          order: () => ({
            eq: () => Promise.resolve({ data: [], error: null }),
          }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        update: () => ({
          eq: () =>
            Promise.resolve({
              data: null,
              error: new Error("Supabase not configured"),
            }),
        }),
      }),
    };
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();
