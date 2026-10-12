package com.airline.overbooking;

import java.util.List;

/**
 * Main simulation runner demonstrating end-to-end integration of:
 * 1. Binomial Optimization & Newsvendor Profit Engine
 * 2. 2D Cabin Seat Allocation Matrix
 * 3. Min-Heap Passenger Bumping Priority Queue
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("================================================================================");
        System.out.println("  AIRLINE OVERBOOKING & YIELD MANAGEMENT ENGINE (JAVA CORE ENTERPRISE)");
        System.out.println("================================================================================");

        // Flight configuration (Route: DEL ➔ BOM Metro Trunk)
        int capacity = 180;
        double baseFareINR = 6500.0;
        double bumpPenaltyINR = 13000.0;
        double historicalNoShowRate = 0.082; // 8.2%

        System.out.printf("Route: DEL ➔ BOM | Capacity: %d seats%n", capacity);
        System.out.printf("Base Fare: ₹%.0f INR | Involuntary Denied Boarding (IDB) Penalty: ₹%.0f INR%n", baseFareINR, bumpPenaltyINR);
        System.out.printf("Historical No-Show Probability: %.2f%%%n%n", historicalNoShowRate * 100.0);

        // 1. Run Stochastic Optimization
        System.out.println(">>> 1. COMPUTING STOCHASTIC OVERBOOKING POLICY <<<");
        OverbookingEngine engine = new OverbookingEngine(capacity, baseFareINR, bumpPenaltyINR, historicalNoShowRate);
        OverbookingEngine.OptimalPolicy policy = engine.findOptimalPolicy();

        System.out.printf(" > Newsvendor Critical Ratio Cu / (Cu + Co): %.4f%n", policy.criticalRatio);
        System.out.printf(" > Optimal Overbooking Ratio: %.1f%%%n", policy.optimalOverbookingRatio);
        System.out.printf(" > Recommended Tickets to Sell: %d seats (+%d over capacity)%n",
                policy.optimalTicketsToSell, policy.optimalTicketsToSell - capacity);
        System.out.printf(" > Expected Net Revenue: ₹%,.0f INR%n", policy.maxNetExpectedProfit);
        System.out.printf(" > Net Expected Profit Lift: +₹%,.0f INR over zero-overbooking%n", policy.netProfitLift);
        System.out.printf(" > Expected Bump Count: %.2f passengers | Bump Risk: %.1f%%%n%n",
                policy.expectedBumps, policy.bumpRiskPercentage);

        // 2. Cabin Seat Allocation Matrix
        System.out.println(">>> 2. CABIN SEAT MATRIX ALLOCATION <<<");
        SeatMatrix seatMatrix = new SeatMatrix(30); // 30 rows
        System.out.printf(" > Aircraft Physical Configuration: %d seats total%n", seatMatrix.getTotalSeats());
        seatMatrix.getSeatBreakdown().forEach((fareClass, count) ->
                System.out.printf("    * %-16s : %3d seats%n", fareClass, count)
        );

        List<Passenger> passengers = FlightDataManager.getSamplePassengers();
        System.out.printf("%n > Boarding %d sampled passengers into physical seats...%n", passengers.size());
        for (Passenger p : passengers) {
            seatMatrix.assignPassenger(p);
        }
        System.out.printf(" > Current Load Factor: %.1f%%%n%n", seatMatrix.calculateLoadFactor() * 100.0);

        // 3. Passenger Priority Queue Min-Heap Simulation
        System.out.println(">>> 3. PRIORITY HEAP (MIN-HEAP) BUMPING SIMULATION <<<");
        PassengerPriorityQueue priorityQueue = new PassengerPriorityQueue();
        priorityQueue.enqueueAll(passengers);

        System.out.printf(" > Enqueued %d passengers into min-heap sorted by Protection Score.%n", priorityQueue.size());
        System.out.println(" > Next 3 candidates in line for involuntary bumping (lowest protection scores):");
        List<Passenger> sortedCandidates = priorityQueue.toSortedList();
        for (int i = 0; i < Math.min(3, sortedCandidates.size()); i++) {
            Passenger p = sortedCandidates.get(i);
            System.out.printf("    #%d: %s (%s) | %s | Fare: ₹%,.0f | Score: %.1f%n",
                    i + 1, p.getPassengerName(), p.getBookingId(), p.getFareClass(), p.getFarePaid(), p.getProtectionScore());
        }

        // Simulate 2 Bumps due to oversales
        System.out.println("\n > Simulating 2 Involuntary Gate Bumps due to flight overbooking:");
        PassengerPriorityQueue.BumpAuditRecord bump1 = priorityQueue.executeNextBump("2026-09-20 07:45:00");
        System.out.println("    " + bump1);
        PassengerPriorityQueue.BumpAuditRecord bump2 = priorityQueue.executeNextBump("2026-09-20 07:46:30");
        System.out.println("    " + bump2);

        System.out.println("\n================================================================================");
        System.out.println("  SIMULATION COMPLETE - REVENUE MAXIMIZED & IDB AUDIT RECORDED");
        System.out.println("================================================================================");
    }
}
