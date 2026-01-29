
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from "@google/genai";
import { Incident, Resource, Language, ChatMessage } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simple in-memory cache for translations
const translationCache: Record<string, string> = {};

/**
 * Utility for exponential backoff retry logic
 */
const callWithRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  let lastError: any;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.message?.includes('429') || error?.status === 429;
      if (isRateLimit && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000 + Math.random() * 1000;
        console.warn(`Rate limit hit (429). Retrying in ${Math.round(delay)}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

const cleanJsonString = (text: string): string => {
  if (!text) return "[]";
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
};

export const getSafetyGuidelines = async (incidentType: string, severity: string, language: string = "English") => {
  try {
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 5 concise, actionable safety precautions for a ${incidentType} in ${language}. Severity: ${severity}. Format as a list.`,
      config: {
        systemInstruction: "You are a professional emergency response coordinator. Provide direct, life-saving advice in the requested language."
      }
    }));
    return response.text || "No guidelines available.";
  } catch (error) {
    console.error("Guidelines Error:", error);
    return "The assistant is currently busy handling other requests. Please try again in a few moments.";
  }
};

export const translateContent = async (text: string, targetLanguage: string) => {
  if (!text || !targetLanguage || targetLanguage === "English") return text;
  const cacheKey = `${targetLanguage}:${text}`;
  if (translationCache[cacheKey]) return translationCache[cacheKey];

  try {
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Target Language: ${targetLanguage}\nText to Translate: "${text}"`,
      config: {
        systemInstruction: "You are a highly accurate real-time translator for emergency services. Translate the provided text into the target language. Output ONLY the translated string. Do not include any introductory remarks, quotes, or explanations."
      }
    }));
    const result = response.text?.trim() || text;
    translationCache[cacheKey] = result;
    return result;
  } catch (error) {
    console.error("Translation Error:", error);
    return text;
  }
};

export const translateBatch = async (texts: string[], targetLanguage: string) => {
  if (!texts.length || !targetLanguage || targetLanguage === "English") return texts;
  const results = [...texts];
  const toTranslateIndices: number[] = [];
  const toTranslateValues: string[] = [];
  texts.forEach((text, index) => {
    if (!text) return;
    const cacheKey = `${targetLanguage}:${text}`;
    if (translationCache[cacheKey]) results[index] = translationCache[cacheKey];
    else { toTranslateIndices.push(index); toTranslateValues.push(text); }
  });
  if (toTranslateValues.length === 0) return results;

  try {
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following list of emergency phrases into ${targetLanguage}: ${JSON.stringify(toTranslateValues)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        systemInstruction: "You are an emergency response translator. Output ONLY the JSON array."
      }
    }));
    const rawText = response.text || "[]";
    const cleanedText = cleanJsonString(rawText);
    const translatedArray = JSON.parse(cleanedText);
    if (Array.isArray(translatedArray)) {
      translatedArray.forEach((translatedText: string, i: number) => {
        if (i < toTranslateIndices.length) {
          const originalIndex = toTranslateIndices[i];
          const originalText = toTranslateValues[i];
          results[originalIndex] = translatedText;
          translationCache[`${targetLanguage}:${originalText}`] = translatedText;
        }
      });
    }
    return results;
  } catch (error) {
    console.error("Batch Translation Error:", error);
    return results; 
  }
};

export const generateSpeech = async (text: string, voiceName: 'Kore' | 'Puck' | 'Zephyr' = 'Kore') => {
  try {
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName } },
        },
      },
    }));
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const getGeneralSafetyTips = async (category: string, language: string = "English") => {
  try {
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide general emergency preparedness tips for ${category} in ${language}.`,
      config: {
        systemInstruction: `You are an emergency management expert. Keep formatting clean.`
      }
    }));
    return response.text || "Tips unavailable.";
  } catch (error) {
    console.error("Tips Error:", error);
    return "Tips unavailable.";
  }
};

export const analyzeCrisisPatterns = async (incidents: Incident[]) => {
  try {
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Analyze the following emergency incidents for patterns: ${JSON.stringify(incidents)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            priority: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ["summary", "priority", "recommendation"]
        }
      }
    }));
    const rawText = response.text || "{}";
    return JSON.parse(cleanJsonString(rawText));
  } catch (error) {
    console.error("Analysis Error:", error);
    return { summary: "Analysis unavailable.", priority: "System Stabilizing", recommendation: "Standard procedures." };
  }
};

export const analyzeSpecificIncident = async (incident: Incident, resources: Resource[]) => {
  try {
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Incident: ${JSON.stringify(incident)}\nNearby Resources: ${JSON.stringify(resources)}`,
      config: {
        systemInstruction: "You are a tactical emergency dispatcher. Provide a situation report (SITREP). Include technical risk analysis, resource gaps, and a 3-step action plan.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tacticalAnalysis: { type: Type.STRING },
            resourceGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
            riskProjection: { type: Type.STRING },
            immediateSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["tacticalAnalysis", "resourceGaps", "riskProjection", "immediateSteps"]
        }
      }
    }));
    const rawText = response.text || "{}";
    return JSON.parse(cleanJsonString(rawText));
  } catch (error) {
    console.error("Tactical Analysis Error:", error);
    return null;
  }
};

export const getAIChatResponse = async (userMessage: string, chatHistory: ChatMessage[], incidents: Incident[], language: string) => {
  try {
    const context = `
      CURRENT SITUATION:
      Incidents: ${JSON.stringify(incidents.map(i => ({ type: i.type, severity: i.severity, desc: i.description })))}
      Language: ${language}
    `;
    
    const response = await callWithRetry<GenerateContentResponse>(() => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `${context}\nUser says: ${userMessage}`,
      config: {
        systemInstruction: "You are a personalized Crisis AI Counselor. Your goal is to help victims with specific personal problems arising from the current crises. Be empathetic, practical, and prioritize life-safety. Keep responses concise (under 3 sentences). Respond in the user's requested language."
      }
    }));
    return response.text || "I am processing your request. Please stay calm.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I'm having trouble connecting right now, but please prioritize your immediate safety. Follow local authority instructions.";
  }
};
