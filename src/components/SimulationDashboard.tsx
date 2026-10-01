import React, { useState, useMemo } from "react";
import {
  Plane,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  IndianRupee,
  Users,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Info,
} from "lucide-react";
import { FlightParams, OverbookingAnalysis } from "../types";
import { generateSimulationCurves } from "../utils/mathEngine";

interface Props {
  params: FlightParams;
  onParamsChange: (newParams: FlightParams) => void;
  analysis: OverbookingAnalysis | null;
  onRunAiAnalysis: () => void;
  loadingAi: boolean;
  aiModelUsed: string;
}

export const SimulationDashboard: React.FC<Props> = ({
  params,
  onParamsChange,
  analysis,
  onRunAiAnalysis,
  loadingAi,
  aiModelUsed,
}) => {
  const [hoveredPointIndex, setHoveredPointIndex] = useState<number | null>(null);

  // Compute exact stochastic curve data
  const { curveData, optimalPolicy, criticalRatio } = useMemo(() => {
    return generateSimulationCurves(params);
  }, [params]);

  // Selected or active point on the curve
  const activePoint = hoveredPointIndex !== null ? curveData[hoveredPointIndex] : optimalPolicy;

  // Route presets (Indian Domestic & International corridors with INR fares)
  const ROUTE_PRESETS = [
    { label: "DEL ➔ BOM (Metro Trunk)", route: "DEL-BOM", cap: 180, fare: 6500, bump: 13000, ns: 0.082 },
    { label: "BLR ➔ DEL (Corridor)", route: "BLR-DEL", cap: 186, fare: 7800, bump: 15600, ns: 0.075 },
    { label: "BOM ➔ DXB (International)", route: "BOM-DXB", cap: 256, fare: 26000, bump: 52000, ns: 0.068 },
    { label: "DEL ➔ LHR (Long-haul)", route: "DEL-LHR", cap: 285, fare: 58000, bump: 116000, ns: 0.078 },
    { label: "MAA ➔ CCU (Commuter)", route: "MAA-CCU", cap: 160, fare: 5400, bump: 10800, ns: 0.093 },
  ];

  // SVG Chart Dimensions
  const chartWidth = 720;
  const chartHeight = 280;
  const padding = { top: 25, right: 40, bottom: 40, left: 55 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Scale ranges
  const minRatio = curveData[0]?.overbooking_ratio || 100;
  const maxRatio = curveData[curveData.length - 1]?.overbooking_ratio || 125;
  const maxBumpRisk = Math.max(...curveData.map((d) => d.bump_risk_percentage), 15);
  const minProfit = Math.min(...curveData.map((d) => d.net_expected_profit));
  const maxProfit = Math.max(...curveData.map((d) => d.net_expected_profit));

  // Coordinate projections
  const getX = (ratio: number) => padding.left + ((ratio - minRatio) / (maxRatio - minRatio)) * graphWidth;
  const getYRisk = (risk: number) => padding.top + graphHeight - (risk / maxBumpRisk) * graphHeight;
  const getYProfit = (profit: number) => {
    const range = maxProfit - minProfit || 1;
    return padding.top + graphHeight - ((profit - minProfit) / range) * graphHeight;
  };

  // Generate SVG path strings
  const riskPath = curveData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.overbooking_ratio).toFixed(1)} ${getYRisk(d.bump_risk_percentage).toFixed(1)}`)
    .join(" ");

  const profitPath = curveData
    .map((d, i) => `${i === 0 ? "M" : "L"} ${getX(d.overbooking_ratio).toFixed(1)} ${getYProfit(d.net_expected_profit).toFixed(1)}`)
    .join(" ");

  return (
    <div className="space-y-6">
      {/* Top Banner: Route Selector & AI Trigger */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                Route Analysis
              </span>
              <span className="text-xs text-slate-400">Aircraft Capacity: {params.capacity} seats</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
              <Plane className="w-5 h-5 text-sky-400" />
              Flight {params.route} Operational Environment
            </h2>
          </div>

          {/* Quick Route Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Curriculum Presets:</span>
            {ROUTE_PRESETS.map((p) => (
              <button
                key={p.route}
                onClick={() =>
                  onParamsChange({
                    ...params,
                    route: p.route,
                    capacity: p.cap,
                    baseFare: p.fare,
                    bumpPenalty: p.bump,
                    historicalNoShowRate: p.ns,
                  })
                }
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  params.route === p.route
                    ? "bg-sky-600 text-white border-sky-400 font-semibold shadow-sm shadow-sky-500/30"
                    : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {p.route}
              </button>
            ))}
          </div>

          {/* Run AI Analysis Button */}
          <button
            onClick={onRunAiAnalysis}
            disabled={loadingAi}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-medium shadow-md shadow-sky-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loadingAi ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-sky-200" />
            )}
            <span>{loadingAi ? "Analyzing with Gemini..." : "Run AI Risk Optimizer"}</span>
          </button>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-800">
          {/* Capacity Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Aircraft Capacity (Seats)</span>
              <span className="text-white font-mono font-bold">{params.capacity}</span>
            </div>
            <input
              type="range"
              min={50}
              max={350}
              step={1}
              value={params.capacity}
              onChange={(e) => onParamsChange({ ...params, capacity: Number(e.target.value) })}
              className="w-full accent-sky-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50 (Regional)</span>
              <span>350 (Widebody)</span>
            </div>
          </div>

          {/* Base Fare Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Average Ticket Fare (INR / ₹)</span>
              <span className="text-emerald-400 font-mono font-bold">₹{params.baseFare.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={1000}
              max={80000}
              step={200}
              value={params.baseFare}
              onChange={(e) => onParamsChange({ ...params, baseFare: Number(e.target.value) })}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>₹1,000 (Economy)</span>
              <span>₹80,000 (Long-haul)</span>
            </div>
          </div>

          {/* Bump Penalty Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Involuntary Bump Penalty (₹)</span>
              <span className="text-rose-400 font-mono font-bold">₹{params.bumpPenalty.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min={params.baseFare}
              max={params.baseFare * 4}
              step={500}
              value={params.bumpPenalty}
              onChange={(e) => onParamsChange({ ...params, bumpPenalty: Number(e.target.value) })}
              className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>1x Fare</span>
              <span>4x Fare (DGCA / Cap)</span>
            </div>
          </div>

          {/* Historical No-Show Rate */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">Empirical No-Show Rate</span>
              <span className="text-sky-300 font-mono font-bold">
                {(params.historicalNoShowRate * 100).toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={0.02}
              max={0.2}
              step={0.005}
              value={params.historicalNoShowRate}
              onChange={(e) => onParamsChange({ ...params, historicalNoShowRate: Number(e.target.value) })}
              className="w-full accent-sky-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>2.0% (Tight)</span>
              <span>20.0% (Volatile)</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Recommended Capacity */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Optimal Overbook</div>
          <div className="text-2xl font-black text-sky-400 mt-1 font-mono">
            {analysis ? analysis.optimalOverbookingPercentage : optimalPolicy.overbooking_ratio}%
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Authorize <span className="text-white font-bold">{analysis ? analysis.maxTicketsToSell : optimalPolicy.tickets_sold}</span> seats
          </div>
          <div className="absolute top-2 right-2 p-1.5 bg-sky-500/10 rounded-lg text-sky-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        {/* Expected No Shows */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Exp. No-Shows</div>
          <div className="text-2xl font-black text-indigo-300 mt-1 font-mono">
            {analysis ? analysis.expectedNoShows : Math.round(optimalPolicy.tickets_sold * params.historicalNoShowRate * 10) / 10}
          </div>
          <div className="text-xs text-slate-400 mt-1">Passengers absent</div>
          <div className="absolute top-2 right-2 p-1.5 bg-indigo-500/10 rounded-lg text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
        </div>

        {/* Bump Risk Probability */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bump Probability</div>
          <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
            {optimalPolicy.bump_risk_percentage}%
          </div>
          <div className="text-xs text-slate-400 mt-1">Risk of $P(X &gt; C)$</div>
          <div className="absolute top-2 right-2 p-1.5 bg-rose-500/10 rounded-lg text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>

        {/* Expected Bumps (Count) */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Exp. Bumps</div>
          <div className="text-2xl font-black text-amber-400 mt-1 font-mono">
            {analysis ? analysis.expectedBumps : optimalPolicy.expected_bumps}
          </div>
          <div className="text-xs text-slate-400 mt-1">Passengers to rebook</div>
          <div className="absolute top-2 right-2 p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        {/* Revenue Lift */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Net Profit Lift</div>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
            +₹{analysis ? analysis.expectedNetRevenueGain.toLocaleString("en-IN") : optimalPolicy.net_profit_lift.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-slate-400 mt-1">Over 100% capacity cap</div>
          <div className="absolute top-2 right-2 p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
            <IndianRupee className="w-4 h-4" />
          </div>
        </div>

        {/* Newsvendor Critical Ratio */}
        <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl shadow-lg relative overflow-hidden">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Critical Ratio</div>
          <div className="text-2xl font-black text-purple-300 mt-1 font-mono">
            {criticalRatio.toFixed(3)}
          </div>
          <div className="text-xs text-slate-400 mt-1">$C_u / (C_u + C_o)$</div>
          <div className="absolute top-2 right-2 p-1.5 bg-purple-500/10 rounded-lg text-purple-400">
            <Info className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Main Dual-Axis Interactive Chart: Seat Utilization vs Bump Risk */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Seat Utilization vs. Bump Risk Dual-Axis Curve</span>
              <span className="text-xs font-normal px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Binomial Stochastic Model
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hover along the curve to inspect discrete probability points and marginal revenue trade-offs.
            </p>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-500 rounded-full" />
              <span className="text-rose-400">Bump Risk (%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400">Net Profit (₹)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              <span className="text-sky-300">Optimal Peak</span>
            </div>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[680px]">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto select-none"
              onMouseLeave={() => setHoveredPointIndex(null)}
            >
              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1.0].map((frac, i) => {
                const y = padding.top + graphHeight * frac;
                const riskVal = Math.round(maxBumpRisk * (1.0 - frac));
                const profitVal = Math.round(minProfit + (maxProfit - minProfit) * (1.0 - frac));
                return (
                  <g key={i}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={padding.left + graphWidth}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="4 4"
                      strokeWidth={1}
                    />
                    {/* Left axis (Risk %) */}
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      fill="#e11d48"
                      fontSize={10}
                      textAnchor="end"
                      fontFamily="monospace"
                    >
                      {riskVal}%
                    </text>
                    {/* Right axis (Profit ₹) */}
                    <text
                      x={padding.left + graphWidth + 8}
                      y={y + 4}
                      fill="#10b981"
                      fontSize={10}
                      textAnchor="start"
                      fontFamily="monospace"
                    >
                      ₹{profitVal >= 100000 ? (profitVal / 100000).toFixed(1) + "L" : (profitVal / 1000).toFixed(0) + "k"}
                    </text>
                  </g>
                );
              })}

              {/* Optimal Vertical Line */}
              <line
                x1={getX(optimalPolicy.overbooking_ratio)}
                y1={padding.top}
                x2={getX(optimalPolicy.overbooking_ratio)}
                y2={padding.top + graphHeight}
                stroke="#0284c7"
                strokeWidth={2}
                strokeDasharray="5 3"
              />

              {/* Profit Curve (Green) */}
              <path d={profitPath} fill="none" stroke="#10b981" strokeWidth={2.5} />

              {/* Risk Curve (Rose) */}
              <path d={riskPath} fill="none" stroke="#e11d48" strokeWidth={2.5} />

              {/* Interactive Data Points and Hover Zones */}
              {curveData.map((d, index) => {
                const cx = getX(d.overbooking_ratio);
                const cyRisk = getYRisk(d.bump_risk_percentage);
                const cyProfit = getYProfit(d.net_expected_profit);
                const isOptimal = d.tickets_sold === optimalPolicy.tickets_sold;
                const isHovered = hoveredPointIndex === index;

                return (
                  <g key={d.tickets_sold}>
                    {/* Invisible Wide Hit Area for Mouse Hover */}
                    <rect
                      x={cx - graphWidth / (curveData.length * 2)}
                      y={padding.top}
                      width={graphWidth / curveData.length}
                      height={graphHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredPointIndex(index)}
                    />

                    {/* Point on Profit Curve */}
                    <circle
                      cx={cx}
                      cy={cyProfit}
                      r={isOptimal ? 6 : isHovered ? 5 : 3}
                      fill={isOptimal ? "#0284c7" : "#10b981"}
                      stroke="#0f172a"
                      strokeWidth={1.5}
                    />

                    {/* Point on Risk Curve */}
                    <circle
                      cx={cx}
                      cy={cyRisk}
                      r={isHovered ? 5 : 3}
                      fill="#e11d48"
                      stroke="#0f172a"
                      strokeWidth={1.5}
                    />
                  </g>
                );
              })}

              {/* X-Axis labels */}
              {curveData
                .filter((_, i) => i % Math.max(1, Math.floor(curveData.length / 8)) === 0)
                .map((d) => {
                  const x = getX(d.overbooking_ratio);
                  return (
                    <text
                      key={d.tickets_sold}
                      x={x}
                      y={padding.top + graphHeight + 20}
                      fill="#94a3b8"
                      fontSize={10}
                      textAnchor="middle"
                      fontFamily="monospace"
                    >
                      {d.overbooking_ratio}%
                    </text>
                  );
                })}

              {/* X-axis title */}
              <text
                x={padding.left + graphWidth / 2}
                y={padding.top + graphHeight + 35}
                fill="#cbd5e1"
                fontSize={11}
                textAnchor="middle"
                fontWeight="500"
              >
                Authorized Capacity (% of Aircraft Seats)
              </text>
            </svg>
          </div>
        </div>

        {/* Hover / Active Point Inspector Ribbon */}
        <div className="mt-4 p-3.5 bg-slate-950/70 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="font-semibold text-white">Inspecting Capacity Level:</span>
            <span className="font-mono text-sky-400 font-bold bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/50">
              {activePoint.overbooking_ratio}% ({activePoint.tickets_sold} tickets sold)
            </span>
            {activePoint.tickets_sold === optimalPolicy.tickets_sold && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                ★ Global Profit Optimum
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono">
            <div>
              <span className="text-slate-400">Bump Risk: </span>
              <span className="text-rose-400 font-bold">{activePoint.bump_risk_percentage}%</span>
            </div>
            <div>
              <span className="text-slate-400">Expected Bumps: </span>
              <span className="text-amber-400 font-bold">{activePoint.expected_bumps} pax</span>
            </div>
            <div>
              <span className="text-slate-400">Gross Rev: </span>
              <span className="text-slate-200 font-bold">₹{activePoint.gross_revenue.toLocaleString("en-IN")}</span>
            </div>
            <div>
              <span className="text-slate-400">Net Profit: </span>
              <span className="text-emerald-400 font-bold">₹{activePoint.net_expected_profit.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Advisory Box (if available) */}
      {analysis && (
        <div className="bg-gradient-to-r from-sky-950/60 to-indigo-950/60 border border-sky-800/40 rounded-xl p-5 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-sky-500/20 rounded-lg text-sky-400 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Gemini AI Revenue Management Advisory</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-sky-300 font-mono border border-slate-700">
                    Engine: {aiModelUsed}
                  </span>
                </h4>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    analysis.riskRating === "LOW"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : analysis.riskRating === "MODERATE"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {analysis.riskRating} Risk Tier
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{analysis.rationale}</p>
              <div className="text-xs text-sky-300 pt-1 flex items-center gap-1.5 font-medium">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>Rebooking &amp; Standby Advice: {analysis.rebookingPolicyAdvice}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
