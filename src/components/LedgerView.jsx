import React from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { formatINR } from '../utils/calculations.js';
import { Scale, ArrowRightLeft, ShieldCheck, History, Plus } from 'lucide-react';

export default function LedgerView({ onOpenSettleModal }) {
  const { ledger, partners, settlements } = useIPOLedger();

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-indigo-400" />
            <h2 className="font-extrabold text-xl text-white">Hisab-Kitab & Settlement Ledger</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time pairwise consolidation of all money movements: capital blocked by payers, unblocked refunds, listing profits, and losses.
          </p>
        </div>

        <button
          onClick={() => onOpenSettleModal && onOpenSettleModal({})}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record Direct Payment / Settlement</span>
        </button>
      </div>

      {/* Pairwise Net Debt Matrix */}
      <div className="space-y-4">
        <h3 className="font-bold text-base text-white flex items-center space-x-2">
          <span>Net Outstanding Debts ("Who Owes Whom")</span>
        </h3>

        {ledger.pairwiseDebts.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel border border-slate-800 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-base text-slate-200">100% Balanced & Settled!</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No outstanding balance between any partners.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ledger.pairwiseDebts.map((tx, idx) => (
              <div 
                key={idx} 
                className="p-5 rounded-2xl glass-card border border-indigo-500/30 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                  <span>Settlement Pair #{idx + 1}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                    Pending Debt
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-rose-400 block">{tx.fromName}</span>
                    <span className="text-[11px] text-slate-400">owes to</span>
                    <span className="font-bold text-sm text-emerald-400 block">{tx.toName}</span>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-extrabold text-white font-mono">
                      {formatINR(tx.amount)}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onOpenSettleModal && onOpenSettleModal({ fromPartnerId: tx.fromId, toPartnerId: tx.toId, amount: tx.amount })}
                  className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Settle Up {formatINR(tx.amount)}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Itemized Audit Breakdown Per IPO */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white">Itemized IPO Ledger Breakdown</h3>
        <p className="text-xs text-slate-400">Shows how each individual IPO application contributed to partner balances.</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">IPO Name</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Paid By</th>
                {partners.map(p => (
                  <th key={p.id} className="py-3 px-3 text-right">{p.name} Effect</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {ledger.appBreakdowns.map((item, idx) => {
                const payerName = partners.find(p => p.id === item.payerId)?.name || item.payerId;
                return (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="py-3 px-3 font-sans font-bold text-white">{item.ipoName}</td>
                    <td className="py-3 px-3 font-sans">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        item.status === 'BLOCKED' ? 'badge-blocked' :
                        item.status === 'ALLOTTED' ? 'badge-allotted' :
                        item.status === 'SOLD' ? 'badge-sold' : 'badge-unallotted'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{formatINR(item.lotAmount)}</td>
                    <td className="py-3 px-3 font-sans text-indigo-300">{payerName}</td>
                    {partners.map(p => {
                      const eff = Math.round(item.balances[p.id] || 0);
                      return (
                        <td key={p.id} className={`py-3 px-3 text-right font-bold ${
                          eff > 0 ? 'text-emerald-400' : eff < 0 ? 'text-rose-400' : 'text-slate-500'
                        }`}>
                          {eff > 0 ? '+' : ''}{eff === 0 ? '₹0' : formatINR(eff)}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Settlement History Log */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-4">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-base text-white">Manual Settlement History ({settlements.length})</h3>
        </div>

        {settlements.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No manual settlements recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {settlements.map((s, idx) => {
              const fromName = partners.find(p => p.id === s.fromPartnerId)?.name || s.fromPartnerId;
              const toName = partners.find(p => p.id === s.toPartnerId)?.name || s.toPartnerId;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-200">{fromName}</span>
                      <span className="text-slate-500">paid</span>
                      <span className="font-bold text-slate-200">{toName}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        {s.paymentMode || 'UPI'}
                      </span>
                    </div>
                    {s.note && <p className="text-[11px] text-slate-400 mt-0.5">"{s.note}"</p>}
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-sm text-emerald-400">{formatINR(s.amount)}</span>
                    <span className="text-[10px] text-slate-500 block">{s.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
