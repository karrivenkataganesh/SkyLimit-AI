import { CurvePoint, FlightParams, OverbookingAnalysis } from "../types";

/**
 * Exact combinatorial log-gamma binomial PMF computation to prevent floating point overflow
 */
function logComb(n: number, k: number): number {
  if (k < 0 || k > n) return -Infinity;
  if (k === 0 || k === n) return 0;
  let logVal = 0;
  for (let i = 1; i <= k; i++) {
    logVal += Math.log(n - k + i) - Math.log(i);
  }
  return logVal;
}

export function binomialPMF(n: number, k: number, p: number): number {
  if (k < 0 || k > n) return 0;
  const logProb = logComb(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p);
  return Math.exp(logProb);
}

export function generateSimulationCurves(params: FlightParams): {
  curveData: CurvePoint[];
  optimalPolicy: CurvePoint;
  criticalRatio: number;
} {
  const { capacity, baseFare, bumpPenalty, historicalNoShowRate } = params;
  const pShow = 1.0 - historicalNoShowRate;
  const criticalRatio = baseFare / (baseFare + bumpPenalty);

  const maxTickets = Math.ceil(capacity * 1.25); // evaluate up to 125%
  const curveData: CurvePoint[] = [];

  let bestProfit = -Infinity;
  let optimalPolicy: CurvePoint = {
    tickets_sold: capacity,
    overbooking_ratio: 100,
    bump_risk_percentage: 0,
    expected_show_ups: capacity * pShow,
    expected_bumps: 0,
    expected_empty_seats: capacity * historicalNoShowRate,
    gross_revenue: capacity * baseFare,
    expected_bump_cost: 0,
    net_expected_profit: capacity * baseFare * pShow,
    net_profit_lift: 0,
  };

  const baselineProfit = capacity * baseFare * pShow;

  for (let n = capacity; n <= maxTickets; n++) {
    let bumpProb = 0;
    let expectedBumps = 0;

    for (let k = capacity + 1; k <= n; k++) {
      const p_k = binomialPMF(n, k, pShow);
      bumpProb += p_k;
      expectedBumps += (k - capacity) * p_k;
    }

    const expectedShowUps = n * pShow;
    const expectedEmpty = Math.max(0, capacity - expectedShowUps);
    const grossRev = n * baseFare;
    const bumpCost = expectedBumps * bumpPenalty;
    const netProfit = grossRev - bumpCost;

    const point: CurvePoint = {
      tickets_sold: n,
      overbooking_ratio: Math.round((n / capacity) * 1000) / 10,
      bump_risk_percentage: Math.round(bumpProb * 1000) / 10,
      expected_show_ups: Math.round(expectedShowUps * 10) / 10,
      expected_bumps: Math.round(expectedBumps * 100) / 100,
      expected_empty_seats: Math.round(expectedEmpty * 10) / 10,
      gross_revenue: Math.round(grossRev),
      expected_bump_cost: Math.round(bumpCost),
      net_expected_profit: Math.round(netProfit),
      net_profit_lift: Math.round(netProfit - baselineProfit),
    };

    curveData.push(point);

    if (netProfit > bestProfit) {
      bestProfit = netProfit;
      optimalPolicy = point;
    }
  }

  return { curveData, optimalPolicy, criticalRatio };
}

export function computeProtectionScore(p: {
  fare_class: string;
  fare_paid: number;
  tier: string;
  checkin_time: string;
  has_connecting_flight: boolean;
  special_assistance: boolean;
}): number {
  const fareWeights: Record<string, number> = {
    First: 1000,
    Business: 600,
    Premium_Economy: 350,
    Economy: 150,
  };

  const tierWeights: Record<string, number> = {
    Platinum: 500,
    Gold: 350,
    Silver: 200,
    Standard: 50,
  };

  const fareScore = fareWeights[p.fare_class] || 150;
  const tierScore = tierWeights[p.tier] || 50;
  // Scaled for Indian Rupees (INR): ₹1,000 gives 5 pts, ₹10,000 gives 50 pts, ₹1,00,000 gives 500 pts
  const monetary = Math.round((p.fare_paid / 100) * 0.5);

  let earlyBonus = 40;
  try {
    const dt = new Date(p.checkin_time);
    const hour = dt.getHours() + dt.getMinutes() / 60;
    earlyBonus = Math.max(0, (24 - hour) * 4);
  } catch {
    earlyBonus = 30;
  }

  const connectingBonus = p.has_connecting_flight ? 300 : 0;
  const specialBonus = p.special_assistance ? 2000 : 0;

  return Math.round(fareScore + tierScore + monetary + earlyBonus + connectingBonus + specialBonus);
}
