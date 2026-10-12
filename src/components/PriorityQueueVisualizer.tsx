import React, { useState } from "react";
import {
  ListOrdered,
  UserMinus,
  UserPlus,
  Shield,
  Clock,
  DollarSign,
  AlertOctagon,
  Award,
  Layers,
  ArrowDown,
  History,
} from "lucide-react";
import { Passenger } from "../types";
import { computeProtectionScore } from "../utils/mathEngine";

interface Props {
  passengers: Passenger[];
  onAddPassenger: (newPassenger: Passenger) => void;
  onBumpPassenger: (bookingId: string) => void;
}

export const PriorityQueueVisualizer: React.FC<Props> = ({
  passengers,
  onAddPassenger,
  onBumpPassenger,
}) => {
  const [viewMode, setViewMode] = useState<"sorted" | "heapArray">("sorted");
  const [showAddModal, setShowAddModal] = useState(false);
  const [bumpAuditLog, setBumpAuditLog] = useState<Array<{ name: string; id: string; fare: number; score: number; compensation: number; timestamp: string }>>([]);

  // Form State for Enqueueing a new passenger
  const [newName, setNewName] = useState("");
  const [newFareClass, setNewFareClass] = useState<"First" | "Business" | "Premium_Economy" | "Economy">("Economy");
  const [newFarePaid, setNewFarePaid] = useState(6500);
  const [newTier, setNewTier] = useState<"Platinum" | "Gold" | "Silver" | "Standard">("Standard");
  const [newConnecting, setNewConnecting] = useState(false);
  const [newSpecial, setNewSpecial] = useState(false);

  // Active passengers eligible for bumping (status != Bumped)
  const activeQueue = passengers.filter((p) => p.status !== "Bumped");

  // Sorted by Protection Score Ascending (Min-Heap root is index 0 = lowest score = first to bump)
  const sortedQueue = [...activeQueue].sort((a, b) => a.protection_score - b.protection_score);

  // Simulate Min-Heap array representation
  const heapArray = [...sortedQueue];

  // Handler: Bump the next passenger (Min-Heap root)
  const handleBumpNext = () => {
    if (sortedQueue.length === 0) return;
    const target = sortedQueue[0];
    const compRate = Math.min(target.fare_paid * 2.5, 25000); // DGCA / CAR Denied Boarding Compensation Rule (INR)
    
    onBumpPassenger(target.booking_id);

    setBumpAuditLog((prev) => [
      {
        name: target.passenger_name,
        id: target.booking_id,
        fare: target.fare_paid,
        score: target.protection_score,
        compensation: Math.round(compRate),
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
  };

  // Handler: Enqueue custom passenger
  const handleEnqueue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const bookingId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const timeStr = `${now.toISOString().split("T")[0]} ${now.toTimeString().split(" ")[0]}`;

    const score = computeProtectionScore({
      fare_class: newFareClass,
      fare_paid: newFarePaid,
      tier: newTier,
      checkin_time: timeStr,
      has_connecting_flight: newConnecting,
      special_assistance: newSpecial,
    });

    const newPassenger: Passenger = {
      booking_id: bookingId,
      passenger_name: newName.trim(),
      fare_class: newFareClass,
      fare_paid: newFarePaid,
      tier: newTier,
      checkin_time: timeStr,
      has_connecting_flight: newConnecting,
      special_assistance: newSpecial,
      protection_score: score,
      status: "Checked-in",
    };

    onAddPassenger(newPassenger);
    setNewName("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Action Header Strip */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Min-Heap Data Structure
            </span>
            <span className="text-xs text-slate-400">Queue Capacity: {activeQueue.length} Active Passengers</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-sky-400" />
            <span>Passenger Bumping &amp; Rebooking Priority Queue</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Min-Heap Root (`heap[0]`) holds the passenger with the lowest Protection Score (highest bumping vulnerability).
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="bg-slate-800/80 p-1 rounded-lg border border-slate-700 flex text-xs font-medium">
            <button
              onClick={() => setViewMode("sorted")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "sorted" ? "bg-sky-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Vulnerability Rank
            </button>
            <button
              onClick={() => setViewMode("heapArray")}
              className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === "heapArray" ? "bg-sky-600 text-white shadow-sm" : "text-slate-400 hover:text-white"
              }`}
            >
              Heap Array View
            </button>
          </div>

          {/* Add Passenger */}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-sky-400" />
            <span>Enqueue Pax</span>
          </button>

          {/* Bump Next Passenger */}
          <button
            onClick={handleBumpNext}
            disabled={sortedQueue.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-all cursor-pointer"
          >
            <UserMinus className="w-4 h-4" />
            <span>Bump Root Pax (O(log n))</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Priority List + Heap Explanation & Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: The Priority Queue Items */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <span className="font-semibold text-white">
              {viewMode === "sorted" ? "Bumping Vulnerability Order (Lowest Score Bumped First)" : "Binary Heap Array (heapq representation)"}
            </span>
            <span className="text-slate-400">Total in Queue: {activeQueue.length}</span>
          </div>

          {/* Queue List */}
          <div className="mt-3 space-y-2 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
            {sortedQueue.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <AlertOctagon className="w-8 h-8 mx-auto opacity-30 text-rose-400 mb-2" />
                <p className="text-xs">No active passengers in the queue.</p>
              </div>
            ) : (
              sortedQueue.map((p, index) => {
                const isRoot = index === 0;
                return (
                  <div
                    key={p.booking_id}
                    className={`p-3.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isRoot
                        ? "bg-rose-950/40 border-rose-600/70 shadow-md shadow-rose-950/50 ring-1 ring-rose-500/50"
                        : "bg-slate-800/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {/* Rank & Passenger Info */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-full text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                          isRoot
                            ? "bg-rose-600 text-white animate-pulse"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {index + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{p.passenger_name}</span>
                          <span className="text-[11px] font-mono text-slate-400">({p.booking_id})</span>
                          {isRoot && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                              ▲ NEXT TO BUMP
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">
                            {p.fare_class} (₹{p.fare_paid.toLocaleString("en-IN")})
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">
                            Tier: {p.tier}
                          </span>
                          {p.has_connecting_flight && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                              Connecting
                            </span>
                          )}
                          {p.special_assistance && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50">
                              Assistance
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Protection Score & Metrics */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 text-xs font-mono border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block uppercase">Protection Score</span>
                        <span className={`text-base font-black ${isRoot ? "text-rose-400" : "text-amber-400"}`}>
                          {p.protection_score}
                        </span>
                      </div>

                      {/* Dequeue Button */}
                      <button
                        onClick={() => onBumpPassenger(p.booking_id)}
                        title="Involuntarily bump this passenger"
                        className="px-2.5 py-1.5 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-[11px] transition-all cursor-pointer"
                      >
                        Bump
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Mathematical Protection Score Formula & Audit Log */}
        <div className="space-y-6">
          {/* Protection Score Mathematical Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>Protection Score Formula</span>
            </h4>

            <div className="mt-3 text-xs text-slate-300 space-y-2">
              <p className="font-mono text-[11px] text-sky-300 bg-slate-950 p-2 rounded border border-slate-800">
                Score = W_fare + W_tier + (Fare_INR / 100)*0.5 + T_early + Modifiers
              </p>

              <div className="space-y-1.5 text-[11px] text-slate-400 pt-1">
                <div className="flex justify-between">
                  <span>First / Business Class:</span>
                  <span className="text-white font-mono">+1000 / +600 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Premium Eco / Economy:</span>
                  <span className="text-white font-mono">+350 / +150 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Platinum / Gold Tier:</span>
                  <span className="text-white font-mono">+500 / +350 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Connecting Flight Protection:</span>
                  <span className="text-emerald-400 font-mono">+300 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Special Assistance Shield:</span>
                  <span className="text-amber-400 font-mono">+2000 pts</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gate Bump Audit Log */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2">
                <History className="w-4 h-4 text-rose-400" />
                <span>Gate Bumping Audit Log</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">{bumpAuditLog.length} Bumped</span>
            </h4>

            <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
              {bumpAuditLog.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No passengers bumped yet.</p>
              ) : (
                bumpAuditLog.map((log, i) => (
                  <div key={`${log.id}-${i}`} className="p-2.5 rounded bg-slate-950 border border-rose-900/40 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">{log.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{log.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Score: {log.score}</span>
                      <span className="text-emerald-400 font-semibold">Compensation: ₹{log.compensation.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Passenger Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-sky-400" />
                <span>Enqueue Passenger into Priority Queue</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnqueue} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Passenger Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Rivera"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Fare Class</label>
                  <select
                    value={newFareClass}
                    onChange={(e) => setNewFareClass(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="First">First Class</option>
                    <option value="Business">Business Class</option>
                    <option value="Premium_Economy">Premium Economy</option>
                    <option value="Economy">Economy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Fare Paid (₹ INR)</label>
                  <input
                    type="number"
                    min={500}
                    max={250000}
                    step={100}
                    value={newFarePaid}
                    onChange={(e) => setNewFarePaid(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Frequent Flyer Tier</label>
                <select
                  value={newTier}
                  onChange={(e) => setNewTier(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-white focus:outline-none focus:border-sky-500"
                >
                  <option value="Platinum">Platinum (+500 pts)</option>
                  <option value="Gold">Gold (+350 pts)</option>
                  <option value="Silver">Silver (+200 pts)</option>
                  <option value="Standard">Standard (+50 pts)</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newConnecting}
                    onChange={(e) => setNewConnecting(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <span>Has Tight Connecting Flight (+300 protection bonus)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={newSpecial}
                    onChange={(e) => setNewSpecial(e.target.checked)}
                    className="rounded bg-slate-800 border-slate-700 text-sky-500 focus:ring-0"
                  />
                  <span>Requires Special Medical / Disability Assistance (+2000 protection immunity)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold"
                >
                  Insert into Heap (O(log n))
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
