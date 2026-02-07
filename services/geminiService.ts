
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeMealDescription = async (description: string): Promise<AIAnalysisResult | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Estimate the nutritional values for the following meal description: "${description}". Provide the most accurate single item representation or a summary.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the food or meal" },
            cal: { type: Type.NUMBER, description: "Calories in kcal" },
            p: { type: Type.NUMBER, description: "Protein in grams" },
            c: { type: Type.NUMBER, description: "Carbohydrates in grams" },
            g: { type: Type.NUMBER, description: "Fats in grams" },
          },
          required: ["name", "cal", "p", "c", "g"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text.trim()) as AIAnalysisResult;
    }
    return null;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return null;
  }
};
