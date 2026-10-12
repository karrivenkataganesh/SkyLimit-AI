package com.airline.overbooking;

import java.util.*;

/**
 * Min-Heap Priority Queue for Airline Involuntary Denied Boarding (IDB) Sequencing.
 * Ensures lowest-impact passengers are bumped first, preserving highest-value loyalty relationships.
 */
public class PassengerPriorityQueue {

    public static class BumpAuditRecord {
        public final String timestamp;
        public final Passenger passenger;
        public final double protectionScore;
        public final double compensationINR;
        public final String rationale;

        public BumpAuditRecord(
                String timestamp,
                Passenger passenger,
                double protectionScore,
                double compensationINR,
                String rationale
        ) {
            this.timestamp = timestamp;
            this.passenger = passenger;
            this.protectionScore = protectionScore;
            this.compensationINR = compensationINR;
            this.rationale = rationale;
        }

        @Override
        public String toString() {
            return String.format(
                    "[%s] BUMPED: %s (%s) | Score: %.1f | Compensation: ₹%.0f | Reason: %s",
                    timestamp, passenger.getPassengerName(), passenger.getBookingId(),
                    protectionScore, compensationINR, rationale
            );
        }
    }

    private final PriorityQueue<Passenger> minHeap;
    private final List<BumpAuditRecord> auditLog = new ArrayList<>();

    public PassengerPriorityQueue() {
        // Natural order of Passenger puts the lowest protection score at the head (min-heap)
        this.minHeap = new PriorityQueue<>();
    }

    public void enqueue(Passenger p) {
        if (p == null) return;
        p.calculateProtectionScore();
        minHeap.offer(p);
    }

    public void enqueueAll(Collection<Passenger> passengers) {
        if (passengers == null) return;
        for (Passenger p : passengers) {
            enqueue(p);
        }
    }

    public Passenger peekNextBumpCandidate() {
        return minHeap.peek();
    }

    public int size() {
        return minHeap.size();
    }

    public boolean isEmpty() {
        return minHeap.isEmpty();
    }

    /**
     * Executes Involuntary Denied Boarding (IDB) on the lowest-score passenger.
     * Computes mandatory statutory compensation (e.g. 200% of fare, min ₹10,000 INR).
     */
    public BumpAuditRecord executeNextBump(String timestamp) {
        Passenger candidate = minHeap.poll();
        if (candidate == null) return null;

        candidate.setStatus("Bumped");
        if (candidate.getAssignedSeat() != null) {
            candidate.setAssignedSeat(null);
        }

        // Regulatory IDB compensation: 200% of one-way fare paid, capped between ₹10,000 and ₹45,000
        double baseCompensation = candidate.getFarePaid() * 2.0;
        double compensation = Math.max(10000.0, Math.min(45000.0, baseCompensation));

        String rationale = String.format(
                "Lowest composite protection score (%.1f). Fare class: %s, Frequent Flyer: %s, Connecting: %s.",
                candidate.getProtectionScore(),
                candidate.getFareClass(),
                candidate.getTier(),
                candidate.isHasConnectingFlight() ? "Yes" : "No"
        );

        BumpAuditRecord record = new BumpAuditRecord(
                timestamp,
                candidate,
                candidate.getProtectionScore(),
                compensation,
                rationale
        );
        auditLog.add(record);
        return record;
    }

    public List<BumpAuditRecord> getAuditLog() {
        return Collections.unmodifiableList(auditLog);
    }

    public List<Passenger> toSortedList() {
        List<Passenger> sorted = new ArrayList<>(minHeap);
        Collections.sort(sorted);
        return sorted;
    }
}
