import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getGameCommentary = async (score: number): Promise<string> => {
  try {
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