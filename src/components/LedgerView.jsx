import React from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { formatINR } from '../utils/calculations.js';
import { Scale, Wallet, ArrowRightLeft, CheckCircle2, History, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LedgerView({ onOpenSettleModal }) {
  const { partners, accounts, ipos, settlements, ledger } = useIPOLedger();

  const getPartnerDisplayName = (partnerId) => {
    const p = partners.find(item => item.id === partnerId);
    if (p && p.name) return p.name;
    if (partnerId === 'p-self') return 'Me (Primary)';
    if (partnerId === 'p-vishal') return 'Vishal';
    if (partnerId === 'p-partner3') return 'Partner 3 (Rohit)';
    return partnerId.replace(/^p-/, '').toUpperCase();
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Visual Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Scale className="w-6 h-6 text-indigo-400" />
            <h2 className="font-extrabold text-xl text-white">Hisab-Kitab Partnership Ledger</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time pairwise debt calculation matrix factoring upfront capital payments, allotments, exit proceeds, and profit sharing.
          </p>
        </div>

        <button
          onClick={() => onOpenSettleModal && onOpenSettleModal({})}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center space-x-2 transition-all active:scale-95 shrink-0 cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>Record Direct Settlement</span>
        </button>
      </div>

      {/* Partner Balances Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {partners.map(p => {
          const bal = Math.round(ledger.balances[p.id] || 0);
          const isReceivable = bal > 0;
          const isPayable = bal < 0;
          const isSettled = bal === 0;

          const pAcc = accounts.find(a => a.partnerId === p.id);

          return (
            <div key={p.id} className="p-5 rounded-2xl glass-card border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">{getPartnerDisplayName(p.id)} {p.isSelf ? '(You)' : ''}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">{pAcc ? pAcc.name : p.upiOrBank}</span>
                </div>
                <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                  isReceivable ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  isPayable ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                  'bg-slate-800 text-slate-400 border border-slate-700'
                }`}>
                  {isReceivable ? 'RECEIVABLE' : isPayable ? 'PAYABLE' : 'SETTLED'}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Net Ledger Balance:</span>
                <span className={`font-mono font-extrabold text-lg ${
                  isReceivable ? 'text-emerald-400' : isPayable ? 'text-rose-400' : 'text-slate-300'
                }`}>
                  {formatINR(bal)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pairwise Debt Matrix ("Who Owes Whom") */}
      <div className="p-6 rounded-2xl glass-card border border-slate-800 space-y-4">
        <h3 className="font-bold text-base text-white">Smart Debt Matrix ("Who Owes Whom")</h3>

        {ledger.pairwiseDebts.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm text-white">All Accounts Fully Settled!</h4>
            <p className="text-xs text-slate-400">No partner owes money to any other partner at this moment. Every investment, refund, and profit share is 100% balanced.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ledger.pairwiseDebts.map((tx, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5 text-xs">
                      <strong className="text-rose-300 font-bold">{getPartnerDisplayName(tx.fromPartnerId)}</strong>
                      <span className="text-slate-400">owes</span>
                      <strong className="text-emerald-400 font-bold">{getPartnerDisplayName(tx.toPartnerId)}</strong>
                    </div>
                    <span className="font-mono text-sm text-white font-extrabold">{formatINR(tx.amount)}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenSettleModal && onOpenSettleModal({
                    fromPartnerId: tx.fromPartnerId,
                    toPartnerId: tx.toPartnerId,
                    amount: tx.amount
                  })}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
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
                  <th key={p.id} className="py-3 px-3 text-right">{getPartnerDisplayName(p.id)} Effect</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {ledger.appBreakdowns.map((item, idx) => {
                const payerName = getPartnerDisplayName(item.payerId);
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
                    <td className="py-3 px-3 font-sans text-indigo-300 font-bold">{payerName}</td>
                    {partners.map(p => {
                      const eff = Math.round(item.balances[p.id] || 0);
                      return (
                        <td key={p.id} className={`py-3 px-3 text-right font-bold ${
                          eff > 0 ? 'text-emerald-400' : eff < 0 ? 'text-rose-400' : 'text-slate-400'
                        }`}>
                          {eff > 0 ? '+' : ''}{formatINR(eff)}
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
              const fromName = getPartnerDisplayName(s.fromPartnerId);
              const toName = getPartnerDisplayName(s.toPartnerId);
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
