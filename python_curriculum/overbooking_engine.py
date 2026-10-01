"""
Airline Overbooking Manager - Overbooking Optimization & Probability Engine
CS Curriculum: Probability, Discrete Random Variables, and Marginal Analysis
"""

import math
from typing import Dict, List, Tuple


class OverbookingEngine:
    """
    Mathematical and stochastic optimization engine for airline overbooking.
    
    Models passenger show-ups as a Binomial Random Variable:
        X ~ Binomial(n, 1 - p_noshow)
    where:
        n = number of tickets sold
        C = physical aircraft seat capacity
        p_noshow = empirical no-show probability
        p_show = 1 - p_noshow (success probability)
    """

    def __init__(self, capacity: int, base_fare: float, bump_penalty: float, default_no_show_rate: float = 0.08):
        """
        Initialize overbooking engine parameters.

        :param capacity: Physical seat capacity of the aircraft (C).
        :param base_fare: Average revenue earned per ticket sold (Underage Cost Cu).
        :param bump_penalty: Cost of involuntary denied boarding compensation (Overage Cost Co).
        :param default_no_show_rate: Historical baseline probability that a booked passenger does not show up.
        """
        if capacity <= 0:
            raise ValueError("Aircraft capacity must be positive.")
        if base_fare <= 0:
            raise ValueError("Base fare must be positive.")
        if bump_penalty <= 0:
            raise ValueError("Bump penalty must be positive.")

        self.capacity = capacity
        self.base_fare = base_fare
        self.bump_penalty = bump_penalty
        self.default_no_show_rate = default_no_show_rate

    @staticmethod
    def binomial_pmf(n: int, k: int, p: float) -> float:
        """
        Calculate Binomial Probability Mass Function: P(X = k).
        Uses math.comb for exact combinatorial calculation.
        """
        if k < 0 or k > n:
            return 0.0
        return math.comb(n, k) * (p ** k) * ((1.0 - p) ** (n - k))

    def calculate_critical_ratio(self) -> float:
        """
        Newsvendor Model Critical Ratio:
            CR = Cu / (Cu + Co)
        Where:
            Cu (Underage Cost) = Lost fare if a seat departs empty.
            Co (Overage Cost) = Compensation penalty if an overbooked passenger must be bumped.
        """
        c_u = self.base_fare
        c_o = self.bump_penalty
        return c_u / (c_u + c_o)

    def evaluate_capacity_metrics(self, n_tickets: int, no_show_rate: float) -> Dict[str, float]:
        """
        Compute exact probabilities and financial expectations for selling n_tickets.

        :param n_tickets: Total tickets authorized for sale (n >= capacity).
        :param no_show_rate: Specific no-show probability for this flight.
        :return: Dictionary containing bump risk, expected bumps, expected revenue, and net gain.
        """
        p_show = 1.0 - no_show_rate
        c = self.capacity

        # Cumulative probability of overboarding: P(Show-Ups > Capacity)
        bump_probability = 0.0
        expected_bumps = 0.0

        for k in range(c + 1, n_tickets + 1):
            prob_k = self.binomial_pmf(n_tickets, k, p_show)
            bump_probability += prob_k
            expected_bumps += (k - c) * prob_k

        # Expected show-ups and empty seats
        expected_show_ups = n_tickets * p_show
        expected_empty_seats = max(0.0, c - expected_show_ups)

        # Financial Calculations
        gross_revenue = n_tickets * self.base_fare
        expected_bump_cost = expected_bumps * self.bump_penalty
        net_expected_profit = gross_revenue - expected_bump_cost

        # Baseline profit if exactly 100% capacity (zero overbooking) sold
        baseline_revenue = c * self.base_fare * p_show

        return {
            "tickets_sold": n_tickets,
            "overbooking_ratio": round((n_tickets / c) * 100, 2),
            "bump_risk_percentage": round(bump_probability * 100, 2),
            "expected_show_ups": round(expected_show_ups, 2),
            "expected_bumps": round(expected_bumps, 3),
            "expected_empty_seats": round(expected_empty_seats, 2),
            "gross_revenue": round(gross_revenue, 2),
            "expected_bump_cost": round(expected_bump_cost, 2),
            "net_expected_profit": round(net_expected_profit, 2),
            "net_profit_lift": round(net_expected_profit - baseline_revenue, 2)
        }

    def find_optimal_overbooking(self, max_overbook_factor: float = 1.25, no_show_rate: float = None) -> Dict:
        """
        Sweeps through ticket inventory levels to maximize Expected Net Profit:
            max_{n >= C} [ n * Fare - BumpCost * E[max(0, X_n - C)] ]
        
        :param max_overbook_factor: Maximum allowed overbooking cap (e.g. 1.25 for 125%).
        :param no_show_rate: Custom no-show rate or default baseline.
        :return: Optimal configuration and trade-off curve points.
        """
        p_ns = no_show_rate if no_show_rate is not None else self.default_no_show_rate
        max_tickets = int(math.ceil(self.capacity * max_overbook_factor))

        curve_data: List[Dict] = []
        best_profit = -float("inf")
        optimal_policy: Dict = {}

        for n in range(self.capacity, max_tickets + 1):
            metrics = self.evaluate_capacity_metrics(n, p_ns)
            curve_data.append(metrics)

            if metrics["net_expected_profit"] > best_profit:
                best_profit = metrics["net_expected_profit"]
                optimal_policy = metrics

        critical_ratio = self.calculate_critical_ratio()

        return {
            "optimal_policy": optimal_policy,
            "critical_ratio": round(critical_ratio, 4),
            "capacity": self.capacity,
            "no_show_rate": p_ns,
            "curve_data": curve_data
        }


# Quick Verification / Unit Demonstration
if __name__ == "__main__":
    engine = OverbookingEngine(capacity=160, base_fare=6500.0, bump_penalty=13000.0, default_no_show_rate=0.08)
    opt = engine.find_optimal_overbooking()
    print("--- Optimal Overbooking Policy ---")
    print(f"Optimal Tickets to Sell: {opt['optimal_policy']['tickets_sold']} seats ({opt['optimal_policy']['overbooking_ratio']}%)")
    print(f"Bump Risk: {opt['optimal_policy']['bump_risk_percentage']}%")
    print(f"Expected Bumps: {opt['optimal_policy']['expected_bumps']}")
    print(f"Net Profit Lift over 100% cap: ₹{opt['optimal_policy']['net_profit_lift']}")
