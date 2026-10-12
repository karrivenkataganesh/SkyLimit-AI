import React, { useState } from "react";
import {
  Plane,
  TrendingUp,
  Grid,
  ListOrdered,
  FileCode,
  BookOpen,
  Sparkles,
  RefreshCw,
  Github,
  CheckCircle,
  AlertCircle,
  PanelLeft,
  ChevronRight,
} from "lucide-react";
import { ParticleBackground } from "./components/ParticleBackground";
import { SimulationDashboard } from "./components/SimulationDashboard";
import { CabinSeatMap } from "./components/CabinSeatMap";
import { PriorityQueueVisualizer } from "./components/PriorityQueueVisualizer";
import { CurriculumExplorer } from "./components/CurriculumExplorer";
import { MathematicalReference } from "./components/MathematicalReference";
import { FlightParams, OverbookingAnalysis, Passenger } from "./types";
import { computeProtectionScore } from "./utils/mathEngine";

// Seed realistic passengers across all cabin classes (INR Fares)
const INITIAL_PASSENGERS: Passenger[] = [
  {
    booking_id: "BK-1001",
    passenger_name: "Eleanor Vance",
    fare_class: "First",
    fare_paid: 95000,
    tier: "Platinum",
    checkin_time: "2026-09-20 06:15",
    has_connecting_flight: true,
    special_assistance: false,
    protection_score: 2346,
    assigned_seat: "1A",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1002",
    passenger_name: "Dr. Marcus Chen",
    fare_class: "First",
    fare_paid: 88000,
    tier: "Gold",
    checkin_time: "2026-09-20 06:40",
    has_connecting_flight: false,
    special_assistance: false,
    protection_score: 1859,
    assigned_seat: "1B",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1003",
    passenger_name: "Sarah Jenkins",
    fare_class: "Business",
    fare_paid: 58000,
    tier: "Gold",
    checkin_time: "2026-09-20 07:10",
    has_connecting_flight: true,
    special_assistance: false,
    protection_score: 1607,
    assigned_seat: "4A",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1004",
    passenger_name: "David Kim",
    fare_class: "Business",
    fare_paid: 52000,
    tier: "Silver",
    checkin_time: "2026-09-20 08:05",
    has_connecting_flight: false,
    special_assistance: false,
    protection_score: 1124,
    assigned_seat: "4B",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1005",
    passenger_name: "Elena Rostova",
    fare_class: "Premium_Economy",
    fare_paid: 32000,
    tier: "Silver",
    checkin_time: "2026-09-20 09:12",
    has_connecting_flight: true,
    special_assistance: false,
    protection_score: 1069,
    assigned_seat: "9A",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1006",
    passenger_name: "Samuel O'Connor",
    fare_class: "Premium_Economy",
    fare_paid: 28000,
    tier: "Standard",
    checkin_time: "2026-09-20 10:20",
    has_connecting_flight: false,
    special_assistance: false,
    protection_score: 595,
    assigned_seat: "9B",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1007",
    passenger_name: "Amina Al-Mansoor",
    fare_class: "Economy",
    fare_paid: 18500,
    tier: "Gold",
    checkin_time: "2026-09-20 07:30",
    has_connecting_flight: true,
    special_assistance: false,
    protection_score: 959,
    assigned_seat: "15A",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1008",
    passenger_name: "Lucas Miller (Vulnerable)",
    fare_class: "Economy",
    fare_paid: 6200,
    tier: "Standard",
    checkin_time: "2026-09-20 12:45",
    has_connecting_flight: false,
    special_assistance: false,
    protection_score: 276,
    assigned_seat: "15B",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1009",
    passenger_name: "Chloe Zhang",
    fare_class: "Economy",
    fare_paid: 7200,
    tier: "Standard",
    checkin_time: "2026-09-20 11:50",
    has_connecting_flight: false,
    special_assistance: false,
    protection_score: 285,
    assigned_seat: "15C",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1010",
    passenger_name: "Robert Torres",
    fare_class: "Economy",
    fare_paid: 8400,
    tier: "Silver",
    checkin_time: "2026-09-20 10:15",
    has_connecting_flight: false,
    special_assistance: false,
    protection_score: 447,
    assigned_seat: "16A",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1011",
    passenger_name: "Grace Hopper",
    fare_class: "Economy",
    fare_paid: 9500,
    tier: "Standard",
    checkin_time: "2026-09-20 09:40",
    has_connecting_flight: false,
    special_assistance: true, // Immune via special assistance
    protection_score: 2305,
    assigned_seat: "16B",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1012",
    passenger_name: "Liam Foster",
    fare_class: "Economy",
    fare_paid: 6800,
    tier: "Standard",
    checkin_time: "2026-09-20 13:10",
    has_connecting_flight: false,
    special_assistance: false,
    protection_score: 277,
    assigned_seat: "16C",
    status: "Booked",
  },
  {
    booking_id: "BK-1013",
    passenger_name: "Maya Patel",
    fare_class: "Economy",
    fare_paid: 11200,
    tier: "Silver",
    checkin_time: "2026-09-20 08:30",
    has_connecting_flight: true,
    special_assistance: false,
    protection_score: 768,
    assigned_seat: "17A",
    status: "Checked-in",
  },
  {
    booking_id: "BK-1014",
    passenger_name: "Kevin Wright",
    fare_class: "Economy",
    fare_paid: 6000,
    tier: "Standard",
    checkin_time: "2026-09-20 13:25",
    has_connecting_flight: false,
    special_assistance: false,
    protection_score: 272,
    assigned_seat: "17B",
    status: "Checked-in",
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"simulation" | "seatmap" | "priorityqueue" | "curriculum" | "math">(
    "simulation"
  );
  const [curriculumCategory, setCurriculumCategory] = useState<"all" | "frontend" | "backend" | "java-core" | "python">("all");

  // Handle URL hash and redirection parameters
  React.useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes("frontend")) {
        setActiveTab("curriculum");
        setCurriculumCategory("frontend");
      } else if (hash.includes("backend")) {
        setActiveTab("curriculum");
        setCurriculumCategory("backend");
      } else if (hash.includes("java-core") || hash.includes("java")) {
        setActiveTab("curriculum");
        setCurriculumCategory("java-core");
      } else if (hash.includes("python")) {
        setActiveTab("curriculum");
        setCurriculumCategory("python");
      } else if (hash.includes("curriculum")) {
        setActiveTab("curriculum");
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const [flightParams, setFlightParams] = useState<FlightParams>({
    route: "DEL-BOM",
    capacity: 180,
    baseFare: 6500,
    bumpPenalty: 13000,
    historicalNoShowRate: 0.08,
    timeOfDay: "Evening",
    dayOfWeek: "Friday",
    businessClassRatio: 0.25,
  });

  const [analysis, setAnalysis] = useState<OverbookingAnalysis | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiModelUsed, setAiModelUsed] = useState("gemini-3.6-flash");
  const [aiError, setAiError] = useState<string | null>(null);

  const [passengers, setPassengers] = useState<Passenger[]>(INITIAL_PASSENGERS);

  const navItems = [
    {
      id: "simulation" as const,
      label: "Simulation & Dual-Axis Curve",
      shortLabel: "Simulation",
      badge: "Stochastic",
      icon: TrendingUp,
    },
    {
      id: "seatmap" as const,
      label: "Cabin Seat Matrix (2D Array)",
      shortLabel: "Seat Matrix",
      badge: "Matrices",
      icon: Grid,
    },
    {
      id: "priorityqueue" as const,
      label: "Priority Queue (Min-Heap)",
      shortLabel: "Priority Heap",
      badge: "heapq",
      icon: ListOrdered,
    },
    {
      id: "curriculum" as const,
      label: "Architecture & Code Lab",
      shortLabel: "Code Lab",
      badge: "Multi-Stack",
      icon: FileCode,
    },
    {
      id: "math" as const,
      label: "Mathematical Formulations",
      shortLabel: "Math Bounds",
      badge: "Theory",
      icon: BookOpen,
    },
  ];

  // Trigger server-side Gemini prediction API
  const handleRunAiAnalysis = async () => {
    setLoadingAi(true);
    setAiError(null);

    try {
      const res = await fetch("/api/predict-overbooking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(flightParams),
      });

      const data = await res.json();
      const analysisData = data.analysis || data.data;
      if (data.success && analysisData) {
        setAnalysis(analysisData);
        if (data.model_used || data.modelUsed) {
          setAiModelUsed(data.model_used || data.modelUsed);
        }
      } else {
        setAiError(data.error || "Unable to retrieve AI analysis.");
      }
    } catch (err: any) {
      console.error("AI Request Failed:", err);
      setAiError(err.message || "Network error while connecting to AI optimizer.");
    } finally {
      setLoadingAi(false);
    }
  };

  // Add passenger to state
  const handleAddPassenger = (newPax: Passenger) => {
    setPassengers((prev) => [newPax, ...prev]);
  };

  // Involuntary Bump passenger
  const handleBumpPassenger = (bookingId: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.booking_id === bookingId ? { ...p, status: "Bumped" } : p))
    );
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col relative selection:bg-sky-500 selection:text-white font-sans">
      {/* Three.js Interactive Particle Canvas (Custom GLSL Shader Materials) */}
      <ParticleBackground />

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Brand & Left Side Controls */}
          <div className="flex items-center gap-3">
            {/* Plane symbol box without overlapping badges */}
            <div className="shrink-0">
              <div
                id="brand-plane-symbol-box"
                className="w-10 h-10 rounded-xl flex items-center justify-center border border-sky-400/30 shadow-md bg-gradient-to-tr from-sky-600 to-indigo-600 shadow-sky-500/20"
              >
                <Plane className="w-5 h-5 text-white transform -rotate-45" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Airline Overbooking Manager</span>
                </h1>
                <span className="hidden md:inline text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  CS Curriculum Lab
                </span>
              </div>
            </div>
          </div>

          {/* Backend Health & Active Tab Indicator */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Resilient Model Ladder Active</span>
            </div>

            {/* Mobile / Compact Quick View Chip */}
            <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 text-xs font-medium flex items-center gap-1.5">
              <span className="text-slate-500 text-[11px]">Active:</span>
              <span className="font-semibold text-slate-200">
                {navItems.find((n) => n.id === activeTab)?.shortLabel}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: Permanent Left-Side Navigation Sidebar + Content Area */}
      <div className="flex-1 flex w-full relative z-10 overflow-hidden">
        {/* Permanent Left-Side Navigation Panel */}
        <aside
          id="left-navigation-panel"
          className="shrink-0 w-64 sm:w-72 lg:w-80 border-r border-slate-800/80 bg-slate-950/85 backdrop-blur-2xl flex flex-col z-30"
        >
          {/* Panel Header */}
          <div className="p-4 border-b border-slate-800/80 flex items-center gap-2">
            <PanelLeft className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Module Options
            </span>
          </div>

          {/* Navigation Option Items permanently displayed on the left */}
          <nav
            id="left-sidebar-navigation-menu"
            className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar"
          >
            <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Select Curriculum Workspace
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-option-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center justify-between gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all cursor-pointer text-left group ${
                    isActive
                      ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-600/25 border border-sky-400/30"
                      : "text-slate-300 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-800/80 text-slate-400 group-hover:text-sky-400 group-hover:bg-slate-800"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="font-semibold text-xs truncate leading-snug">
                        {item.label}
                      </div>
                      <div
                        className={`text-[10px] font-mono ${
                          isActive ? "text-sky-100/80" : "text-slate-400"
                        }`}
                      >
                        {item.badge}
                      </div>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive
                        ? "text-white translate-x-0.5"
                        : "text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5"
                    }`}
                  />
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer info */}
          <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-slate-400">Flight Route:</span>
                <span className="font-mono font-bold text-sky-400">{flightParams.route}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Capacity / No-Show:</span>
                <span className="font-mono text-slate-300">
                  {flightParams.capacity} pax ({(flightParams.historicalNoShowRate * 100).toFixed(0)}%)
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
            {/* Error notification if API fails */}
            {aiError && (
              <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{aiError}</span>
                </div>
                <button
                  onClick={() => setAiError(null)}
                  className="text-rose-400 hover:text-white font-bold ml-4"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* View Switcher */}
            {activeTab === "simulation" && (
              <SimulationDashboard
                params={flightParams}
                onParamsChange={setFlightParams}
                analysis={analysis}
                onRunAiAnalysis={handleRunAiAnalysis}
                loadingAi={loadingAi}
                aiModelUsed={aiModelUsed}
              />
            )}

            {activeTab === "seatmap" && <CabinSeatMap passengers={passengers} />}

            {activeTab === "priorityqueue" && (
              <PriorityQueueVisualizer
                passengers={passengers}
                onAddPassenger={handleAddPassenger}
                onBumpPassenger={handleBumpPassenger}
              />
            )}

            {activeTab === "curriculum" && (
              <CurriculumExplorer
                key={curriculumCategory}
                initialCategory={curriculumCategory}
              />
            )}

            {activeTab === "math" && <MathematicalReference />}
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/80 backdrop-blur-md py-4 text-center text-xs text-slate-500 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            Airline Overbooking Manager • Computer Science Academic Curriculum Mini-Project
          </div>
          <div className="text-[11px] text-slate-400">
            Powered by Three.js GLSL Shaders, Python 3 Data Structures, and Google Gemini
          </div>
        </div>
      </footer>
    </div>
  );
}
