package com.airline.overbooking;

import java.util.*;

/**
 * 2D Aircraft Cabin Matrix and Seat Allocation Engine.
 * Represents physical seat layout, row-column addressing, cabin classes, and load factors.
 */
public class SeatMatrix {

    public static class Seat {
        public final int row;
        public final String col;
        public final String seatCode; // e.g. "1A"
        public final Passenger.FareClass fareClass;
        private Passenger passenger;

        public Seat(int row, String col, Passenger.FareClass fareClass) {
            this.row = row;
            this.col = col;
            this.seatCode = row + col;
            this.fareClass = fareClass;
            this.passenger = null;
        }

        public boolean isOccupied() {
            return passenger != null;
        }

        public Passenger getPassenger() {
            return passenger;
        }

        public void assignPassenger(Passenger p) {
            this.passenger = p;
            if (p != null) {
                p.setAssignedSeat(this.seatCode);
            }
        }

        public void releaseSeat() {
            if (this.passenger != null) {
                this.passenger.setAssignedSeat(null);
                this.passenger = null;
            }
        }
    }

    private final int totalRows;
    private final String[] seatCols = {"A", "B", "C", "D", "E", "F"};
    private final Map<String, Seat> seatMap = new LinkedHashMap<>();
    private final List<Seat> seatList = new ArrayList<>();

    public SeatMatrix(int totalRows) {
        this.totalRows = Math.max(10, totalRows);
        initializeCabinLayout();
    }

    private void initializeCabinLayout() {
        for (int r = 1; r <= totalRows; r++) {
            Passenger.FareClass cabinClass;
            if (r <= 2) {
                cabinClass = Passenger.FareClass.FIRST;
            } else if (r <= 6) {
                cabinClass = Passenger.FareClass.BUSINESS;
            } else if (r <= 10) {
                cabinClass = Passenger.FareClass.PREMIUM_ECONOMY;
            } else {
                cabinClass = Passenger.FareClass.ECONOMY;
            }

            // In First & Business: 4 seats across (A, C, D, F) or standard 6
            String[] cols = (cabinClass == Passenger.FareClass.FIRST)
                    ? new String[]{"A", "C", "D", "F"}
                    : seatCols;

            for (String c : cols) {
                Seat seat = new Seat(r, c, cabinClass);
                seatMap.put(seat.seatCode, seat);
                seatList.add(seat);
            }
        }
    }

    public int getTotalSeats() {
        return seatList.size();
    }

    public int getOccupiedSeatsCount() {
        int count = 0;
        for (Seat s : seatList) {
            if (s.isOccupied()) count++;
        }
        return count;
    }

    public double calculateLoadFactor() {
        if (seatList.isEmpty()) return 0.0;
        return (double) getOccupiedSeatsCount() / seatList.size();
    }

    public Optional<Seat> findEmptySeatForClass(Passenger.FareClass targetClass) {
        for (Seat s : seatList) {
            if (!s.isOccupied() && s.fareClass == targetClass) {
                return Optional.of(s);
            }
        }
        // Upgrade fallback: if economy is full, look for premium economy
        for (Seat s : seatList) {
            if (!s.isOccupied()) {
                return Optional.of(s);
            }
        }
        return Optional.empty();
    }

    public boolean assignPassenger(Passenger passenger) {
        if (passenger == null) return false;
        Optional<Seat> seatOpt = findEmptySeatForClass(passenger.getFareClass());
        if (seatOpt.isPresent()) {
            seatOpt.get().assignPassenger(passenger);
            return true;
        }
        return false;
    }

    public Map<Passenger.FareClass, Integer> getSeatBreakdown() {
        Map<Passenger.FareClass, Integer> counts = new EnumMap<>(Passenger.FareClass.class);
        for (Passenger.FareClass fc : Passenger.FareClass.values()) {
            counts.put(fc, 0);
        }
        for (Seat s : seatList) {
            counts.put(s.fareClass, counts.get(s.fareClass) + 1);
        }
        return counts;
    }

    public Map<String, Seat> getSeatMap() {
        return Collections.unmodifiableMap(seatMap);
    }
}
