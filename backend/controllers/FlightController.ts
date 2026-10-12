import type { Request, Response } from "express";
import { GeminiService } from "../services/GeminiService.ts";
import { OverbookingService } from "../services/OverbookingService.ts";
import type { FlightParameters } from "../types/index.ts";

const geminiService = new GeminiService();

export class FlightController {
  public static async predictOverbooking(req: Request, res: Response): Promise<void> {
    try {
      // Defensive Payload Ingestion (Null-Safe Destructuring)
      const body = req.body && typeof req.body === "object" ? req.body : {};
      const params: FlightParameters = {
        route: String(body.route || "DEL -> BOM"),
        capacity: Math.max(10, Math.min(600, Number(body.capacity) || 180)),
        baseFare: Math.max(100, Math.min(500000, Number(body.baseFare) || 6500)),
        bumpPenalty: Math.max(200, Math.min(1000000, Number(body.bumpPenalty) || 13000)),
        historicalNoShowRate: Math.max(0.005, Math.min(0.4, Number(body.historicalNoShowRate) || 0.082)),
        timeOfDay: String(body.timeOfDay || "Evening (18:30)"),
        dayOfWeek: String(body.dayOfWeek || "Friday"),
        businessClassRatio: Math.max(0.0, Math.min(1.0, Number(body.businessClassRatio) || 0.22)),
      };

      const { analysis: baselineAnalysis, baseline } =
        OverbookingService.calculateAnalyticalBaseline(params);

      let aiRecommendation: string = "";
      let modelUsed: string = "analytical-fallback";

      if (geminiService.isConfigured()) {
        const prompt = `You are a Principal Revenue Management & Quantitative Aviation Analyst.
Analyze the following flight parameters and determine the mathematically sound Overbooking Capacity Recommendation:

- Route: ${params.route}
- Aircraft Capacity: ${params.capacity} seats
- Base Fare: ₹${params.baseFare} (INR)
- Involuntary Denied Boarding (Bump) Penalty: ₹${params.bumpPenalty} (INR)
- Historical No-Show Rate: ${(baseline.pNoShow * 100).toFixed(1)}%
- Time of Day: ${params.timeOfDay}
- Day of Week: ${params.dayOfWeek}
- Business / Premium Class Ratio: ${(params.businessClassRatio * 100).toFixed(1)}%
- Critical Ratio Cu/(Cu+Co): ${baseline.criticalRatio.toFixed(3)}
- Statistical Baseline Cap: ${baseline.analyticalPercentage}% (${baseline.analyticalAllowedBookings} seats)

Note: All economic values are denominated in Indian Rupees (INR, ₹).
Provide a structured JSON output with:
{
  "optimalOverbookingPercentage": number (e.g. 107.5),
  "maxTicketsToSell": number,
  "expectedNoShows": number,
  "expectedBumps": number,
  "expectedNetRevenueGain": number,
  "riskRating": "LOW" | "MODERATE" | "HIGH",
  "rationale": "2-3 sentences explaining the economic and mathematical trade-off in INR (₹)",
  "rebookingPolicyAdvice": "1 sentence advice on priority heap and standby management"
}`;

        try {
          const aiResponse = await geminiService.generateContentWithFallback(
            prompt,
            "You are an expert computational airline revenue optimization system. Output valid raw JSON only, without markdown fences or extraneous text."
          );
          aiRecommendation = aiResponse.text;
          modelUsed = aiResponse.modelUsed;
        } catch (geminiError) {
          console.error("[FlightController] Gemini call failed, resorting to analytical baseline:", geminiError);
        }
      }

      let parsedAiData = null;
      if (aiRecommendation) {
        try {
          const cleaned = aiRecommendation.replace(/```json\s*|```/g, "").trim();
          parsedAiData = JSON.parse(cleaned);
        } catch (parseError) {
          console.warn("[FlightController] Failed to parse AI JSON, falling back safely:", parseError);
        }
      }

      const finalAnalysis = parsedAiData || baselineAnalysis;

      res.json({
        success: true,
        model_used: modelUsed,
        modelUsed,
        analysis: finalAnalysis,
        data: finalAnalysis,
        analyticalBaseline: baseline,
      });
    } catch (error: unknown) {
      const errMessage = error instanceof Error ? error.message : "Internal Server Error";
      console.error("[FlightController] Error in predictOverbooking:", errMessage);
      res.status(500).json({ success: false, error: errMessage });
    }
  }

  public static getHealth(_req: Request, res: Response): void {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      geminiConfigured: geminiService.isConfigured(),
    });
  }
}
