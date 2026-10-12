package com.airline.overbooking;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

/**
 * Data management layer for reading flight histories and passenger manifests.
 */
public class FlightDataManager {

    public static class RouteProfile {
        public final String route;
        public final double meanNoShowRate;
        public final double avgFareINR;
        public final double avgBumpPenaltyINR;
        public final int sampleFlightsCount;

        public RouteProfile(String route, double meanNoShowRate, double avgFareINR, double avgBumpPenaltyINR, int sampleFlightsCount) {
            this.route = route;
            this.meanNoShowRate = meanNoShowRate;
            this.avgFareINR = avgFareINR;
            this.avgBumpPenaltyINR = avgBumpPenaltyINR;
            this.sampleFlightsCount = sampleFlightsCount;
        }

        @Override
        public String toString() {
            return String.format(
                    "RouteProfile{route='%s', noShowRate=%.2f%%, avgFare=₹%.0f, avgPenalty=₹%.0f, flights=%d}",
                    route, meanNoShowRate * 100.0, avgFareINR, avgBumpPenaltyINR, sampleFlightsCount
            );
        }
    }

    /**
     * Ingests CSV passenger manifest into Passenger model entities.
     */
    public static List<Passenger> loadPassengersFromCsv(Path csvPath) throws IOException {
        List<Passenger> passengers = new ArrayList<>();
        try (BufferedReader br = new BufferedReader(new FileReader(csvPath.toFile()))) {
            String headerLine = br.readLine(); // skip header
            String line;
            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;
                String[] cols = line.split(",");
                if (cols.length >= 9) {
                    String bookingId = cols[0].trim();
                    String flightId = cols[1].trim();
                    String name = cols[2].trim();
                    Passenger.FareClass fareClass = Passenger.FareClass.fromString(cols[3]);
                    double farePaid = Double.parseDouble(cols[4].trim());
                    Passenger.FrequentFlyerTier tier = Passenger.FrequentFlyerTier.fromString(cols[5]);
                    String timestamp = cols[6].trim();
                    boolean connecting = Boolean.parseBoolean(cols[7].trim());
                    boolean specialAssistance = Boolean.parseBoolean(cols[8].trim());

                    passengers.add(new Passenger(
                            bookingId, flightId, name, fareClass, farePaid,
                            tier, timestamp, connecting, specialAssistance
                    ));
                }
            }
        }
        return passengers;
    }

    /**
     * Seeds realistic passengers for simulations when external CSV is not loaded.
     */
    public static List<Passenger> getSamplePassengers() {
        List<Passenger> list = new ArrayList<>();
        list.add(new Passenger("BK-1001", "AI-101", "Eleanor Vance", Passenger.FareClass.FIRST, 95000, Passenger.FrequentFlyerTier.PLATINUM, "2026-09-20 06:15:00", true, false));
        list.add(new Passenger("BK-1002", "AI-101", "Dr. Marcus Chen", Passenger.FareClass.FIRST, 88000, Passenger.FrequentFlyerTier.GOLD, "2026-09-20 06:40:00", false, false));
        list.add(new Passenger("BK-1003", "AI-101", "Sarah Jenkins", Passenger.FareClass.BUSINESS, 58000, Passenger.FrequentFlyerTier.GOLD, "2026-09-20 07:10:00", true, false));
        list.add(new Passenger("BK-1004", "AI-101", "David Kim", Passenger.FareClass.BUSINESS, 52000, Passenger.FrequentFlyerTier.SILVER, "2026-09-20 08:05:00", false, false));
        list.add(new Passenger("BK-1005", "AI-101", "Elena Rostova", Passenger.FareClass.PREMIUM_ECONOMY, 32000, Passenger.FrequentFlyerTier.SILVER, "2026-09-20 09:12:00", true, false));
        list.add(new Passenger("BK-1006", "AI-101", "Samuel O'Connor", Passenger.FareClass.PREMIUM_ECONOMY, 28000, Passenger.FrequentFlyerTier.STANDARD, "2026-09-20 10:20:00", false, false));
        list.add(new Passenger("BK-1007", "AI-101", "Aisha Patel", Passenger.FareClass.ECONOMY, 12500, Passenger.FrequentFlyerTier.GOLD, "2026-09-20 10:45:00", false, false));
        list.add(new Passenger("BK-1008", "AI-101", "Carlos Mendez", Passenger.FareClass.ECONOMY, 11000, Passenger.FrequentFlyerTier.SILVER, "2026-09-20 11:15:00", false, false));
        list.add(new Passenger("BK-1009", "AI-101", "Chloe Martin", Passenger.FareClass.ECONOMY, 9200, Passenger.FrequentFlyerTier.STANDARD, "2026-09-20 11:30:00", true, false));
        list.add(new Passenger("BK-1010", "AI-101", "Hiroshi Tanaka", Passenger.FareClass.ECONOMY, 8400, Passenger.FrequentFlyerTier.STANDARD, "2026-09-20 11:50:00", false, false));
        list.add(new Passenger("BK-1011", "AI-101", "Fatima Al-Mansoor", Passenger.FareClass.ECONOMY, 7800, Passenger.FrequentFlyerTier.STANDARD, "2026-09-20 12:10:00", false, false));
        list.add(new Passenger("BK-1012", "AI-101", "Liam Gallagher", Passenger.FareClass.ECONOMY, 6500, Passenger.FrequentFlyerTier.STANDARD, "2026-09-20 12:40:00", false, false));
        list.add(new Passenger("BK-1013", "AI-101", "Mei-Ling Zhou", Passenger.FareClass.ECONOMY, 6200, Passenger.FrequentFlyerTier.STANDARD, "2026-09-20 13:05:00", false, false));
        list.add(new Passenger("BK-1014", "AI-101", "Oliver Schmidt", Passenger.FareClass.ECONOMY, 5800, Passenger.FrequentFlyerTier.STANDARD, "2026-09-20 13:15:00", false, false));
        list.add(new Passenger("BK-1015", "AI-101", "Ananya Rao", Passenger.FareClass.ECONOMY, 5500, Passenger.FrequentFlyerTier.STANDARD, "2026-09-20 13:30:00", false, false));
        return list;
    }
}
