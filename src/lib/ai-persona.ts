import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn(
    "VITE_GEMINI_API_KEY is not set. AI persona generation will not work."
  );
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

export type GeneratedPersona = {
  name: string;
  role: string;
  age: number;
  bio: string;
  goals: string[];
  frustrations: string[];
  motivations: string[];
  behaviors: string[];
};

export async function generatePersonaWithAI(
  productDescription: string
): Promise<GeneratedPersona> {
  if (!apiKey) {
    throw new Error(
      "VITE_GEMINI_API_KEY is not configured. Please add it to your .env file."
    );
  }

  const prompt = `You are an expert UX researcher. Based on the following product/service description, generate a detailed and realistic user persona. 
  
Product/Service: "${productDescription}"

Return the response as a valid JSON object with EXACTLY this structure (no markdown, no extra text):
{
  "name": "A realistic first and last name",
  "role": "A professional role or title that would use this product",
  "age": A number between 20 and 65,
  "bio": "A 2-3 sentence biography describing this person's background and context",
  "goals": ["goal 1", "goal 2", "goal 3"],
  "frustrations": ["frustration 1", "frustration 2", "frustration 3"],
  "motivations": ["motivation 1", "motivation 2", "motivation 3"],
  "behaviors": ["behavior 1", "behavior 2", "behavior 3"]
}

Make the persona realistic, detailed, and relevant to the product. Each array should have exactly 3 items.`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: prompt,
    });

    const responseText = result.text || "";

    if (!responseText) {
      throw new Error("No response from Gemini API");
    }

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not find JSON in response");
    }

    const persona = JSON.parse(jsonMatch[0]) as GeneratedPersona;

    if (
      !persona.name ||
      !persona.role ||
      !persona.bio ||
      !Array.isArray(persona.goals) ||
      !Array.isArray(persona.frustrations) ||
      !Array.isArray(persona.motivations) ||
      !Array.isArray(persona.behaviors)
    ) {
      throw new Error("Invalid persona structure in AI response");
    }

    return persona;
  } catch (error) {
    console.error("Error generating persona with AI:", error);
    throw error;
  }
}
