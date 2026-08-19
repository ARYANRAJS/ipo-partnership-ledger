import React from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { formatINR } from '../utils/calculations.js';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  UserCheck, 
  Sparkles,
  Trash2,
  Calendar,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

export default function IPOCard({ ipo, onOpenExitModal, onOpenReinvestModal, onOpenCheckIPO }) {
  const { partners, accounts, updateApplicationStatus, deleteIPO } = useIPOLedger();

  const getPartnerName = (id) => {
    const p = partners.find(item => item.id === id);
    if (p && p.name) return p.name;
    if (id === 'p-self') return 'Me (Primary)';
    if (id === 'p-vishal') return 'Vishal';
    if (id === 'p-partner3') return 'Partner 3 (Rohit)';
    return id ? id.replace(/^p-/, '').toUpperCase() : 'Partner';
  };

  const getAccountName = (id) => accounts.find(a => a.id === id)?.name || 'Default Bank';

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${ipo.name}"? This action cannot be undone.`)) {
      deleteIPO(ipo.id);
    }
  };

  return (
    <div className="p-5 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl">
      
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-lg text-white tracking-tight">{ipo.name}</h3>
            <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
              ipo.status === 'BLOCKED' ? 'badge-blocked' :
              ipo.status === 'ALLOTTED' ? 'badge-allotted' :
              ipo.status === 'SOLD' ? 'badge-sold' : 'badge-unallotted'
            }`}>
              {ipo.status}
            </span>
          </div>
          <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1 font-mono">
            <span>Applied: {ipo.applyDate}</span>
            <span>•</span>
            <span>Lot Price: <strong className="text-white">{formatINR(ipo.lotPrice)}</strong> ({ipo.sharesPerLot} shares)</span>
          </div>
        </div>

        <button
          onClick={handleDelete}
          title="Delete IPO Record"
          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {ipo.notes && (
        <p className="text-xs text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
          💡 {ipo.notes}
        </p>
      )}

      {/* Applications List */}
      <div className="space-y-3">
        <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
          Linked Lot Applications ({ipo.applications?.length || 0})
        </h4>

        {ipo.applications?.map((app, index) => {
          const applicantName = getPartnerName(app.applicantPartnerId);
          const payerName = getPartnerName(app.payerPartnerId);
          const isPayerDifferent = app.applicantPartnerId !== app.payerPartnerId;

          return (
            <div 
              key={app.id} 
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3"
            >
              {/* Top Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white flex items-center space-x-1">
                      <UserCheck className="w-4 h-4 text-indigo-400" />
                      <span>Account: {applicantName}</span>
                    </span>
                    {isPayerDifferent && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Paid by {payerName}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center space-x-3">
                    <span>Lots: <strong>{app.lots || 1}</strong></span>
                    <span>Amount: <strong className="text-emerald-400 font-mono">{formatINR(app.amount)}</strong></span>
                    <span>Payer: <strong className="text-slate-200">{payerName}</strong></span>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center space-x-2">
                  {app.status === 'BLOCKED' && (
                    <>
                      <button
                        onClick={() => updateApplicationStatus(ipo.id, app.id, 'ALLOTTED')}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all flex items-center space-x-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Allotted 🎉</span>
                      </button>
                      <button
                        onClick={() => updateApplicationStatus(ipo.id, app.id, 'NOT_ALLOTTED')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all flex items-center space-x-1"
                      >
                        <XCircle className="w-3.5 h-3.5 text-slate-400" />
                        <span>Not Allotted</span>
                      </button>
                    </>
                  )}

                  {app.status === 'ALLOTTED' && (
                    <button
                      onClick={() => onOpenExitModal(ipo, app)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Record Sale / Exit</span>
                    </button>
                  )}

                  {app.status === 'NOT_ALLOTTED' && (
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400 italic">Unblocked back to bank</span>
                      {!app.reinvestedToAppId ? (
                        <button
                          onClick={() => onOpenReinvestModal(app.id)}
                          className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs transition-all flex items-center space-x-1"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Re-invest Fund</span>
                        </button>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Re-invested
                        </span>
                      )}
                    </div>
                  )}

                  {app.status === 'SOLD' && (
                    <span className="px-2.5 py-1 text-xs font-bold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Exit Recorded</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Partnership percentage split bar - ONLY SHOW ACTIVE PARTICIPATING PARTNERS (>0%) */}
              <div className="space-y-1 bg-slate-900/60 p-2.5 rounded-lg">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Partnership Split & Rights:</span>
                </div>
                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                  {app.partners
                    ?.filter(p => p.percentage > 0)
                    ?.map(p => {
                      const name = getPartnerName(p.partnerId);
                      const partnerCapShare = (app.amount * p.percentage) / 100;
                      return (
                        <div 
                          key={p.partnerId} 
                          className="px-2.5 py-1 rounded bg-slate-800/90 text-slate-200 font-medium text-xs border border-slate-700/80 flex items-center space-x-1.5"
                        >
                          <span className="font-bold text-indigo-300">{name}</span>
                          <span className="text-slate-400">({p.percentage}%)</span>
                          <span className="font-mono text-emerald-400 text-[11px]">[{formatINR(partnerCapShare)}]</span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Exit details breakdown if SOLD - ONLY SHOW ACTIVE PARTICIPATING PARTNERS (>0%) */}
              {app.status === 'SOLD' && app.exitDetails && (
                <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="text-xs text-slate-300">
                      <span>Total Sale Proceeds: </span>
                      <strong className="font-mono text-sm text-white">{formatINR(app.exitDetails.totalSaleAmount)}</strong>
                      <span className="text-slate-400 block sm:inline sm:ml-2">
                        (Received by: <strong className="text-indigo-300">{getPartnerName(app.exitDetails.moneyReceivedPartnerId)}</strong>)
                      </span>
                    </div>

                    {/* Net PnL badge */}
                    {(() => {
                      const pnl = app.exitDetails.totalSaleAmount - app.amount;
                      const isProfit = pnl >= 0;
                      return (
                        <div className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono inline-flex items-center space-x-1 ${
                          isProfit ? 'text-emerald-400 bg-emerald-500/20' : 'text-rose-400 bg-rose-500/20'
                        }`}>
                          {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                          <span>Net P&L: {formatINR(pnl)}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Partner Share of Profit / Loss - ONLY SHOW ACTIVE PARTICIPATING PARTNERS (>0%) */}
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1 text-xs pt-1 border-t border-indigo-500/20">
                    {app.partners
                      ?.filter(p => p.percentage > 0)
                      ?.map(p => {
                        const pnl = app.exitDetails.totalSaleAmount - app.amount;
                        const partnerPnLShare = (pnl * p.percentage) / 100;
                        const name = getPartnerName(p.partnerId);
                        return (
                          <div key={p.partnerId} className="bg-slate-900/80 p-2 rounded border border-slate-800 flex-1 min-w-[140px]">
                            <span className="text-slate-400 block text-[10px]">{name} ({p.percentage}%)</span>
                            <span className={`font-mono font-bold ${partnerPnLShare >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {partnerPnLShare >= 0 ? '+' : ''}{formatINR(partnerPnLShare)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
