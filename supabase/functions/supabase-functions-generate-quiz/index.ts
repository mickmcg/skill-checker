import { corsHeaders } from "../_shared/cors.ts";
import { OpenAI } from "https://esm.sh/openai@4.89.1";
console.log(`Function "generate-quiz" up and running!`);
// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY")
});
Deno.serve(async (req)=>{
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    // Default values
    let topic = "general knowledge";
    let numberOfQuestions = 5;
    let difficulty = "medium";
    let category = "";
    // Handle different HTTP methods
    if (req.method === "GET") {
      const url = new URL(req.url);
      topic = url.searchParams.get("topic") || topic;
      numberOfQuestions = Number(url.searchParams.get("numberOfQuestions") || numberOfQuestions);
      difficulty = url.searchParams.get("difficulty") || difficulty;
      category = url.searchParams.get("category") || category;
      console.log("GET params:", {
        topic,
        numberOfQuestions,
        difficulty,
        category
      });
    } else if (req.method === "POST") {
      try {
        const body = await req.json();
        topic = body.topic || topic;
        numberOfQuestions = Number(body.numberOfQuestions || numberOfQuestions);
        difficulty = body.difficulty || difficulty;
        category = body.category || category;
        console.log("POST body:", body);
      } catch (e) {
        console.error("Error parsing JSON body:", e);
      }
    }
    // Generate questions using OpenAI
    const prompt = `Generate ${numberOfQuestions} multiple-choice questions about ${topic} at ${difficulty} difficulty level. 
    Format the response as a JSON array of objects with the following structure:
    [
      {
        "id": "q1",
        "text": "Question text here?",
        "category": "${topic}",
        "difficulty": "${difficulty}",
        "options": [
          { "id": "a1", "text": "First option", "isCorrect": false },
          { "id": "a2", "text": "Second option", "isCorrect": true },
          { "id": "a3", "text": "Third option", "isCorrect": false },
          { "id": "a4", "text": "Fourth option", "isCorrect": false }
        ]
      }
    ]
    Ensure exactly one option is marked as correct for each question.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });
    // Parse the response to get the questions
    const content = response.choices[0].message.content;
    let questions;
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract JSON from response");
      }
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      console.log("Raw response:", content);
      throw new Error("Failed to parse questions from API response");
    }
    return new Response(JSON.stringify(questions), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
