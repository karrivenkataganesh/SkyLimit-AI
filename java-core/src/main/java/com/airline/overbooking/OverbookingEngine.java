package com.airline.overbooking;

import java.util.ArrayList;
import java.util.List;

/**
 * Stochastic Mathematical Engine for Airline Yield & Revenue Optimization.
 * Uses Binomial Probability Distribution and Newsvendor Marginal Cost Trade-offs.
 */
public class OverbookingEngine {

    public static class SimulationPoint {
        public final int ticketsSold;
        public final double overbookingRatio;
        public final double bumpRiskPercentage;
        public final double expectedShowUps;
        public final double expectedBumps;
        public final double expectedEmptySeats;
        public final double grossRevenue;
        public final double expectedBumpCost;
        public final double netExpectedProfit;
        public final double netProfitLift;

        public SimulationPoint(
                int ticketsSold,
                double overbookingRatio,
                double bumpRiskPercentage,
                double expectedShowUps,
                double expectedBumps,
                double expectedEmptySeats,
                double grossRevenue,
                double expectedBumpCost,
                double netExpectedProfit,
                double netProfitLift
        ) {
            this.ticketsSold = ticketsSold;
            this.overbookingRatio = overbookingRatio;
            this.bumpRiskPercentage = bumpRiskPercentage;
            this.expectedShowUps = expectedShowUps;
            this.expectedBumps = expectedBumps;
            this.expectedEmptySeats = expectedEmptySeats;
            this.grossRevenue = grossRevenue;
            this.expectedBumpCost = expectedBumpCost;
            this.netExpectedProfit = netExpectedProfit;
            this.netProfitLift = netProfitLift;
        }
    }

    public static class OptimalPolicy {
        public final int optimalTicketsToSell;
        public final double optimalOverbookingRatio;
        public final double maxNetExpectedProfit;
        public final double expectedBumps;
        public final double bumpRiskPercentage;
        public final double criticalRatio;
        public final double baselineZeroOverbookingProfit;
        public final double netProfitLift;

        public OptimalPolicy(
                int optimalTicketsToSell,
                double optimalOverbookingRatio,
                double maxNetExpectedProfit,
                double expectedBumps,
                double bumpRiskPercentage,
                double criticalRatio,
                double baselineZeroOverbookingProfit,
                double netProfitLift
        ) {
            this.optimalTicketsToSell = optimalTicketsToSell;
            this.optimalOverbookingRatio = optimalOverbookingRatio;
            this.maxNetExpectedProfit = maxNetExpectedProfit;
            this.expectedBumps = expectedBumps;
            this.bumpRiskPercentage = bumpRiskPercentage;
            this.criticalRatio = criticalRatio;
            this.baselineZeroOverbookingProfit = baselineZeroOverbookingProfit;
            this.netProfitLift = netProfitLift;
        }
    }

    private final int capacity;
    private final double baseFare;       // INR (₹)
    private final double bumpPenalty;   // INR (₹)
    private final double noShowRate;    // e.g. 0.08
    private final double showUpProb;    // 1 - noShowRate

    public OverbookingEngine(int capacity, double baseFare, double bumpPenalty, double noShowRate) {
        if (capacity <= 0) throw new IllegalArgumentException("Capacity must be positive");
        this.capacity = capacity;
        this.baseFare = Math.max(1.0, baseFare);
        this.bumpPenalty = Math.max(this.baseFare, bumpPenalty);
        this.noShowRate = Math.min(0.5, Math.max(0.005, noShowRate));
        this.showUpProb = 1.0 - this.noShowRate;
    }

    /**
     * Log-Gamma approximation of log(factorial(n)) to safely compute combinations without overflow.
     */
    private double logFactorial(int n) {
        if (n <= 1) return 0.0;
        double sum = 0.0;
        for (int i = 2; i <= n; i++) {
            sum += Math.log(i);
        }
        return sum;
    }

