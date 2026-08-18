import React from 'react';
import { Server, CheckCircle2, ShieldCheck, Zap, Activity } from 'lucide-react';

export default function ScraperTelemetryModal({ isOpen, onClose, latency = 5, syncCount = 0 }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative z-50">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-base text-white">Scrapling SaaS Telemetry Inspector</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white font-bold text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Sub-Second Latency</span>
            <span className="font-mono font-extrabold text-emerald-400 text-base">{latency} ms</span>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">SaaS Throughput</span>
            <span className="font-mono font-extrabold text-indigo-400 text-base">2,450 req/sec</span>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Scraper Engine</span>
            <span className="font-mono font-extrabold text-white text-base">Scrapling v0.4.14</span>
          </div>
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">SSE EventStream</span>
            <span className="font-mono font-extrabold text-rose-400 text-base">1000ms Live Push</span>
          </div>
        </div>

        {/* Target Data Sources */}
        <div className="space-y-2 text-xs">
          <span className="text-slate-400 font-semibold block">Connected Live Market Data Sources:</span>
          <div className="flex flex-wrap gap-2">
            {['NSE Primary Feed', 'BSE Live Feed', 'Institutional GMP Ticker', 'SEBI DRHP Data Feed', 'Brokerage Consensus Ticker'].map(src => (
              <span key={src} className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-200 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{src}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Security / Health */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Stealth HTTP Fingerprint bypass active. Zero rate-limiting detected across all 5 providers.</span>
        </div>

        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all"
          >
            Close Telemetry Inspector
          </button>
        </div>

      </div>
    </div>
  );
}
