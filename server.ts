import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// 1. Mandatory Top-Level Request Deserialization
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Gemini SDK initialization (server-side only)
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Resilient Model Fallback Ladder
const FALLBACK_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

async function generateContentWithFallback(prompt: string, systemInstruction?: string) {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured in the environment.");
  }

  let lastError: unknown = null;
  for (const model of FALLBACK_MODELS) {
    try {
      const response = await ai.models.generateContent({
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
      console.warn(`Model ${model} attempt failed, cascading down fallback ladder:`, err);
      lastError = err;
      // Continue to next model in fallback ladder
    }
  }
  throw lastError || new Error("All fallback models failed to generate content.");
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// API: Predict Optimal Overbooking & Risk Analysis
app.post("/api/predict-overbooking", async (req, res) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const {
      route = "JFK -> LHR",
      capacity = 180,
      baseFare = 450,
      bumpPenalty = 900,
      historicalNoShowRate = 0.082,
      timeOfDay = "Evening (18:30)",
      dayOfWeek = "Friday",
      businessClassRatio = 0.22,
    } = body;

    // Mathematical Baseline calculation (Newsvendor critical ratio + Binomial expectation)
    const underageCost = Math.max(1, Number(baseFare));
    const overageCost = Math.max(underageCost * 1.2, Number(bumpPenalty));
    const criticalRatio = underageCost / (underageCost + overageCost);
    const pNoShow = Math.min(0.4, Math.max(0.01, Number(historicalNoShowRate)));
    const showUpProb = 1 - pNoShow;

    // Statistical analytical overbooking formula:
    // With N capacity and p show-up, book b tickets such that P(ShowUps <= Capacity) ~ criticalRatio
    // Normal approximation: mean = b * showUpProb, std = sqrt(b * showUpProb * (1 - showUpProb))
    const zScoreApprox = 1.28; // ~90th percentile safety bound
    const analyticalAllowedBookings = Math.round(
      (capacity + zScoreApprox * Math.sqrt(capacity * pNoShow)) / showUpProb
    );
    const analyticalPercentage = Math.round(
      (analyticalAllowedBookings / capacity) * 1000
    ) / 10;

    let aiRecommendation: string = "";
    let aiModelUsed: string = "analytical-fallback";

    if (process.env.GEMINI_API_KEY) {
      const prompt = `You are a Principal Revenue Management & Quantitative Aviation Analyst.
Analyze the following flight parameters and determine the mathematically sound Overbooking Capacity Recommendation:

- Route: ${route}
- Aircraft Capacity: ${capacity} seats
- Base Fare: ₹${baseFare} (INR)
- Bump / Involuntary Denied Boarding (IDB) Penalty: ₹${bumpPenalty} (INR)
- Historical No-Show Rate: ${(pNoShow * 100).toFixed(1)}%
- Time of Day: ${timeOfDay}
- Day of Week: ${dayOfWeek}
- Business / Premium Class Ratio: ${(businessClassRatio * 100).toFixed(1)}%
- Critical Ratio Cu/(Cu+Co): ${criticalRatio.toFixed(3)}
- Statistical Baseline Cap: ${analyticalPercentage}% (${analyticalAllowedBookings} seats)

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
        const { text, modelUsed } = await generateContentWithFallback(
          prompt,
          "You are an expert computational airline revenue optimization system. Output valid raw JSON only, without markdown fences or extraneous text."
        );
        aiRecommendation = text;
        aiModelUsed = modelUsed;
      } catch (geminiError) {
        console.error("Gemini analysis error, falling back to analytical engine:", geminiError);
      }
    }

    let parsedAiData = null;
    if (aiRecommendation) {
      try {
        // Strip markdown backticks if any
        const cleaned = aiRecommendation.replace(/```json\s*|```/g, "").trim();
        parsedAiData = JSON.parse(cleaned);
      } catch (err) {
        console.warn("Failed to parse JSON from AI, using structured analytical fallback:", err);
      }
    }

    const fallbackData = {
      optimalOverbookingPercentage: analyticalPercentage,
      maxTicketsToSell: analyticalAllowedBookings,
      expectedNoShows: Math.round(analyticalAllowedBookings * pNoShow * 10) / 10,
      expectedBumps: Math.max(0, Math.round((analyticalAllowedBookings * showUpProb - capacity) * 10) / 10),
      expectedNetRevenueGain: Math.round(
        (analyticalAllowedBookings - capacity) * underageCost * (1 - pNoShow) -
          Math.max(0, analyticalAllowedBookings * showUpProb - capacity) * overageCost
      ),
      riskRating: analyticalPercentage > 110 ? "HIGH" : analyticalPercentage > 105 ? "MODERATE" : "LOW",
      rationale: `Based on a ${(pNoShow * 100).toFixed(1)}% no-show probability and an underage/overage critical ratio of ${criticalRatio.toFixed(3)}, setting capacity to ${analyticalPercentage}% balances marginal passenger fare against expected compensation penalties.`,
      rebookingPolicyAdvice: "Maintain priority queue sorting by fare contribution and frequent flyer status to minimize compensation costs during peak gate check-in.",
    };

    const finalResult = parsedAiData || fallbackData;

    res.json({
      success: true,
      model_used: aiModelUsed,
      modelUsed: aiModelUsed,
      analysis: finalResult,
      data: finalResult,
      analyticalBaseline: {
        criticalRatio,
        analyticalAllowedBookings,
        analyticalPercentage,
        pNoShow,
      },
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Internal Server Error";
    console.error("Error in /api/predict-overbooking:", errMessage);
    res.status(500).json({ success: false, error: errMessage });
  }
});

// API: Retrieve all Python curriculum code and sample CSV datasets
app.get("/api/curriculum-files", (_req, res) => {
  try {
    const curriculumDir = path.join(__dirname, "python_curriculum");
    const allowedFiles = [
      { name: "overbooking_engine.py", type: "python", title: "Probability & Optimization Engine", desc: "Binomial distribution PMF/CDF, Newsvendor critical ratio, profit curve" },
      { name: "seat_matrix.py", type: "python", title: "Cabin Seat Matrix & Arrays", desc: "2D numpy cabin grid, sector slicing, load factor dot products" },
      { name: "priority_queue.py", type: "python", title: "Priority Queue (Min-Heap)", desc: "heapq passenger bumping queue, composite protection scoring" },
      { name: "data_manager.py", type: "python", title: "Pandas CSV File I/O", desc: "Flight log ingestion, schema validation, time series aggregation" },
      { name: "ai_optimizer.py", type: "python", title: "Applied AI Layer (Gemini)", desc: "Historical trend analysis, prompt engineering, multi-model fallback" },
      { name: "visualizer.py", type: "python", title: "Matplotlib & Seaborn Visualizer", desc: "Seat utilization vs bump risk dual-axis curve plotting" },
      { name: "main.py", type: "python", title: "Main Execution Driver", desc: "End-to-end simulation runner integrating all modules" },
      { name: "flight_history.csv", type: "csv", title: "Historical Flights Dataset", desc: "20 historical flight logs with no-show rates and fares" },
      { name: "current_bookings.csv", type: "csv", title: "Live Flight Bookings Dataset", desc: "20 passenger manifests with tiers, timestamps, and fare classes" },
      { name: "requirements.txt", type: "text", title: "Python Dependencies", desc: "Pip requirements for local virtual environment" },
      { name: "README.md", type: "markdown", title: "Student Execution Guide", desc: "Detailed step-by-step local running instructions and risk formulas" },
    ];

    const results = allowedFiles.map((item) => {
      const filePath = path.join(curriculumDir, item.name);
      let content = "";
      if (fs.existsSync(filePath)) {
        content = fs.readFileSync(filePath, "utf-8");
      }
      return {
        ...item,
        content,
      };
    });

    res.json({ success: true, files: results });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Error reading files";
    res.status(500).json({ success: false, error: errMessage });
  }
});

// Start Express server and mount Vite
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Airline Overbooking Manager] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
