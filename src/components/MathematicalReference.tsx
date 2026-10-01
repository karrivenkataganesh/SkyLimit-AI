import React from "react";
import { BookOpen, Sigma, Scale, Layers, HelpCircle } from "lucide-react";

export const MathematicalReference: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Theoretical Foundations
          </span>
          <span className="text-xs text-slate-400">CS &amp; Applied Mathematics Curriculum</span>
        </div>
        <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-400" />
          <span>Mathematical Formulations &amp; Algorithmic Analysis</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Mathematical justification of stochastic overbooking, Newsvendor economic models, and Priority Queue invariants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Discrete Probability Model */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 text-sky-400">
            <Sigma className="w-4 h-4" />
            <span>1. Binomial Distribution of Passenger Show-Ups</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Let <span className="font-mono text-sky-300">n</span> be the number of authorized ticket bookings sold for a flight with physical capacity <span className="font-mono text-sky-300">C</span>. Each passenger independently shows up with probability <span className="font-mono text-sky-300">p = 1 - p_noshow</span>.
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-sky-300 space-y-1">
            <div>P(X = k) = C(n, k) * p^k * (1 - p)^(n - k)</div>
            <div className="text-slate-400 text-[11px] pt-1">
              Expected Show-Ups: E[X] = n * p
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The probability of overcapacity (causing involuntary denied boarding) is the cumulative tail:
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-rose-300 space-y-1">
            <div>{"Bump Risk = P(X > C) = Σ_{k = C + 1}^n P(X = k)"}</div>
            <div className="text-slate-400 text-[11px] pt-1">
              {"Expected Bumps: E[Bumps] = Σ_{k = C + 1}^n (k - C) * P(X = k)"}
            </div>
          </div>
        </div>

        {/* Card 2: Newsvendor Model & Critical Ratio */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 text-emerald-400">
            <Scale className="w-4 h-4" />
            <span>2. Newsvendor Economic Model &amp; Critical Ratio</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Airline overbooking is a canonical application of the Newsvendor problem balancing underage cost versus overage cost:
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300 space-y-1.5">
            <div>C_u (Underage Cost) = Lost Fare (Seat departs empty)</div>
            <div>C_o (Overage Cost) = IDB Penalty (Compensation + Rebooking)</div>
            <div className="pt-1 text-white font-bold">
              Critical Ratio: CR = C_u / (C_u + C_o)
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            The profit-maximizing overbooking level satisfies:
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-amber-300">
            F(C) = P(X ≤ C) ≥ 1 - CR
          </div>
          <p className="text-[11px] text-slate-400">
            As bump penalties rise under regulatory scrutiny, $C_o$ increases, shrinking $CR$ and demanding tighter overbooking limits.
          </p>
        </div>

        {/* Card 3: Priority Queue Invariants */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 text-indigo-400">
            <Layers className="w-4 h-4" />
            <span>3. Priority Queue (Min-Heap) Invariants</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            To prevent arbitrary or biased passenger bumping, airlines employ a strictly sorted Priority Queue where each passenger is assigned a deterministic **Protection Score**:
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-indigo-300 space-y-1">
            <div>Score = W_fare + W_tier + 0.4*Fare + T_early + Modifiers</div>
            <div className="text-slate-400 text-[11px] pt-1">
              Time Complexity: Push = O(log n), Pop Root = O(log n), Peek = O(1)
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            By structuring the queue as a **Min-Heap**, the passenger with the smallest Protection Score resides at index 0. If overselling occurs at the departure gate, dequeueing from root extracts the optimal rebooking candidate in $O(\log n)$ time.
          </p>
        </div>

        {/* Card 4: 2D Matrices and Sector Slicing */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 text-amber-400">
            <HelpCircle className="w-4 h-4" />
            <span>4. Linear Algebra &amp; Cabin Matrix Operations</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Aircraft cabins are represented as a discrete 2D matrix M (30 rows × 6 seats = 180 total capacity):
          </p>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-amber-300 space-y-1">
            <div>{"M[r, c] ∈ {0: Empty, 1: Booked, 2: Checked-In, 3: Bumped}"}</div>
            <div className="text-slate-400 text-[11px] pt-1">
              {"Sector Load Factor: L_sector = (1 / |S_sector|) * Σ_{r, c ∈ sector} 1_{M[r,c] > 0}"}
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            This modular matrix structure enables vectorized slicing across cabin classes (First, Business, Premium Economy, Economy) to calculate revenue yields and localized seat utilization.
          </p>
        </div>
      </div>
    </div>
  );
};
