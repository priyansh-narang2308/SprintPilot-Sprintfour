import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_API_KEY,
});

const model = "gemini-3-pro-preview";

const baseConfig = {
  thinkingConfig: {
    thinkingLevel: "HIGH",
  },
  responseMimeType: "text/plain",
};
