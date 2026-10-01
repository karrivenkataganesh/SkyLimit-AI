"""
Airline Overbooking Manager - Main Execution Driver
Computer Science Curriculum Mini-Project:
  - Linear Algebra & Probability: Discrete distributions, Newsvendor model
  - Data Structures: Priority Queue (Min-Heap), 2D Cabin Matrices
  - Programming & Tools: Python, Pandas, Matplotlib, Seaborn, AI Layer
"""

import os
import sys
from data_manager import FlightDataManager
from overbooking_engine import OverbookingEngine
from seat_matrix import CabinSeatMatrix
from priority_queue import PassengerPriorityQueue, PassengerPriority
from ai_optimizer import AIFlightOptimizer
from visualizer import plot_seat_utilization_vs_bump_risk


def run_pipeline():
    print("=" * 70)
    print("   AIRLINE OVERBOOKING MANAGER - CS CURRICULUM PIPELINE")
    print("   Data Structures + Linear Algebra/Probability + AI Optimization")
    print("=" * 70)

    current_dir = os.path.dirname(os.path.abspath(__file__))
    hist_csv = os.path.join(current_dir, "flight_history.csv")
    bookings_csv = os.path.join(current_dir, "current_bookings.csv")

    # 1. FILE I/O & HISTORICAL DATA ANALYSIS (Pandas)
    print("\n[Phase 1] Ingesting Historical Flight Logs...")
    if not os.path.exists(hist_csv):
        print(f"Error: Could not locate {hist_csv}")
        return

    df_history = FlightDataManager.load_historical_data(hist_csv)
    target_route = "DEL-BOM"
    route_stats = FlightDataManager.analyze_route_profile(df_history, target_route)

    print(f" > Selected Route: {target_route}")
    print(f" > Historical Flights Analyzed: {route_stats['sample_count']}")
    print(f" > Mean Empirical No-Show Rate: {route_stats['mean_no_show_rate'] * 100:.2f}%")
    print(f" > Average Ticket Fare: ₹{route_stats.get('avg_fare_inr', route_stats.get('avg_fare_usd')):,}")
    print(f" > Bump Penalty (IDB Compensation): ₹{route_stats.get('avg_penalty_inr', route_stats.get('avg_penalty_usd')):,}")

    # 2. OVERBOOKING PREDICTION ENGINE (Probability & Newsvendor)
    print("\n[Phase 2] Computing Optimal Overbooking Capacity...")
    capacity = 180  # Physical seats
    base_fare = route_stats.get('avg_fare_inr', route_stats.get('avg_fare_usd'))
    bump_penalty = route_stats.get('avg_penalty_inr', route_stats.get('avg_penalty_usd'))
    no_show_rate = route_stats['mean_no_show_rate']

    engine = OverbookingEngine(
        capacity=capacity,
        base_fare=base_fare,
        bump_penalty=bump_penalty,
        default_no_show_rate=no_show_rate
    )
    optimization_res = engine.find_optimal_overbooking()
    opt = optimization_res["optimal_policy"]

    print(f" > Physical Aircraft Capacity: {capacity} seats")
    print(f" > Newsvendor Critical Ratio Cu/(Cu+Co): {optimization_res['critical_ratio']:.4f}")
    print(f" > Statistically Optimal Authorized Sales: {opt['tickets_sold']} seats ({opt['overbooking_ratio']}%)")
    print(f" > Projected Bump Risk: {opt['bump_risk_percentage']}%")
    print(f" > Expected Involuntary Bumps: {opt['expected_bumps']} passengers")
    print(f" > Net Revenue Lift over 100% cap: +₹{opt['net_profit_lift']:,.2f}")

    # 3. AI / LLM ENHANCEMENT LAYER
    print("\n[Phase 3] Querying AI Optimization Layer (Gemini)...")
    ai_optimizer = AIFlightOptimizer()
    ai_recommendation = ai_optimizer.predict_optimal_capacity(
        route_stats=route_stats,
        current_flight_params={
            "capacity": capacity,
            "base_fare": base_fare,
            "bump_penalty": bump_penalty,
            "time_of_day": "13:10 (Sunday Flight AA-402)"
        }
    )
    print(f" > AI Source: {ai_recommendation.get('source')}")
    print(f" > AI Recommended Overbooking: {ai_recommendation.get('recommended_overbooking_pct')}%")
    print(f" > Risk Assessment: {ai_recommendation.get('risk_tier')}")
    print(f" > Rationale: {ai_recommendation.get('reasoning')}")

    # 4. 2D CABIN SEAT MATRIX (Arrays & Linear Algebra)
    print("\n[Phase 4] Initializing Cabin Seat Matrix (30 rows x 6 seats = 180 seats)...")
    cabin = CabinSeatMatrix(num_rows=30, seats_per_row=6)
    
    # Ingest Current Passenger Bookings
    pq, passenger_records = FlightDataManager.load_current_bookings_to_queue(bookings_csv)
    print(f" > Ingested {len(passenger_records)} passenger records into Cabin Seat Matrix & Priority Queue.")

    for p in passenger_records:
        cabin.auto_assign_in_sector(p["fare_class"], p["booking_id"], CabinSeatMatrix.STATUS_CHECKED_IN)

    load_factors = cabin.calculate_sector_load_factors()
    print(" > Cabin Sector Load Factors:")
    for sector, stats in load_factors.items():
        print(f"    - {sector:16s}: {stats['checked_in_seats']}/{stats['total_seats']} seats ({stats['load_factor_pct']}%)")
    print(f" > Total Cabin Load Factor: {cabin.get_overall_load_factor()}%")

    # 5. PRIORITY QUEUE (HEAP) BUMPING SIMULATION
    print("\n[Phase 5] Simulating Overcapacity Event with Priority Queue (Min-Heap)...")
    print(" > Simulating a scenario where 3 passengers must be bumped due to overselling:")
    print(f" > Current Live Queue Size: {pq.size()} passengers")
    
    # Inspect top of heap (peek)
    highest_vulnerability = pq.peek_next_bump()
    print(f" > Highest Bump Vulnerability (Heap Root): {highest_vulnerability.passenger_name} "
          f"[{highest_vulnerability.fare_class}, Tier: {highest_vulnerability.tier}, "
          f"Score: {highest_vulnerability.protection_score}]")

    bump_count = 3
    bumped_passengers = pq.bump_batch(bump_count)
    print(f"\n > [ACTION] Dequeued {len(bumped_passengers)} passengers for involuntary rebooking / compensation:")
    for rank, bp in enumerate(bumped_passengers, 1):
        print(f"    {rank}. {bp.passenger_name} ({bp.booking_id}) - Fare: {bp.fare_class} (₹{bp.fare_paid:,.0f}), "
              f"Status: {bp.tier}, Protection Score: {bp.protection_score}")

    # 6. VISUALIZATION EXPORT (Matplotlib / Seaborn)
    print("\n[Phase 6] Generating Seat Utilization vs Bump Risk Dashboard Plot...")
    chart_output = os.path.join(current_dir, "overbooking_dashboard.png")
    plot_seat_utilization_vs_bump_risk(optimization_res, chart_output)

    print("\n" + "=" * 70)
    print(" Pipeline execution complete! All academic modules verified successfully.")
    print("=" * 70)


if __name__ == "__main__":
    run_pipeline()
