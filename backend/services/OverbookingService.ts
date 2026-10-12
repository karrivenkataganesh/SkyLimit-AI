import type { FlightParameters, OverbookingAnalysisResult } from "../types/index.ts";

export class OverbookingService {
  /**
   * Computes the mathematical baseline using the Newsvendor critical ratio
   * and normal approximation of binomial show-up distributions.
   */
  public static calculateAnalyticalBaseline(params: FlightParameters) {
    const {
      capacity = 180,
      baseFare = 6500,
      bumpPenalty = 13000,
      historicalNoShowRate = 0.082,
    } = params;

    const underageCost = Math.max(1, Number(baseFare));
    const overageCost = Math.max(underageCost * 1.2, Number(bumpPenalty));
    const criticalRatio = underageCost / (underageCost + overageCost);

    const pNoShow = Math.min(0.4, Math.max(0.005, Number(historicalNoShowRate)));
    const showUpProb = 1 - pNoShow;

    // Normal approximation 90th percentile safety margin (z = 1.28)
    const zScore = 1.28;
    const analyticalAllowedBookings = Math.round(
      (capacity + zScore * Math.sqrt(capacity * pNoShow)) / showUpProb
    );
    const analyticalPercentage =
      Math.round((analyticalAllowedBookings / capacity) * 1000) / 10;

    const expectedNoShows =
      Math.round(analyticalAllowedBookings * pNoShow * 10) / 10;
    const expectedBumps = Math.max(
      0,
      Math.round((analyticalAllowedBookings * showUpProb - capacity) * 10) / 10
    );

    const expectedNetRevenueGain = Math.round(
      (analyticalAllowedBookings - capacity) * underageCost * (1 - pNoShow) -
        expectedBumps * overageCost
    );

    const riskRating: "LOW" | "MODERATE" | "HIGH" =
      analyticalPercentage > 110 ? "HIGH" : analyticalPercentage > 105 ? "MODERATE" : "LOW";

    const rationale = `Based on a ${(pNoShow * 100).toFixed(
      1
    )}% historical no-show probability and an underage/overage critical ratio of ${criticalRatio.toFixed(
      3
    )}, setting capacity to ${analyticalPercentage}% balances marginal passenger fare against expected compensation penalties in Indian Rupees (₹).`;

    const rebookingPolicyAdvice =
      "Maintain passenger min-heap queue indexed by fare contribution and frequent flyer status to minimize statutory bumping compensation.";

    const analysis: OverbookingAnalysisResult = {
      optimalOverbookingPercentage: analyticalPercentage,
      maxTicketsToSell: analyticalAllowedBookings,
      expectedNoShows,
      expectedBumps,
      expectedNetRevenueGain,
      riskRating,
      rationale,
      rebookingPolicyAdvice,
    };

    return {
      analysis,
      baseline: {
        criticalRatio,
        analyticalAllowedBookings,
        analyticalPercentage,
        pNoShow,
        underageCost,
        overageCost,
      },
    };
  }
}
