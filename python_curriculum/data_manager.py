"""
Airline Overbooking Manager - File I/O & Pandas Data Management
CS Curriculum: File Handling, CSV Parsing, Dataframe Cleaning, and Statistical Aggregations
"""

import os
from typing import Dict, List, Tuple
import pandas as pd

from priority_queue import PassengerPriority, PassengerPriorityQueue


class FlightDataManager:
    """
    Handles robust File I/O, validation, and analytics of airline CSV data.
    """

    @staticmethod
    def load_historical_data(filepath: str) -> pd.DataFrame:
        """
        Load historical flight data from CSV, validate schema, and calculate derived metrics.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Historical flight file not found: {filepath}")

        df = pd.read_csv(filepath)
        
        required_columns = [
            "flight_id", "route", "total_seats", "tickets_sold",
            "actual_show_ups", "no_shows"
        ]
        for col in required_columns:
            if col not in df.columns:
                raise ValueError(f"Missing required CSV column: {col}")

        # Ensure fare column exists (either INR or USD)
        if "avg_fare_inr" not in df.columns and "avg_fare_usd" not in df.columns:
            raise ValueError("CSV must contain either 'avg_fare_inr' or 'avg_fare_usd'")

        # Compute empirical no-show rate if not present
        if "no_show_rate" not in df.columns:
            df["no_show_rate"] = df["no_shows"] / df["tickets_sold"]

        df["load_factor"] = df["actual_show_ups"] / df["total_seats"]
        return df

    @staticmethod
    def analyze_route_profile(df: pd.DataFrame, route: str) -> Dict:
        """
        Compute statistical distribution parameters for a specific route.
        """
        route_df = df[df["route"].str.upper() == route.strip().upper()]
        if route_df.empty:
            # Fall back to global dataset if route not found
            route_df = df

        mean_no_show = float(route_df["no_show_rate"].mean())
        std_no_show = float(route_df["no_show_rate"].std()) if len(route_df) > 1 else 0.015
        
        fare_col = "avg_fare_inr" if "avg_fare_inr" in route_df.columns else "avg_fare_usd"
        penalty_col = "bump_penalty_inr" if "bump_penalty_inr" in route_df.columns else "bump_penalty_usd"

        avg_fare = float(route_df[fare_col].mean())
        avg_penalty = float(route_df[penalty_col].mean())
        avg_seats = int(route_df["total_seats"].mean())

        return {
            "route": route,
            "sample_count": len(route_df),
            "mean_no_show_rate": round(mean_no_show, 4),
            "std_no_show_rate": round(std_no_show, 4),
            "avg_fare_inr": round(avg_fare, 2),
            "avg_penalty_inr": round(avg_penalty, 2),
            "avg_fare_usd": round(avg_fare, 2),
            "avg_penalty_usd": round(avg_penalty, 2),
            "typical_capacity": avg_seats
        }

    @staticmethod
    def load_current_bookings_to_queue(filepath: str) -> Tuple[PassengerPriorityQueue, List[Dict]]:
        """
        Load current booking CSV and instantiate a ready-to-use Min-Heap Priority Queue.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Current bookings file not found: {filepath}")

        df = pd.read_csv(filepath)
        pq = PassengerPriorityQueue()
        passengers_list = []

        for _, row in df.iterrows():
            passenger = PassengerPriority(
                booking_id=str(row.get("booking_id", "")),
                passenger_name=str(row.get("passenger_name", "")),
                fare_class=str(row.get("fare_class", "Economy")),
                fare_paid=float(row.get("fare_paid", 200.0)),
                tier=str(row.get("frequent_flyer_tier", "Standard")),
                checkin_timestamp=str(row.get("checkin_timestamp", "2026-09-20 12:00:00")),
                has_connecting_flight=bool(row.get("has_connecting_flight", False)),
                special_assistance=bool(row.get("special_assistance", False))
            )
            pq.push_passenger(passenger)
            passengers_list.append(passenger.to_dict())

        return pq, passengers_list


# Quick Test
if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    hist_path = os.path.join(current_dir, "flight_history.csv")
    book_path = os.path.join(current_dir, "current_bookings.csv")

    if os.path.exists(hist_path):
        df_hist = FlightDataManager.load_historical_data(hist_path)
        profile = FlightDataManager.analyze_route_profile(df_hist, "JFK-LHR")
        print("Route Profile for JFK-LHR:", profile)

    if os.path.exists(book_path):
        queue, raw_list = FlightDataManager.load_current_bookings_to_queue(book_path)
        print(f"Loaded {queue.size()} passengers into Priority Queue.")
        print("First to be bumped if oversold:", queue.peek_next_bump().passenger_name)
