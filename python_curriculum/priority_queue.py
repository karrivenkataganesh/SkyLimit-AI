"""
Airline Overbooking Manager - Priority Queue (Heap) Module
CS Curriculum: Heaps (Min/Max Heap), Priority Queues, Custom Object Comparators
"""

import heapq
from datetime import datetime
from typing import Dict, List, Optional, Tuple


class PassengerPriority:
    """
    Encapsulates a booked passenger with a composite Protection Score.
    Designed for Python's heapq (Min-Heap):
        Lowest Protection Score = HIGHEST Risk of Bumping (popped first).
    """

    FARE_WEIGHTS = {
        "First": 1000,
        "Business": 600,
        "Premium_Economy": 350,
        "Economy": 150
    }

    TIER_WEIGHTS = {
        "Platinum": 500,
        "Gold": 350,
        "Silver": 200,
        "Standard": 50
    }

    def __init__(
        self,
        booking_id: str,
        passenger_name: str,
        fare_class: str,
        fare_paid: float,
        tier: str,
        checkin_timestamp: str,
        has_connecting_flight: bool = False,
        special_assistance: bool = False
    ):
        self.booking_id = booking_id
        self.passenger_name = passenger_name
        self.fare_class = fare_class
        self.fare_paid = float(fare_paid)
        self.tier = tier
        self.checkin_timestamp_str = checkin_timestamp
        self.has_connecting_flight = bool(has_connecting_flight)
        self.special_assistance = bool(special_assistance)

        # Parse check-in timestamp
        try:
            self.checkin_dt = datetime.fromisoformat(checkin_timestamp.strip())
        except Exception:
            self.checkin_dt = datetime.now()

        # Compute composite protection score
        self.protection_score = self._compute_protection_score()

    def _compute_protection_score(self) -> float:
        """
        Mathematical composite protection scoring:
          Score = (Fare Class Baseline) + (Tier Weight) + (0.5 * Fare Paid)
                  + (Check-in Sequence Bonus) + (Connecting Flight Guard)
                  + (Special Assistance Immunity)
        """
        fare_score = self.FARE_WEIGHTS.get(self.fare_class, 150)
        tier_score = self.TIER_WEIGHTS.get(self.tier, 50)
        # Scaled for INR fares (e.g. ₹6,500 gives ~32.5 pts, ₹95,000 gives 475 pts)
        monetary_score = (self.fare_paid / 100.0) * 0.5 if self.fare_paid > 2000 else self.fare_paid * 0.4

        # Earlier check-in gets protection: seconds before end of day
        # (max 100 pts for early birds)
        hour_of_day = self.checkin_dt.hour + (self.checkin_dt.minute / 60.0)
        early_bonus = max(0.0, (24.0 - hour_of_day) * 4.0)

        # Vulnerable passenger protections
        connecting_bonus = 300.0 if self.has_connecting_flight else 0.0
        special_bonus = 2000.0 if self.special_assistance else 0.0

        total_score = fare_score + tier_score + monetary_score + early_bonus + connecting_bonus + special_bonus
        return round(total_score, 2)

    def __lt__(self, other: "PassengerPriority") -> bool:
        """
        Min-Heap comparator:
        A passenger with a LOWER protection score has higher bumping priority.
        If scores tie, break ties by later check-in time (last to check-in bumped first).
        """
        if self.protection_score == other.protection_score:
            return self.checkin_dt > other.checkin_dt  # Later timestamp is bumped first
        return self.protection_score < other.protection_score

    def to_dict(self) -> Dict:
        return {
            "booking_id": self.booking_id,
            "passenger_name": self.passenger_name,
            "fare_class": self.fare_class,
            "fare_paid": self.fare_paid,
            "tier": self.tier,
            "checkin_time": self.checkin_timestamp_str,
            "has_connecting_flight": self.has_connecting_flight,
            "special_assistance": self.special_assistance,
            "protection_score": self.protection_score
        }


class PassengerPriorityQueue:
    """
    Min-Heap Priority Queue for managing passenger bumping and compensation lists.
    Time Complexities:
      - Push: O(log n)
      - Pop (Bump Next): O(log n)
      - Peek (Highest Bump Risk): O(1)
      - Heapify list: O(n)
    """

    def __init__(self):
        self._heap: List[PassengerPriority] = []

    def is_empty(self) -> bool:
        return len(self._heap) == 0

    def size(self) -> int:
        return len(self._heap)

    def push_passenger(self, passenger: PassengerPriority) -> None:
        """Insert a passenger into the priority queue (O(log n))."""
        heapq.heappush(self._heap, passenger)

    def peek_next_bump(self) -> Optional[PassengerPriority]:
        """Examine the passenger most vulnerable to bumping without removing (O(1))."""
        if not self._heap:
            return None
        return self._heap[0]

    def pop_next_bump(self) -> Optional[PassengerPriority]:
        """
        Extract the passenger with lowest protection score for bumping (O(log n)).
        """
        if not self._heap:
            return None
        return heapq.heappop(self._heap)

    def bump_batch(self, count: int) -> List[PassengerPriority]:
        """Dequeue top 'count' passengers to be bumped/rebooked."""
        bumped = []
        for _ in range(min(count, len(self._heap))):
            bumped.append(heapq.heappop(self._heap))
        return bumped

    def get_ranked_list(self) -> List[Dict]:
        """Return the passengers sorted in ascending order of protection score (most vulnerable first)."""
        sorted_passengers = sorted(self._heap)
        return [p.to_dict() for p in sorted_passengers]

    def get_heap_array_view(self) -> List[Dict]:
        """Return raw internal heap array representing the binary tree."""
        return [p.to_dict() for p in self._heap]


# Quick Demonstration
if __name__ == "__main__":
    pq = PassengerPriorityQueue()
    p1 = PassengerPriority("BK-1", "Alice", "Economy", 250, "Standard", "2026-09-20 12:45:00")
    p2 = PassengerPriority("BK-2", "Bob", "Business", 1500, "Platinum", "2026-09-20 07:15:00")
    p3 = PassengerPriority("BK-3", "Charlie", "Economy", 290, "Gold", "2026-09-20 09:30:00")
    p4 = PassengerPriority("BK-4", "David", "Economy", 210, "Standard", "2026-09-20 13:10:00")

    for p in [p1, p2, p3, p4]:
        pq.push_passenger(p)

    print(f"Total in queue: {pq.size()}")
    print("Highest Bump Vulnerability (Root of Min-Heap):", pq.peek_next_bump().passenger_name)
    bumped = pq.pop_next_bump()
    print(f"Bumped Passenger: {bumped.passenger_name} (Protection Score: {bumped.protection_score})")
