import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import OpenAI from "https://esm.sh/openai@4.28.0";
// Define CORS headers directly in this file
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
  "Access-Control-Allow-Credentials": "true",
};

console.log(`Function "generate-quiz" up and running!`);

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 204, // No Content is more appropriate for OPTIONS
    });
  }

  // Set up headers for all responses
  const headers = new Headers({
    ...corsHeaders,
    "Content-Type": "application/json",
  });

  try {
    const {
      topic = "general knowledge",
      numberOfQuestions = 5,
      questions = numberOfQuestions,
      category = "",
      difficulty = "",
    } = await req.json();

    // Validate the number of questions
    const questionCount = Number(questions);
    if (isNaN(questionCount) || questionCount > 30) {
      return new Response(
        JSON.stringify({
          error: "Max questions is 30",
        }),
        {
          status: 400,
          headers,
        },
      );
    }

    // Get the OpenAI API key from environment variables
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          error: "OPENAI_API_KEY environment variable not set",
        }),
        {
          status: 400,
          headers,
        },
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    // Generate quiz questions using OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a quiz generator. Create ${numberOfQuestions} multiple-choice questions about ${topic}${category ? ` in the category of ${category}` : ""}. 
          IMPORTANT: ALL questions MUST be at ${difficulty || "easy"} difficulty level. Do not generate questions of any other difficulty level.
          
          For difficulty levels:
          - easy: Basic knowledge questions that most beginners would know
          - medium: Intermediate knowledge requiring some subject familiarity
          - hard: Advanced questions that only experts would likely answer correctly
          
          Each question should have 4 options with exactly one correct answer. 
          Format your response as a JSON object with a 'questions' array containing objects with the following structure:
          {
            "questions": [
              {
                "question": "Question text",
                "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
                "correctAnswer": "The correct option text",
                "category": "${category || "Subject category"}",
                "difficulty": "${difficulty || "easy"}"
              }
            ]
          }`,
        },
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    // Parse the response from OpenAI
    const content = response.choices[0]?.message?.content;
    if (!content) {
      return new Response(
        JSON.stringify({ error: "Failed to generate questions from OpenAI" }),
        {
          status: 400,
          headers,
        },
      );
    }

    // Parse the JSON response
    const parsedContent = JSON.parse(content);
    const generatedQuestions = parsedContent.questions || parsedContent || [];

    // If OpenAI returns an empty array, return an error
    if (!generatedQuestions || generatedQuestions.length === 0) {
      return new Response(
        JSON.stringify({
          error:
            "No questions were generated. Please try again with a different topic.",
        }),
        {
          status: 400,
          headers,
        },
      );
    }

    // Transform the questions to match the expected format in the frontend
    const formattedQuestions = generatedQuestions.map((q, index) => ({
      id: "q" + (index + 1),
      text: q.question,
      category: q.category,
      difficulty: q.difficulty,
      options: q.options.map((option, i) => ({
        id: "a" + (i + 1),
        text: option,
        isCorrect: option === q.correctAnswer,
      })),
    }));

    return new Response(JSON.stringify(formattedQuestions), {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error generating questions:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers,
    });
  }
});
