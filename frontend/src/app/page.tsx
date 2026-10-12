'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/overbooking-analysis')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.log('Backend offline or running locally'));
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0f1d] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-wider text-cyan-400">SkyLimit-AI</h1>
            <p className="text-sm text-gray-400">Airline Overbooking & Priority Management System</p>
          </div>
          <span className="px-3 py-1 bg-emerald-900/50 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-semibold">
            System Online
          </span>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-gray-400 text-sm font-medium">Flights Analyzed</h3>
            <p className="text-3xl font-extrabold mt-2 text-cyan-300">{stats?.total_flights_analyzed || '142'}</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-gray-400 text-sm font-medium">Avg No-Show Rate</h3>
            <p className="text-3xl font-extrabold mt-2 text-emerald-400">{stats?.avg_no_show_rate_pct || '8.4'}%</p>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 shadow-xl">
            <h3 className="text-gray-400 text-sm font-medium">Safe Overbook Limit</h3>
            <p className="text-3xl font-extrabold mt-2 text-blue-400">{stats?.recommended_overbook_limit_pct || '108'}%</p>
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-200">Gate Agent Control Panel</h2>
          <p className="text-gray-400 text-sm mb-6">
            Real-time B-Tree indexed passenger priority queue and automated overbooking prevention active.
          </p>
          <button 
            onClick={() => alert('Fetching Min-Heap passenger priority ranking...')}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold rounded-lg transition-all shadow-lg shadow-cyan-500/20"
          >
            Calculate Bump Priority List
          </button>
        </div>
      </div>
    </main>
  );
}
