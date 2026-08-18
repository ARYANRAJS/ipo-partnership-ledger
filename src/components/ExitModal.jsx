import React, { useState } from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { formatINR } from '../utils/calculations.js';
import confetti from 'canvas-confetti';
import { X, TrendingUp, TrendingDown, CheckCircle2, DollarSign } from 'lucide-react';

export default function ExitModal({ isOpen, onClose, targetData }) {
  const { partners, recordExit, showToast } = useIPOLedger();

  if (!isOpen || !targetData) return null;
  const { ipo, app } = targetData;

  const lotCost = app.amount || ipo.lotPrice;
  const [totalSaleAmount, setTotalSaleAmount] = useState(lotCost * 1.3); // Default demo 30% profit
  const [moneyReceivedPartnerId, setMoneyReceivedPartnerId] = useState(app.applicantPartnerId || partners[0]?.id);
  const [soldDate, setSoldDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  const pnl = Number(totalSaleAmount) - lotCost;
  const isProfit = pnl >= 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!totalSaleAmount || Number(totalSaleAmount) <= 0) {
      showToast("Please enter a valid Total Sale Amount!", "warning");
      return;
    }

    recordExit(ipo.id, app.id, {
      soldDate,
      totalSaleAmount: Number(totalSaleAmount),
      moneyReceivedPartnerId,
      notes
    });

    if (pnl > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {}
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="font-extrabold text-lg text-white">Record Listing & Sale Exit</h2>
            <p className="text-xs text-slate-400">{ipo.name} • Original Cost: <strong className="font-mono text-emerald-400">{formatINR(lotCost)}</strong></p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Total Sale Proceeds Received (₹) *</label>
            <div className="relative">
              <input
                type="number"
                required
                value={totalSaleAmount}
                onChange={(e) => setTotalSaleAmount(Number(e.target.value))}
                placeholder="e.g. 25000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-base font-bold font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Enter total money received after selling the allotted shares.</p>
          </div>

          {/* Real-time Profit/Loss Preview Card */}
          <div className={`p-4 rounded-xl border space-y-2 ${
            isProfit 
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-950/30 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-bold text-sm">
                {isProfit ? <TrendingUp className="w-4 h-4 text-emerald-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                <span>Calculated Net {isProfit ? 'Profit' : 'Loss'}</span>
              </div>
              <span className="font-mono font-extrabold text-base">
                {isProfit ? '+' : ''}{formatINR(pnl)}
              </span>
            </div>

            {/* Split per partner preview */}
            <div className="border-t border-slate-800/80 pt-2 space-y-1">
              <span className="text-[11px] text-slate-400 block font-medium">Automatic Partner Split:</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {app.partners?.map(p => {
                  const partnerPnL = (pnl * p.percentage) / 100;
                  const name = partners.find(pt => pt.id === p.partnerId)?.name || p.partnerId;
                  return (
                    <div key={p.partnerId} className="bg-slate-900/80 p-2 rounded border border-slate-800">
                      <span className="text-slate-400 block text-[10px] truncate">{name} ({p.percentage}%)</span>
                      <span className={`font-mono font-bold ${partnerPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {partnerPnL >= 0 ? '+' : ''}{formatINR(partnerPnL)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Money Receiver */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Which Partner's Bank Account Received the Money? *</label>
            <select
              value={moneyReceivedPartnerId}
              onChange={(e) => setMoneyReceivedPartnerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.isSelf ? '(You)' : ''}</option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              The ledger will automatically create debt entries for this partner to settle shares with others.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Sale Date</label>
            <input
              type="date"
              value={soldDate}
              onChange={(e) => setSoldDate(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Update Hisab Ledger</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
