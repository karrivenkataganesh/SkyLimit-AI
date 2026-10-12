import { GoogleGenAI } from "@google/genai";

// 1. Resilient Model Fallback Ladder ordered by latency & availability
export const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
] as const;

export class GeminiService {
  private client: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-airline-overbooking",
          },
        },
      });
    }
  }

  public isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY);
  }

  /**
   * Generates content using resilient multi-tier model fallback ladder
   */
  public async generateContentWithFallback(
    prompt: string,
    systemInstruction?: string
  ): Promise<{ text: string; modelUsed: string }> {
    if (!this.client) {
      throw new Error("GEMINI_API_KEY is not configured in environment.");
    }

    let lastError: unknown = null;
    for (const model of FALLBACK_MODELS) {
      try {
        const response = await this.client.models.generateContent({
          model,
          contents: prompt,
          config: systemInstruction
            ? {
                systemInstruction,
                temperature: 0.2,
              }
            : { temperature: 0.2 },
        });

        if (response && response.text) {
          return { text: response.text, modelUsed: model };
        }
      } catch (err: unknown) {
        console.warn(`[GeminiService] Model '${model}' failed, attempting fallback:`, err);
        lastError = err;
      }
    }

    throw lastError || new Error("All fallback models in ladder exhausted.");
  }
}
