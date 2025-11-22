import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const estimatePrintDetails = async (description: string): Promise<AIResponse | null> => {
  if (!apiKey) {
    console.warn("API Key is missing.");
    return null;
  }

  try {
    const modelId = "gemini-2.5-flash";
    
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Estime o peso em gramas (PLA padrão) e o tempo de impressão (FDM padrão, 60mm/s) para o seguinte objeto 3D: "${description}". Seja realista.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            estimatedWeightGrams: { type: Type.NUMBER, description: "Peso estimado em gramas" },
            estimatedTimeHours: { type: Type.NUMBER, description: "Tempo estimado em horas" },
            reasoning: { type: Type.STRING, description: "Breve explicação da estimativa" }
          },
          required: ["estimatedWeightGrams", "estimatedTimeHours", "reasoning"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text) as AIResponse;
  } catch (error) {
    console.error("Error estimating print details:", error);
    return null;
  }
};