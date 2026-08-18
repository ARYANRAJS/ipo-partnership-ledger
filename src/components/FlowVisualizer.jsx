import React from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { formatINR } from '../utils/calculations.js';
import { GitCommit, ArrowRight, Wallet, Lock, CheckCircle2, RefreshCw, DollarSign, UserCheck } from 'lucide-react';

export default function FlowVisualizer() {
  const { ipos, partners, accounts } = useIPOLedger();

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Visual Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center space-x-2">
          <GitCommit className="w-6 h-6 text-indigo-400" />
          <h2 className="font-extrabold text-xl text-white">Money Lifecycle & Fund Flow Chart</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Visual trace of how your capital moves from bank accounts into IPO applications, unblocks, re-invests, and turns into realized profit.
        </p>
      </div>

      {/* Flow Cards Per IPO */}
      <div className="space-y-6">
        {ipos.map(ipo => {
          return (
            <div key={ipo.id} className="p-5 rounded-2xl glass-card border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-3">
                  <h3 className="font-bold text-base text-white">{ipo.name}</h3>
                  <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                    ipo.status === 'BLOCKED' ? 'badge-blocked' :
                    ipo.status === 'ALLOTTED' ? 'badge-allotted' :
                    ipo.status === 'SOLD' ? 'badge-sold' : 'badge-unallotted'
                  }`}>
                    {ipo.status}
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">Lot Price: {formatINR(ipo.lotPrice)}</span>
              </div>

              {/* Flow Steps for each application */}
              <div className="space-y-4">
                {ipo.applications?.map(app => {
                  const applicantName = partners.find(p => p.id === app.applicantPartnerId)?.name || 'Unknown';
                  const payerName = partners.find(p => p.id === app.payerPartnerId)?.name || 'Unknown';
                  const receiverName = app.exitDetails 
                    ? (partners.find(p => p.id === app.exitDetails.moneyReceivedPartnerId)?.name || 'Receiver') 
                    : null;

                  return (
                    <div key={app.id} className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 space-y-3">
                      
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                        
                        {/* Step 1: Upfront Payer */}
                        <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-lg border border-slate-800 w-full lg:w-1/4">
                          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                            <Wallet className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">1. Upfront Capital</span>
                            <span className="font-bold text-xs text-white block">{payerName}</span>
                            <span className="font-mono text-xs text-emerald-400 font-bold">{formatINR(app.amount)}</span>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-600 hidden lg:block" />

                        {/* Step 2: Demat Application */}
                        <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-lg border border-slate-800 w-full lg:w-1/4">
                          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">2. Applied In Account</span>
                            <span className="font-bold text-xs text-white block">{applicantName}</span>
                            <span className="text-[11px] text-slate-400">
                              Split: {app.partners?.map(p => `${p.percentage}%`).join(' / ')}
                            </span>
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-slate-600 hidden lg:block" />

                        {/* Step 3: Allotment & Outcome */}
                        <div className="flex items-center space-x-3 bg-slate-900 p-3 rounded-lg border border-slate-800 w-full lg:w-1/4">
                          <div className={`p-2 rounded-lg ${
                            app.status === 'NOT_ALLOTTED' ? 'bg-slate-800 text-slate-400' :
                            app.status === 'SOLD' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {app.status === 'NOT_ALLOTTED' ? <RefreshCw className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">3. Outcome / Status</span>
                            <span className="font-bold text-xs text-white block">{app.status}</span>
                            {app.status === 'NOT_ALLOTTED' && (
                              <span className="text-[11px] text-cyan-400 font-semibold block">
                                {app.reinvestedToAppId ? 'Re-invested into New IPO' : 'Released back to Payer'}
                              </span>
                            )}
                            {app.status === 'SOLD' && app.exitDetails && (
                              <span className="font-mono text-xs text-emerald-400 font-bold block">
                                Sold: {formatINR(app.exitDetails.totalSaleAmount)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Step 4: Final Settlement Receiver if Sold */}
                        {app.status === 'SOLD' && (
                          <>
                            <ArrowRight className="w-4 h-4 text-slate-600 hidden lg:block" />
                            <div className="flex items-center space-x-3 bg-indigo-950/40 p-3 rounded-lg border border-indigo-500/30 w-full lg:w-1/4">
                              <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                                <DollarSign className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Proceeds Receiver</span>
                                <span className="font-bold text-xs text-white block">{receiverName}</span>
                                <span className="text-[10px] text-slate-400 block">Hisab ledger updated</span>
                              </div>
                            </div>
                          </>
                        )}

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
  );
}
