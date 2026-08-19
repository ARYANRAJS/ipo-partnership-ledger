import React, { useState } from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { formatINR } from '../utils/calculations.js';
import { 
  Lock, 
  TrendingUp, 
  RefreshCw, 
  CheckCircle2, 
  ArrowRightLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  Plus, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Scale
} from 'lucide-react';

export default function Dashboard({ onOpenNewIPO, onOpenReinvest, onOpenSettleModal }) {
  const { 
    metrics, 
    ledger, 
    partners, 
    ipos, 
    setActiveTab,
    setStatusFilter
  } = useIPOLedger();

  const getPartnerDisplayName = (partnerId) => {
    const p = partners.find(item => item.id === partnerId);
    if (p && p.name) return p.name;
    if (partnerId === 'p-self') return 'Me (Primary)';
    if (partnerId === 'p-vishal') return 'Vishal';
    if (partnerId === 'p-partner3') return 'Partner 3 (Rohit)';
    return partnerId ? partnerId.replace(/^p-/, '').toUpperCase() : 'Partner';
  };

  // Find failed IPO applications that can be recycled/re-invested
  const uninvestedApps = [];
  ipos.forEach(ipo => {
    (ipo.applications || []).forEach(app => {
      if (app.status === 'NOT_ALLOTTED' && !app.reinvestedToAppId) {
        uninvestedApps.push({ ipo, app });
      }
    });
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Recycled Funds / Re-invest Alert Banner */}
      {uninvestedApps.length > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-start space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 mt-0.5 sm:mt-0">
              <RefreshCw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm text-amber-300">
                  {formatINR(metrics.recycledFundsPool)} Released Funds Available to Re-invest!
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-400/20 text-amber-300">
                  {uninvestedApps.length} Un-allotted Lot{uninvestedApps.length > 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Money from {uninvestedApps[0].ipo.name} was unblocked. Re-invest it into a new upcoming IPO application now.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenReinvest(uninvestedApps[0].app.id)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-md shadow-amber-500/20 whitespace-nowrap flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Re-invest Released Cash</span>
          </button>
        </div>
      )}

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Blocked Funds */}
        <div className="p-4 rounded-xl glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Lock className="w-16 h-16 text-amber-400" />
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Currently Blocked Capital</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-white font-mono">
            {formatINR(metrics.totalBlocked)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Awaiting Allotment</span>
            <span className="font-semibold text-amber-400">{ipos.filter(i => i.status === 'BLOCKED').length} IPOs</span>
          </div>
        </div>

        {/* KPI 2: Net Realized Profit/Loss */}
        <div className="p-4 rounded-xl glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Net Realized Profit / Loss</span>
          </div>
          <div className={`mt-2 text-2xl font-extrabold tracking-tight font-mono flex items-center space-x-1 ${
            metrics.netRealizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}>
            {metrics.netRealizedPnL >= 0 ? (
              <ArrowUpRight className="w-6 h-6 text-emerald-400 inline" />
            ) : (
              <ArrowDownRight className="w-6 h-6 text-rose-400 inline" />
            )}
            <span>{formatINR(metrics.netRealizedPnL)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span className="text-emerald-400">+Profit: {formatINR(metrics.totalRealizedProfit)}</span>
            <span className="text-rose-400">-Loss: {formatINR(metrics.totalRealizedLoss)}</span>
          </div>
        </div>

        {/* KPI 3: Recycled Cash Pool */}
        <div className="p-4 rounded-xl glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <RefreshCw className="w-16 h-16 text-cyan-400" />
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <RefreshCw className="w-4 h-4 text-cyan-400" />
            <span>Released / Unblocked Pool</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-cyan-300 font-mono">
            {formatINR(metrics.recycledFundsPool)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
            <span>Refunded Applications</span>
            <span className="font-semibold text-cyan-400">{metrics.unallottedCount} Lots</span>
          </div>
        </div>

        {/* KPI 4: Allotment Rate */}
        <div className="p-4 rounded-xl glass-panel relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-16 h-16 text-indigo-400" />
          </div>
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Allotment Success Rate</span>
          </div>
          <div className="mt-2 text-2xl font-extrabold tracking-tight text-white font-mono flex items-baseline space-x-1">
            <span>{metrics.allotmentRate}%</span>
            <span className="text-xs text-slate-400 font-normal">({metrics.allottedCount}/{metrics.totalApplicationsCount} Lots)</span>
          </div>
          <div className="mt-2 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${metrics.allotmentRate}%` }} 
            />
          </div>
        </div>

      </div>

      {/* Main Section: Hisab-Kitab Ledger Matrix */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <Scale className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-base text-white">Smart Debt Matrix ("Who Owes Whom")</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Net consolidated balance taking into account capital paid, allotment refunds, and profit/loss sharing.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onOpenSettleModal({})}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-semibold text-xs border border-emerald-500/30 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Record Direct Settlement</span>
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all flex items-center space-x-1 cursor-pointer"
            >
              <span>Detailed Ledger</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Pairwise Debt Cards */}
        {ledger.pairwiseDebts.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm text-slate-200">All Accounts Fully Settled!</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No partner owes money to any other partner at this moment. Every investment, refund, and profit share is 100% balanced.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ledger.pairwiseDebts.map((tx, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-xl glass-card border border-indigo-500/20 flex items-center justify-between gap-3 relative overflow-hidden"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-rose-400">{getPartnerDisplayName(tx.fromPartnerId)}</span>
                    <span className="text-xs text-slate-400">owes</span>
                    <span className="font-bold text-sm text-emerald-400">{getPartnerDisplayName(tx.toPartnerId)}</span>
                  </div>
                  <div className="text-xl font-extrabold text-white font-mono">
                    {formatINR(tx.amount)}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Net pending payment
                  </p>
                </div>

                <button
                  onClick={() => onOpenSettleModal({ fromPartnerId: tx.fromPartnerId, toPartnerId: tx.toPartnerId, amount: tx.amount })}
                  className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/30 whitespace-nowrap cursor-pointer"
                >
                  Settle Up
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Active IPO Applications Grid */}
      <div className="p-5 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center space-x-2">
            <span>Recent & Active Applications</span>
          </h3>
          <button
            onClick={() => setActiveTab('ipos')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Applications</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ipos.slice(0, 4).map(ipo => {
            const apps = ipo.applications || [];
            return (
              <div key={ipo.id} className="p-4 rounded-xl glass-card border border-slate-800 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{ipo.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Applied: {ipo.applyDate}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-extrabold rounded-full ${
                    ipo.status === 'BLOCKED' ? 'badge-blocked' :
                    ipo.status === 'ALLOTTED' ? 'badge-allotted' :
                    ipo.status === 'SOLD' ? 'badge-sold' : 'badge-unallotted'
                  }`}>
                    {ipo.status}
                  </span>
                </div>

                {/* Application breakdown */}
                <div className="space-y-2 border-t border-slate-800/80 pt-2 text-xs">
                  {apps.map(app => {
                    const applicant = getPartnerDisplayName(app.applicantPartnerId);
                    const payer = getPartnerDisplayName(app.payerPartnerId);
                    return (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900/60 p-2.5 rounded-lg gap-2">
                        <div>
                          <span className="font-semibold text-slate-200">Acc: <strong className="text-white font-bold">{applicant}</strong></span>
                          <span className="text-[11px] text-slate-400 block">Paid by: <strong className="text-indigo-300">{payer}</strong></span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-white text-sm">{formatINR(app.amount)}</span>
                          <div className="flex items-center justify-end space-x-1 flex-wrap gap-y-1 mt-0.5">
                            {app.partners
                              ?.filter(p => p.percentage > 0)
                              ?.map(p => {
                                const partnerName = getPartnerDisplayName(p.partnerId);
                                return (
                                  <span key={p.partnerId} className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                    {partnerName}: {p.percentage}%
                                  </span>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
