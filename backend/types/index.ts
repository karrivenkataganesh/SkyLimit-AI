export interface FlightParameters {
  route: string;
  capacity: number;
  baseFare: number;       // INR (₹)
  bumpPenalty: number;    // INR (₹)
  historicalNoShowRate: number;
  timeOfDay: string;
  dayOfWeek: string;
  businessClassRatio: number;
}

export interface OverbookingAnalysisResult {
  optimalOverbookingPercentage: number;
  maxTicketsToSell: number;
  expectedNoShows: number;
  expectedBumps: number;
  expectedNetRevenueGain: number;
  riskRating: "LOW" | "MODERATE" | "HIGH";
  rationale: string;
  rebookingPolicyAdvice: string;
}

export interface CurriculumFileMetadata {
  id: string;
  name: string;
  type: string;
  category: "frontend" | "backend" | "java-core";
  title: string;
  desc: string;
  content: string;
}
