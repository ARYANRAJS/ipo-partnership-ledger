import React from 'react';
import { 
  X, 
  Building2, 
  Calendar, 
  Flame, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowUpRight,
  ExternalLink,
  Users,
  Briefcase,
  DollarSign
} from 'lucide-react';
import { formatINR } from '../utils/calculations.js';

export default function IPODetailsModal({ isOpen, onClose, ipo, onApply, onOpenCheckIPO }) {
  if (!isOpen || !ipo) return null;

  const lotPrice = ipo.lotPrice || (ipo.lotSize * 150);
  const retailProfit = ipo.gmpRetailLot || (ipo.lotSize * ipo.gmpAmount);
  const hniProfit = ipo.gmpHniLots || (ipo.lotSize * 14 * ipo.gmpAmount);
  const sub = ipo.subscription || { qib: 4.2, nii: 12.4, rii: 28.5, total: 18.4 };

  return (
    <div className="fixed inset-0 z-[99999] bg-[#020617]/95 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative z-[100000] my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-mono font-extrabold rounded ${
                ipo.type === 'MAINBOARD' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              }`}>
                {ipo.type}
              </span>
              <span className={`px-2 py-0.5 text-[10px] font-mono font-extrabold rounded ${
                ipo.status === 'OPEN' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                ipo.status === 'UPCOMING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {ipo.status}
              </span>
            </div>
            <h2 className="font-extrabold text-xl text-white mt-1.5">{ipo.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Issue Size: <strong className="text-white">{ipo.issueSize}</strong></p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live GMP & Listing Estimate Spotlight Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1.5">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Grey Market Premium (GMP) Live Ticker:</span>
            </span>
            <span className="font-mono font-extrabold text-base text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20 flex items-center space-x-1">
              <ArrowUpRight className="w-4 h-4" />
              <span>+₹{ipo.gmpAmount} (+{ipo.gmpPercent}%)</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-900 text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Est. Listing Price</span>
              <strong className="text-emerald-400 font-mono text-sm">{ipo.estListingPrice}</strong>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Last GMP Heard</span>
              <strong className="text-slate-200 font-mono text-xs">{ipo.lastHeard || 'Recent'}</strong>
            </div>
          </div>
        </div>

        {/* Bidding Category Profits (Retail vs HNI) */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Estimated Profit By Investor Category</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium block">Retail Category (1 Lot / {ipo.lotSize} shares)</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Investment: {formatINR(lotPrice)}</span>
                <strong className="font-mono font-bold text-emerald-400 text-sm">{formatINR(retailProfit)}</strong>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] font-medium block">Small HNI Category (14 Lots / {ipo.lotSize * 14} shares)</span>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Investment: {formatINR(lotPrice * 14)}</span>
                <strong className="font-mono font-bold text-emerald-400 text-sm">{formatINR(hniProfit)}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Live Subscription Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Bidding Subscriptions</h4>
            <span className="text-xs font-mono font-bold text-emerald-400">Total Bids: {sub.total}x 🔥</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">QIB Category</span>
              <strong className="text-slate-200 font-bold text-sm">{sub.qib}x</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">NII (HNI) Category</span>
              <strong className="text-indigo-300 font-bold text-sm">{sub.nii}x</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Retail (RII) Category</span>
              <strong className="text-emerald-400 font-bold text-sm">{sub.rii}x</strong>
            </div>
          </div>
        </div>

        {/* Timeline Dates Calendar */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">IPO Timeline Schedule</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-slate-500 text-[10px] block">Open Date</span>
              <strong className="text-white font-semibold text-xs">{ipo.openDate}</strong>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-slate-500 text-[10px] block">Close Date</span>
              <strong className="text-white font-semibold text-xs">{ipo.closeDate}</strong>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-slate-500 text-[10px] block">Allotment Date</span>
              <strong className="text-indigo-300 font-semibold text-xs">{ipo.allotmentDate}</strong>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-0.5">
              <span className="text-slate-500 text-[10px] block">Listing Date</span>
              <strong className="text-emerald-400 font-semibold text-xs">{ipo.listingDate || 'TBA'}</strong>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center space-x-3">
          <button
            onClick={() => {
              onClose();
              if (onOpenCheckIPO) onOpenCheckIPO(ipo.name);
            }}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 transition-all flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify Bids on NSE</span>
          </button>
          
          <button
            onClick={() => {
              onClose();
              if (onApply) onApply(ipo.name, lotPrice, ipo.lotSize);
            }}
            className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-lg shadow-sky-600/30 transition-all flex items-center justify-center space-x-1.5 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply This IPO ({formatINR(lotPrice)})</span>
          </button>
        </div>

      </div>
    </div>
  );
}
