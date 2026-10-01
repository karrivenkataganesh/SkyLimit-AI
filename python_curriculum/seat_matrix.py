"""
Airline Overbooking Manager - Seat Matrix & Linear Algebra Operations
CS Curriculum: 2D Arrays, Matrices, Sector Vector Dot Products, and Load Factors
"""

from typing import Dict, List, Optional, Tuple
import numpy as np


class CabinSeatMatrix:
    """
    Represents an aircraft passenger cabin as a 2D Matrix (Rows x Columns).
    Integrated Topics:
      - 2D Arrays and Matrix Slicing.
      - Vectorized Load Factor calculations across cabin sectors.
      - State enumeration (0: Empty, 1: Booked, 2: Checked-In, 3: Blocked).
    """

    SEAT_LETTERS = ["A", "B", "C", "D", "E", "F"]
    
    # State constants
    STATUS_EMPTY = 0
    STATUS_BOOKED = 1
    STATUS_CHECKED_IN = 2
    STATUS_BLOCKED = 3

    def __init__(self, num_rows: int = 30, seats_per_row: int = 6):
        """
        Initialize the cabin seat grid.
        Default: 30 rows x 6 seats (Boeing 737 / Airbus A320 configuration = 180 seats).
        """
        self.num_rows = num_rows
        self.seats_per_row = seats_per_row
        self.total_capacity = num_rows * seats_per_row

        # Matrix: 0=Empty, 1=Booked, 2=Checked-in, 3=Blocked
        self.matrix = np.zeros((self.num_rows, self.seats_per_row), dtype=int)
        
        # Parallel metadata matrix storing passenger names or booking IDs
        self.passenger_grid = [["" for _ in range(seats_per_row)] for _ in range(num_rows)]

        # Define Cabin Sectors (Row Slices)
        self.sector_ranges = {
            "First": (0, 3),              # Rows 1-3
            "Business": (3, 8),           # Rows 4-8
            "Premium_Economy": (8, 14),   # Rows 9-14
            "Economy": (14, num_rows),    # Rows 15-30
        }

    def seat_to_indices(self, seat_code: str) -> Tuple[int, int]:
        """Convert standard seat code like '12B' to 0-indexed matrix coordinates (11, 1)."""
        seat_code = seat_code.strip().upper()
        col_letter = seat_code[-1]
        row_str = seat_code[:-1]
        
        if col_letter not in self.SEAT_LETTERS[:self.seats_per_row]:
            raise ValueError(f"Invalid seat column letter '{col_letter}'.")
        
        row_idx = int(row_str) - 1
        if not (0 <= row_idx < self.num_rows):
            raise ValueError(f"Row {row_str} out of bounds (1-{self.num_rows}).")
            
        col_idx = self.SEAT_LETTERS.index(col_letter)
        return row_idx, col_idx

    def indices_to_seat(self, row: int, col: int) -> str:
        """Convert (row, col) indices to string label like '12B'."""
        return f"{row + 1}{self.SEAT_LETTERS[col]}"

    def assign_seat(self, seat_code: str, passenger_id: str, status: int = STATUS_BOOKED) -> bool:
        """Assign a specific seat to a passenger."""
        r, c = self.seat_to_indices(seat_code)
        if self.matrix[r, c] != self.STATUS_EMPTY:
            return False  # Seat is already taken
        
        self.matrix[r, c] = status
        self.passenger_grid[r][c] = passenger_id
        return True

    def auto_assign_in_sector(self, sector_name: str, passenger_id: str, status: int = STATUS_BOOKED) -> Optional[str]:
        """
        Find and occupy the first available seat within a designated cabin sector.
        """
        if sector_name not in self.sector_ranges:
            sector_name = "Economy"
            
        start_row, end_row = self.sector_ranges[sector_name]
        for r in range(start_row, min(end_row, self.num_rows)):
            for c in range(self.seats_per_row):
                if self.matrix[r, c] == self.STATUS_EMPTY:
                    self.matrix[r, c] = status
                    self.passenger_grid[r][c] = passenger_id
                    return self.indices_to_seat(r, c)
        return None

    def calculate_sector_load_factors(self) -> Dict[str, Dict[str, float]]:
        """
        Matrix Vectorized Operation:
        Computes load factor metrics per cabin sector using numpy slicing.
        Load Factor = Occupied Seats / Total Sector Seats
        """
        metrics = {}
        for sector, (start_row, end_row) in self.sector_ranges.items():
            sector_slice = self.matrix[start_row:end_row, :]
            total_seats = sector_slice.size
            occupied_seats = int(np.count_nonzero(sector_slice > self.STATUS_EMPTY))
            checked_in = int(np.count_nonzero(sector_slice == self.STATUS_CHECKED_IN))
            load_factor = (occupied_seats / total_seats) if total_seats > 0 else 0.0

            metrics[sector] = {
                "total_seats": total_seats,
                "occupied_seats": occupied_seats,
                "checked_in_seats": checked_in,
                "load_factor_pct": round(load_factor * 100, 2),
            }
        return metrics

    def get_overall_load_factor(self) -> float:
        """Calculate overall aircraft cabin load factor."""
        occupied = int(np.count_nonzero(self.matrix > self.STATUS_EMPTY))
        return round((occupied / self.total_capacity) * 100, 2)

    def to_display_matrix(self) -> List[List[Dict]]:
        """Serializes seat matrix for UI / Terminal visualization."""
        rows = []
        for r in range(self.num_rows):
            row_seats = []
            for c in range(self.seats_per_row):
                row_seats.append({
                    "seat": self.indices_to_seat(r, c),
                    "status": int(self.matrix[r, c]),
                    "passenger": self.passenger_grid[r][c]
                })
            rows.append(row_seats)
        return rows


# Quick Terminal Demonstration
if __name__ == "__main__":
    cabin = CabinSeatMatrix(num_rows=20, seats_per_row=6)
    cabin.assign_seat("1A", "BK-1001", CabinSeatMatrix.STATUS_CHECKED_IN)
    cabin.assign_seat("1B", "BK-1002", CabinSeatMatrix.STATUS_BOOKED)
    cabin.auto_assign_in_sector("Business", "BK-1003", CabinSeatMatrix.STATUS_CHECKED_IN)
    cabin.auto_assign_in_sector("Economy", "BK-1010", CabinSeatMatrix.STATUS_BOOKED)
    
    print("Cabin Load Factor:", cabin.get_overall_load_factor(), "%")
    print("Sector Load Factors:", cabin.calculate_sector_load_factors())
