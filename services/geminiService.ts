import { GoogleGenAI, Type } from "@google/genai";

// Utility to convert a File object to a base64 string
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const analyzeCarDamage = async (images: File[], carModel: string): Promise<string[]> => {
  const imageParts = await Promise.all(images.map(fileToGenerativePart));
  const prompt = `
    You are an expert car mechanic and damage assessor. Analyze the following images of a damaged car, which is a ${carModel}.
    Identify every damaged part. Respond ONLY with a JSON array of strings, where each string is the name of a damaged part in Persian.
    For example: ["سپر جلو", "چراغ جلو راست", "گلگیر جلو راست"]
  `;
  
  const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts: [...imageParts, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
  });

  try {
    const resultText = response.text.trim();
    // Gemini can sometimes wrap the JSON in markdown backticks
    const cleanedJson = resultText.replace(/^```json\s*|```$/g, '');
    const parts = JSON.parse(cleanedJson);
    if (Array.isArray(parts) && parts.every(p => typeof p === 'string')) {
      return parts;
    }
    return [];
  } catch (error) {
    console.error("Error parsing damage analysis response:", error);
    return [];
  }
};


export const getPartsDetails = async (partNames: string[], carModel: string): Promise<any[]> => {
    if (partNames.length === 0) return [];
    
    const prompt = `
    You are an AI that simulates an auto parts price search engine for the Iranian market for a specific car model: ${carModel}. For the following list of car parts, provide estimated prices in Iranian Toman and an estimated labor cost for repair. 
    You MUST provide plausible prices from the Iranian market for the specified car model. Your response must be a JSON array of objects, where each object corresponds to a part from the input list. 
    Do not include any explanation. The JSON format for each object must be:
    {"name": "[Part Name in Persian]", "newPrice": [number], "usedPrice": [number], "repairCost": [number], "sourceUrl": "[a plausible but fake iranian auto part store URL for the part]"}
    Here is the list of parts: ${JSON.stringify(partNames)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        newPrice: { type: Type.INTEGER },
                        usedPrice: { type: Type.INTEGER },
                        repairCost: { type: Type.INTEGER },
                        sourceUrl: { type: Type.STRING }
                    },
                    required: ["name", "newPrice", "usedPrice", "repairCost", "sourceUrl"]
                }
            }
        }
    });

    try {
      const resultText = response.text.trim();
      const cleanedJson = resultText.replace(/^```json\s*|```$/g, '');
      const details = JSON.parse(cleanedJson);
      return details;
    } catch (error) {
      console.error("Error parsing part details response:", error);
      return [];
    }
};