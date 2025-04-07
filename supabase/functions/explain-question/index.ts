import { serve } from "std/http/server.ts";
import OpenAI from "openai";
import { corsHeaders } from "../_shared/cors.ts"; // Import shared CORS headers

// Initialize OpenAI client
// Ensure OPENAI_API_KEY is set in Supabase Function Environment Variables
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

console.log("Explain Question Function Initialized");

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request");
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check if the request method is POST
    if (req.method !== "POST") {
      console.error("Invalid method:", req.method);
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse the request body
    let question: string | undefined;
    let answer: string | undefined;
    try {
      const body = await req.json();
      question = body.question;
      answer = body.answer;
      console.log("Received request body:", body);
    } catch (e) {
      console.error("Error parsing request body:", e);
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }


    // Validate input
    if (!question || typeof question !== "string" || !answer || typeof answer !== "string") {
      console.error("Invalid input:", { question, answer });
      return new Response(JSON.stringify({ error: "Missing or invalid 'question' or 'answer' in request body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Generating explanation for Question: "${question}", Answer: "${answer}"`);

    // --- Call OpenAI API ---
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert tutor. Explain why the given answer is correct for the provided question in a clear, concise, and helpful manner. Focus on the core concepts being tested. Do not just repeat the question and answer.",
          },
          {
            role: "user",
            content: `Question: ${question}\nCorrect Answer: ${answer}\n\nExplanation:`,
          },
        ],
        model: "gpt-3.5-turbo", // Or use a newer model if preferred
        temperature: 0.5, // Adjust for creativity vs. determinism
        max_tokens: 150, // Limit response length
      });

      const explanation = completion.choices[0]?.message?.content?.trim();

      if (!explanation) {
        console.error("OpenAI response missing content.");
        throw new Error("Failed to generate explanation from AI model.");
      }

      console.log("Successfully generated explanation:", explanation);

      // Return the explanation
      return new Response(JSON.stringify({ explanation }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (openaiError) {
        console.error("OpenAI API Error:", openaiError);
        let errorMessage = "Failed to communicate with AI model.";
        if (openaiError instanceof Error) {
            errorMessage = openaiError.message;
        }
        // Check for specific OpenAI error types if needed
        // if (openaiError.status === 401) errorMessage = "Invalid OpenAI API Key.";
        // if (openaiError.status === 429) errorMessage = "Rate limit exceeded.";

        return new Response(JSON.stringify({ error: `OpenAI Error: ${errorMessage}` }), {
            status: 500, // Internal Server Error or specific OpenAI error status
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Server Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

console.log("Explain Question Function Ready");