    /**
     * Binomial Probability Mass Function: P(K = k | n, p)
     */
    public double binomialPmf(int k, int n, double p) {
        if (k < 0 || k > n) return 0.0;
        if (p <= 0.0) return k == 0 ? 1.0 : 0.0;
        if (p >= 1.0) return k == n ? 1.0 : 0.0;

        double logComb = logFactorial(n) - (logFactorial(k) + logFactorial(n - k));
        double logProb = logComb + k * Math.log(p) + (n - k) * Math.log(1.0 - p);
        return Math.exp(logProb);
    }

    /**
     * Evaluates economic expectations for a given ticket sale level.
     */
    public SimulationPoint evaluateInventoryLevel(int ticketsSold, double baselineZeroProfit) {
        double grossRevenue = ticketsSold * baseFare;
        double expectedBumps = 0.0;
        double expectedShowUps = 0.0;
        double bumpRisk = 0.0; // P(ShowUps > Capacity)

        for (int k = 0; k <= ticketsSold; k++) {
            double prob = binomialPmf(k, ticketsSold, showUpProb);
            expectedShowUps += k * prob;
            if (k > capacity) {
                expectedBumps += (k - capacity) * prob;
                bumpRisk += prob;
            }
        }

        double expectedEmptySeats = Math.max(0.0, capacity - expectedShowUps);
        double expectedBumpCost = expectedBumps * bumpPenalty;
        double netExpectedProfit = grossRevenue - expectedBumpCost;
        double netProfitLift = netExpectedProfit - baselineZeroProfit;
        double ratio = (double) ticketsSold / capacity;

        return new SimulationPoint(
                ticketsSold,
                Math.round(ratio * 1000.0) / 10.0,
                Math.round(bumpRisk * 1000.0) / 10.0,
                Math.round(expectedShowUps * 10.0) / 10.0,
                Math.round(expectedBumps * 100.0) / 100.0,
                Math.round(expectedEmptySeats * 10.0) / 10.0,
                Math.round(grossRevenue),
                Math.round(expectedBumpCost),
                Math.round(netExpectedProfit),
                Math.round(netProfitLift)
        );
    }

    /**
     * Computes the complete dual-axis simulation curve across overbooking ratios from 100% to 125%.
     */
    public List<SimulationPoint> generateSimulationCurve() {
        List<SimulationPoint> curve = new ArrayList<>();
        int minTickets = capacity;
        int maxTickets = (int) Math.round(capacity * 1.25);

        // Baseline: Tickets sold = capacity (no overbooking)
        SimulationPoint zeroOverbooking = evaluateInventoryLevel(capacity, 0.0);
        double baselineProfit = zeroOverbooking.netExpectedProfit;

        for (int b = minTickets; b <= maxTickets; b++) {
            curve.add(evaluateInventoryLevel(b, baselineProfit));
        }
        return curve;
    }

    /**
     * Finds the profit-maximizing optimal overbooking policy.
     */
    public OptimalPolicy findOptimalPolicy() {
        List<SimulationPoint> curve = generateSimulationCurve();
        SimulationPoint best = curve.get(0);

        for (SimulationPoint pt : curve) {
            if (pt.netExpectedProfit > best.netExpectedProfit) {
                best = pt;
            }
        }

        double underageCost = baseFare;
        double overageCost = bumpPenalty;
        double criticalRatio = underageCost / (underageCost + overageCost);

        SimulationPoint baseline = curve.get(0);
        return new OptimalPolicy(
                best.ticketsSold,
                best.overbookingRatio,
                best.netExpectedProfit,
                best.expectedBumps,
                best.bumpRiskPercentage,
                Math.round(criticalRatio * 1000.0) / 1000.0,
                baseline.netExpectedProfit,
                best.netProfitLift
        );
    }

    public int getCapacity() { return capacity; }
    public double getBaseFare() { return baseFare; }
    public double getBumpPenalty() { return bumpPenalty; }
    public double getNoShowRate() { return noShowRate; }
}
