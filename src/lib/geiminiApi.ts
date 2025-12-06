import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

export const generateBlueprintResponse = async (userPrompt: string) => {
  try {

    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: userPrompt,
      config: {
        systemInstruction: `You are an expert Blueprint Architect for SprintPilot. 
        Your goal is to generate detailed, structured, and professional project blueprints based on the user's request.
        
        When a user asks for a blueprint (or any project advice), provide a response in the following Markdown format:
        
        ## Project Name: [Creative Name]
        
        ### Executive Summary
        [Brief overview of the project]
        
        ### Core Features
        - [Feature 1]: [Description]
        - [Feature 2]: [Description]
        - [Feature 3]: [Description]
        
        ### User Personas
        1. **[Persona Name]**: [Description & Goals]
        2. **[Persona Name]**: [Description & Goals]
        
        ### Technical Stack Recommendations
        - Frontend: [Suggestion]
        - Backend: [Suggestion]
        - Database: [Suggestion]
        
        Keep the tone professional, encouraging, and productive. If the user's request is vague, ask clarifying questions but still provide a preliminary blueprint concept.`,
      },
    });

    return result.text;
  } catch (error) {
    console.error("Error generating blueprint:", error);
    return "I apologize, but I encountered an error while generating your blueprint. Please try again later.";
  }
};
