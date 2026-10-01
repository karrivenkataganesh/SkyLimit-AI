import React, { useState } from "react";
import { Grid, CheckCircle2, UserX, Armchair, Sparkles, RefreshCcw } from "lucide-react";
import { Passenger } from "../types";

interface Props {
  passengers: Passenger[];
  onTogglePassengerStatus?: (bookingId: string) => void;
}

export const CabinSeatMap: React.FC<Props> = ({ passengers }) => {
  const [selectedSeat, setSelectedSeat] = useState<string | null>("1A");

  // Grid dimensions: 30 Rows x 6 Seats (A, B, C, aisle, D, E, F)
  const rows = 30;
  const cols = ["A", "B", "C", "D", "E", "F"];

  // Cabin Sector Definitions
  const sectors = [
    { name: "First Class", startRow: 1, endRow: 3, totalSeats: 18, color: "text-amber-400 border-amber-500/40 bg-amber-500/10" },
    { name: "Business Class", startRow: 4, endRow: 8, totalSeats: 30, color: "text-purple-400 border-purple-500/40 bg-purple-500/10" },
    { name: "Premium Economy", startRow: 9, endRow: 14, totalSeats: 36, color: "text-sky-400 border-sky-500/40 bg-sky-500/10" },
    { name: "Economy", startRow: 15, endRow: 30, totalSeats: 96, color: "text-emerald-400 border-emerald-500/40 bg-emerald-500/10" },
  ];

  // Map passengers to seats
  const seatPassengerMap = new Map<string, Passenger>();
  passengers.forEach((p, idx) => {
    // Generate systematic seat codes if not explicitly assigned
    let seatCode = p.assigned_seat;
    if (!seatCode) {
      if (p.fare_class === "First") {
        const r = 1 + (idx % 3);
        const c = cols[idx % 6];
        seatCode = `${r}${c}`;
      } else if (p.fare_class === "Business") {
        const r = 4 + (idx % 5);
        const c = cols[idx % 6];
        seatCode = `${r}${c}`;
      } else if (p.fare_class === "Premium_Economy") {
        const r = 9 + (idx % 6);
        const c = cols[idx % 6];
        seatCode = `${r}${c}`;
      } else {
        const r = 15 + (idx % 16);
        const c = cols[idx % 6];
        seatCode = `${r}${c}`;
      }
    }
    seatPassengerMap.set(seatCode, p);
  });

  // Calculate sector metrics (Matrix vector dot-products)
  const sectorMetrics = sectors.map((s) => {
    let occupied = 0;
    let checkedIn = 0;
    let bumped = 0;

    for (let r = s.startRow; r <= s.endRow; r++) {
      for (const col of cols) {
        const code = `${r}${col}`;
        const p = seatPassengerMap.get(code);
        if (p) {
          if (p.status === "Bumped") bumped++;
          else {
            occupied++;
            if (p.status === "Checked-in") checkedIn++;
          }
        }
      }
    }

    const loadFactor = Math.round((occupied / s.totalSeats) * 100);
    return {
      ...s,
      occupied,
      checkedIn,
      bumped,
      loadFactor,
    };
  });

  const totalSeats = rows * 6; // 180 seats
  const totalOccupied = sectorMetrics.reduce((acc, curr) => acc + curr.occupied, 0);
  const overallLoadFactor = Math.round((totalOccupied / totalSeats) * 100);

  const activePassenger = selectedSeat ? seatPassengerMap.get(selectedSeat) : null;

  return (
    <div className="space-y-6">
      {/* Sector Load Factor Summary Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sectorMetrics.map((sec) => (
          <div
            key={sec.name}
            className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${sec.color}`}>
                {sec.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400">Rows {sec.startRow}-{sec.endRow}</span>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-black text-white font-mono">{sec.loadFactor}%</div>
                <div className="text-[11px] text-slate-400">
                  {sec.occupied} / {sec.totalSeats} seats filled
                </div>
              </div>
              <div className="text-right text-[11px] font-mono">
                <span className="text-emerald-400">{sec.checkedIn} In</span>
                {sec.bumped > 0 && <span className="text-rose-400 ml-2">{sec.bumped} Bumped</span>}
              </div>
            </div>

            {/* Micro Progress Bar */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, sec.loadFactor)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Main Seat Map Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Visual Cabin Layout */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Grid className="w-4 h-4 text-sky-400" />
                <span>2D Aircraft Cabin Matrix (30 Rows x 6 Seats = 180 Seats)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Rows 1-30. Click any seat to inspect passenger booking &amp; protection score.
              </p>
            </div>

            {/* Overall Load Factor Badge */}
            <div className="text-right">
              <span className="text-xs text-slate-400">Overall Cabin Load Factor</span>
              <div className="text-lg font-black text-sky-400 font-mono">{overallLoadFactor}%</div>
            </div>
          </div>

          {/* Seat Status Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
              <span>Empty (Available)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-sky-600/80 border border-sky-400" />
              <span>Checked-In</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-indigo-700/80 border border-indigo-400" />
              <span>Booked (Not Checked-In)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-600/80 border border-rose-400" />
              <span>Bumped / Standby</span>
            </div>
          </div>

          {/* Fuselage Container */}
          <div className="mt-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {/* Column Header */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 py-1.5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <span className="w-8 text-center">Row</span>
              <div className="flex gap-2">
                <span className="w-7 text-center">A</span>
                <span className="w-7 text-center">B</span>
                <span className="w-7 text-center">C</span>
              </div>
              <span className="w-6 text-center text-slate-600 text-[10px]">AISLE</span>
              <div className="flex gap-2">
                <span className="w-7 text-center">D</span>
                <span className="w-7 text-center">E</span>
                <span className="w-7 text-center">F</span>
              </div>
            </div>

            {/* Rows list */}
            <div className="space-y-1.5 mt-2">
              {Array.from({ length: rows }, (_, rIdx) => {
                const rowNum = rIdx + 1;
                const isFirst = rowNum <= 3;
                const isBusiness = rowNum >= 4 && rowNum <= 8;
                const isPremium = rowNum >= 9 && rowNum <= 14;

                const rowBadgeColor = isFirst
                  ? "text-amber-400"
                  : isBusiness
                  ? "text-purple-400"
                  : isPremium
                  ? "text-sky-400"
                  : "text-slate-400";

                return (
                  <div
                    key={rowNum}
                    className="flex items-center justify-between py-0.5 hover:bg-slate-800/40 rounded transition-colors px-1"
                  >
                    {/* Row Number */}
                    <span className={`w-8 text-center text-xs font-mono font-bold ${rowBadgeColor}`}>
                      {rowNum}
                    </span>

                    {/* Left 3 seats (A, B, C) */}
                    <div className="flex gap-2">
                      {["A", "B", "C"].map((c) => {
                        const code = `${rowNum}${c}`;
                        const p = seatPassengerMap.get(code);
                        const isSelected = selectedSeat === code;

                        let bgClass = "bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500";
                        if (p) {
                          if (p.status === "Checked-in") {
                            bgClass = "bg-sky-600 text-white border-sky-400 font-bold shadow-sm shadow-sky-500/20";
                          } else if (p.status === "Booked") {
                            bgClass = "bg-indigo-700/80 text-white border-indigo-500 font-medium";
                          } else if (p.status === "Bumped") {
                            bgClass = "bg-rose-600 text-white border-rose-400 font-bold animate-pulse";
                          }
                        }

                        return (
                          <button
                            key={code}
                            onClick={() => setSelectedSeat(code)}
                            title={p ? `${code}: ${p.passenger_name} (${p.fare_class})` : `${code}: Available`}
                            className={`w-7 h-7 rounded text-[10px] font-mono border flex items-center justify-center transition-all cursor-pointer ${bgClass} ${
                              isSelected ? "ring-2 ring-white scale-110 z-10" : ""
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>

                    {/* Aisle Spacer */}
                    <div className="w-6 flex items-center justify-center">
                      <div className="h-4 w-px bg-slate-800" />
                    </div>

                    {/* Right 3 seats (D, E, F) */}
                    <div className="flex gap-2">
                      {["D", "E", "F"].map((c) => {
                        const code = `${rowNum}${c}`;
                        const p = seatPassengerMap.get(code);
                        const isSelected = selectedSeat === code;

                        let bgClass = "bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-500";
                        if (p) {
                          if (p.status === "Checked-in") {
                            bgClass = "bg-sky-600 text-white border-sky-400 font-bold shadow-sm shadow-sky-500/20";
                          } else if (p.status === "Booked") {
                            bgClass = "bg-indigo-700/80 text-white border-indigo-500 font-medium";
                          } else if (p.status === "Bumped") {
                            bgClass = "bg-rose-600 text-white border-rose-400 font-bold animate-pulse";
                          }
                        }

                        return (
                          <button
                            key={code}
                            onClick={() => setSelectedSeat(code)}
                            title={p ? `${code}: ${p.passenger_name} (${p.fare_class})` : `${code}: Available`}
                            className={`w-7 h-7 rounded text-[10px] font-mono border flex items-center justify-center transition-all cursor-pointer ${bgClass} ${
                              isSelected ? "ring-2 ring-white scale-110 z-10" : ""
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Seat & Passenger Inspector Panel */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Armchair className="w-4 h-4 text-sky-400" />
                <span>Seat Inspector</span>
              </h4>
              <span className="font-mono font-bold text-lg text-sky-400 bg-sky-950 px-2.5 py-0.5 rounded border border-sky-800">
                {selectedSeat || "None"}
              </span>
            </div>

            {activePassenger ? (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-xs text-slate-400">Passenger Name</div>
                  <div className="text-base font-bold text-white mt-0.5">{activePassenger.passenger_name}</div>
                  <div className="text-xs font-mono text-slate-400">ID: {activePassenger.booking_id}</div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block">Fare Class</span>
                    <span className="text-white font-semibold font-mono">{activePassenger.fare_class}</span>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block">Fare Paid</span>
                    <span className="text-emerald-400 font-semibold font-mono">₹{activePassenger.fare_paid.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block">Frequent Flyer</span>
                    <span className="text-indigo-300 font-semibold font-mono">{activePassenger.tier}</span>
                  </div>

                  <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 block">Protection Score</span>
                    <span className="text-amber-300 font-bold font-mono text-sm">
                      {activePassenger.protection_score}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Check-in Timestamp:</span>
                    <span className="font-mono">{activePassenger.checkin_time}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Connecting Flight:</span>
                    <span className={activePassenger.has_connecting_flight ? "text-emerald-400" : "text-slate-500"}>
                      {activePassenger.has_connecting_flight ? "Yes (+300 pts)" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Special Assistance:</span>
                    <span className={activePassenger.special_assistance ? "text-emerald-400" : "text-slate-500"}>
                      {activePassenger.special_assistance ? "Yes (+2000 pts)" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <span className="text-slate-400">Boarding Status:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                        activePassenger.status === "Checked-in"
                          ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                          : activePassenger.status === "Booked"
                          ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30"
                          : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                      }`}
                    >
                      {activePassenger.status}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-12 text-center text-slate-500 space-y-2">
                <Armchair className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs">Seat {selectedSeat} is currently unoccupied.</p>
                <p className="text-[11px] text-slate-600">Available for standby or rebooked passenger assignment.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Matrix index mapping: 2D array representation in <code>seat_matrix.py</code>.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
