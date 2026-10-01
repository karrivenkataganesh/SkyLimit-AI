export interface FlightParams {
  route: string;
  capacity: number;
  baseFare: number;
  bumpPenalty: number;
  historicalNoShowRate: number;
  timeOfDay: string;
  dayOfWeek: string;
  businessClassRatio: number;
}

export interface OverbookingAnalysis {
  optimalOverbookingPercentage: number;
  maxTicketsToSell: number;
  expectedNoShows: number;
  expectedBumps: number;
  expectedNetRevenueGain: number;
  riskRating: "LOW" | "MODERATE" | "HIGH";
  rationale: string;
  rebookingPolicyAdvice: string;
}

export interface CurvePoint {
  tickets_sold: number;
  overbooking_ratio: number;
  bump_risk_percentage: number;
  expected_show_ups: number;
  expected_bumps: number;
  expected_empty_seats: number;
  gross_revenue: number;
  expected_bump_cost: number;
  net_expected_profit: number;
  net_profit_lift: number;
}

export interface Passenger {
  booking_id: string;
  passenger_name: string;
  fare_class: "First" | "Business" | "Premium_Economy" | "Economy";
  fare_paid: number;
  tier: "Platinum" | "Gold" | "Silver" | "Standard";
  checkin_time: string;
  has_connecting_flight: boolean;
  special_assistance: boolean;
  protection_score: number;
  assigned_seat?: string;
  status: "Checked-in" | "Booked" | "Bumped" | "No-Show";
}

export interface CurriculumFile {
  name: string;
  type: string;
  title: string;
  desc: string;
  content: string;
}
