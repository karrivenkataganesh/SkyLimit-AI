"""
Airline Overbooking Manager - Visualization Script
CS Curriculum: Matplotlib, Seaborn, Parametric Curve Plotting, Trade-off Analytics
"""

import os
from typing import Dict, List
import matplotlib.pyplot as plt
import seaborn as sns


def plot_seat_utilization_vs_bump_risk(optimization_result: Dict, output_filepath: str = "overbooking_dashboard.png"):
    """
    Plots the classic dual-axis curve:
      Subplot 1: Overbooking % vs Bump Risk (Involuntary Denied Boarding Probability)
      Subplot 2: Inventory Level vs Expected Net Profit ($)
    """
    curve_data = optimization_result["curve_data"]
    optimal = optimization_result["optimal_policy"]
    capacity = optimization_result["capacity"]

    overbooking_pcts = [item["overbooking_ratio"] for item in curve_data]
    bump_risks = [item["bump_risk_percentage"] for item in curve_data]
    net_profits = [item["net_expected_profit"] for item in curve_data]
    expected_bumps = [item["expected_bumps"] for item in curve_data]

    # Set aesthetic style
    sns.set_theme(style="whitegrid", palette="deep")
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))

    # --- Plot 1: Seat Utilization vs Bump Risk ---
    ax1.plot(overbooking_pcts, bump_risks, color="#e11d48", linewidth=2.5, marker="o", markersize=4, label="Bump Risk (%)")
    ax1.axvline(optimal["overbooking_ratio"], color="#0284c7", linestyle="--", linewidth=2, 
                label=f"Optimal ({optimal['overbooking_ratio']}%)")
    ax1.set_title("Seat Authorization % vs. Involuntary Bump Risk", fontsize=14, fontweight="bold", pad=12)
    ax1.set_xlabel("Authorized Capacity (% of Aircraft Seats)", fontsize=11)
    ax1.set_ylabel("Probability of Denied Boarding (%)", fontsize=11, color="#e11d48")
    ax1.tick_params(axis="y", labelcolor="#e11d48")
    ax1.set_ylim(-1, max(bump_risks) + 5)
    ax1.legend(loc="upper left")

    # Add secondary axis for expected bumped passengers count
    ax1_twin = ax1.twinx()
    ax1_twin.plot(overbooking_pcts, expected_bumps, color="#8b5cf6", linestyle=":", linewidth=2, label="Exp. Bumped Pax")
    ax1_twin.set_ylabel("Expected Bumped Passengers (Count)", fontsize=11, color="#8b5cf6")
    ax1_twin.tick_params(axis="y", labelcolor="#8b5cf6")
    ax1_twin.grid(False)

    # --- Plot 2: Inventory Level vs Expected Net Profit ---
    ax2.plot(overbooking_pcts, net_profits, color="#10b981", linewidth=2.5, marker="s", markersize=4, label="Net Expected Revenue (₹)")
    ax2.axvline(optimal["overbooking_ratio"], color="#0284c7", linestyle="--", linewidth=2,
                label=f"Peak Profit: ₹{optimal['net_expected_profit']:,}")
    ax2.plot(optimal["overbooking_ratio"], optimal["net_expected_profit"], "o", color="#0284c7", markersize=9)
    ax2.set_title("Financial Trade-off: Revenue vs Compensation Costs", fontsize=14, fontweight="bold", pad=12)
    ax2.set_xlabel("Authorized Capacity (% of Aircraft Seats)", fontsize=11)
    ax2.set_ylabel("Net Expected Profit (₹ INR)", fontsize=11)
    ax2.legend(loc="lower center")

    plt.tight_layout()
    plt.savefig(output_filepath, dpi=300)
    print(f"[Visualization Saved] Dashboard figure generated at: {output_filepath}")
    plt.close()


if __name__ == "__main__":
    from overbooking_engine import OverbookingEngine
    engine = OverbookingEngine(capacity=180, base_fare=420.0, bump_penalty=850.0, default_no_show_rate=0.085)
    res = engine.find_optimal_overbooking()
    plot_seat_utilization_vs_bump_risk(res, "sample_dashboard.png")
