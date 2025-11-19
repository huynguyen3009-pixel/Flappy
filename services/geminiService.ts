import { GoogleGenAI } from "@google/genai";

export const getGameCommentary = async (score: number): Promise<string> => {
  // Check if API Key exists before initializing to prevent runtime errors
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.warn("API_KEY is missing. Please set it in your .env file or environment variables.");
    return "Setup API_KEY to hear from Gemini!";
  }

  try {
    // Initialize lazily to allow the app to load even if key is missing initially
    const ai = new GoogleGenAI({ apiKey });
    
    // Select model based on task complexity - simple text generation
    const modelId = 'gemini-2.5-flash'; 

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `The user just finished a game of Flappy Bird. Their score was ${score}. 
      Give them a very short, witty, sarcastic, or encouraging remark based on their score.
      If score < 5: Roast them gently.
      If score > 5 and < 20: Encouraging but standard.
      If score > 20: Praise them as a god.
      Keep it under 20 words.`,
      config: {
        temperature: 1.2, // High creativity
        maxOutputTokens: 50,
      }
    });

    return response.text || "Game Over!";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Gemini is speechless at your performance.";
  }
};