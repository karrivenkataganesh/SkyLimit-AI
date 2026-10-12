package com.airline.overbooking;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Objects;

/**
 * Enterprise domain model representing a booked passenger.
 * Implements Comparable based on protection score for Min-Heap priority queues.
 */
public class Passenger implements Comparable<Passenger> {

    public enum FareClass {
        FIRST(350, 4.0),
        BUSINESS(250, 3.0),
        PREMIUM_ECONOMY(180, 2.0),
        ECONOMY(120, 1.0);

        private final int baseWeight;
        private final double multiplier;

        FareClass(int baseWeight, double multiplier) {
            this.baseWeight = baseWeight;
            this.multiplier = multiplier;
        }

        public int getBaseWeight() {
            return baseWeight;
        }

        public double getMultiplier() {
            return multiplier;
        }

        public static FareClass fromString(String val) {
            if (val == null) return ECONOMY;
            String clean = val.trim().toUpperCase().replace(" ", "_").replace("-", "_");
            try {
                return FareClass.valueOf(clean);
            } catch (IllegalArgumentException e) {
                return ECONOMY;
            }
        }
    }

    public enum FrequentFlyerTier {
        PLATINUM(400),
        GOLD(250),
        SILVER(150),
        STANDARD(50);

        private final int tierWeight;

        FrequentFlyerTier(int tierWeight) {
            this.tierWeight = tierWeight;
        }

        public int getTierWeight() {
            return tierWeight;
        }

        public static FrequentFlyerTier fromString(String val) {
            if (val == null) return STANDARD;
            String clean = val.trim().toUpperCase();
            try {
                return FrequentFlyerTier.valueOf(clean);
            } catch (IllegalArgumentException e) {
                return STANDARD;
            }
        }
    }

    private final String bookingId;
    private final String flightId;
    private final String passengerName;
    private final FareClass fareClass;
    private final double farePaid; // Indian Rupees (₹ INR)
    private final FrequentFlyerTier tier;
    private final String checkinTimestamp;
    private final boolean hasConnectingFlight;
    private final boolean specialAssistance;
    private double protectionScore;
    private String assignedSeat;
    private String status;

    public Passenger(
            String bookingId,
            String flightId,
            String passengerName,
            FareClass fareClass,
            double farePaid,
            FrequentFlyerTier tier,
            String checkinTimestamp,
            boolean hasConnectingFlight,
            boolean specialAssistance
    ) {
        this.bookingId = Objects.requireNonNull(bookingId, "bookingId cannot be null");
        this.flightId = flightId != null ? flightId : "FLIGHT-01";
        this.passengerName = Objects.requireNonNull(passengerName, "passengerName cannot be null");
        this.fareClass = fareClass != null ? fareClass : FareClass.ECONOMY;
        this.farePaid = farePaid;
        this.tier = tier != null ? tier : FrequentFlyerTier.STANDARD;
        this.checkinTimestamp = checkinTimestamp != null ? checkinTimestamp : "2026-09-20 10:00:00";
        this.hasConnectingFlight = hasConnectingFlight;
        this.specialAssistance = specialAssistance;
        this.status = "Checked-in";
        this.protectionScore = calculateProtectionScore();
    }

    /**
     * Computes multi-criteria protection score:
     * Score = FareWeight + TierWeight + (FareINR / 100)*0.5 + EarlyCheckinBonus + ConnectionGuard + SpecialAssistanceGuard
     */
    public double calculateProtectionScore() {
        double score = this.fareClass.getBaseWeight() + this.tier.getTierWeight();

        // Monetary contribution: scaled for Indian Rupee tickets (e.g. ₹6,500 gives 32.5 pts, ₹95,000 gives 475 pts)
        score += (this.farePaid / 100.0) * 0.5;

        // Early check-in bonus (earlier checkin gets higher protection)
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            LocalDateTime dt = LocalDateTime.parse(this.checkinTimestamp, formatter);
            int minuteOfDay = dt.getHour() * 60 + dt.getMinute();
            // Bonus up to 80 points for checkin before 08:00
            double earlyBonus = Math.max(0, 80.0 - (minuteOfDay / 15.0));
            score += earlyBonus;
        } catch (Exception e) {
            // Default moderate early bonus
            score += 25.0;
        }

        // Connecting flight safety bonus (missed flight penalties)
        if (this.hasConnectingFlight) {
            score += 350.0;
        }

        // Special assistance imperative safety guard
        if (this.specialAssistance) {
            score += 1000.0;
        }

        this.protectionScore = Math.round(score * 10.0) / 10.0;
        return this.protectionScore;
    }

    @Override
    public int compareTo(Passenger other) {
        // Natural order: Lowest protection score first (Min-Heap candidate for bumping)
        return Double.compare(this.protectionScore, other.protectionScore);
    }

    // Getters and Setters
    public String getBookingId() { return bookingId; }
    public String getFlightId() { return flightId; }
    public String getPassengerName() { return passengerName; }
    public FareClass getFareClass() { return fareClass; }
    public double getFarePaid() { return farePaid; }
    public FrequentFlyerTier getTier() { return tier; }
    public String getCheckinTimestamp() { return checkinTimestamp; }
    public boolean isHasConnectingFlight() { return hasConnectingFlight; }
    public boolean isSpecialAssistance() { return specialAssistance; }
    public double getProtectionScore() { return protectionScore; }
    public String getAssignedSeat() { return assignedSeat; }
    public void setAssignedSeat(String assignedSeat) { this.assignedSeat = assignedSeat; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    @Override
    public String toString() {
        return String.format(
                "Passenger{id='%s', name='%s', class=%s, fare=₹%.0f, tier=%s, score=%.1f, status='%s'}",
                bookingId, passengerName, fareClass, farePaid, tier, protectionScore, status
        );
    }
}
