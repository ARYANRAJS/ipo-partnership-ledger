import React, { useState } from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { formatINR } from '../utils/calculations.js';
import { X, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

export default function ReinvestModal({ isOpen, onClose, sourceAppId }) {
  const { ipos, partners, recycleFunds, addIPO } = useIPOLedger();

  // Find source application & IPO
  let sourceApp = null;
  let sourceIpo = null;

  ipos.forEach(i => {
    (i.applications || []).forEach(a => {
      if (a.id === sourceAppId) {
        sourceApp = a;
        sourceIpo = i;
      }
    });
  });

  const [mode, setMode] = useState('EXISTING'); // 'EXISTING' or 'NEW'
  const [targetIpoId, setTargetIpoId] = useState('');
  
  // New IPO fields if creating a fresh IPO
  const [newIpoName, setNewIpoName] = useState('');
  const [newLotPrice, setNewLotPrice] = useState(sourceApp ? sourceApp.amount : 15000);

  if (!isOpen || !sourceApp) return null;

  const releasedAmount = sourceApp.amount;
  const applicantName = partners.find(p => p.id === sourceApp.applicantPartnerId)?.name || 'Partner Account';
  const payerName = partners.find(p => p.id === sourceApp.payerPartnerId)?.name || 'Payer Account';

  const handleSubmit = (e) => {
    e.preventDefault();

    let destIpoId = targetIpoId;

    if (mode === 'NEW') {
      if (!newIpoName.trim()) {
        showToast("Please enter a new IPO name!", "warning");
        return;
      }
      const freshIpo = {
        id: `ipo-${Date.now()}`,
        name: newIpoName,
        lotPrice: Number(newLotPrice),
        applyDate: new Date().toISOString().slice(0, 10),
        status: "BLOCKED",
        notes: `Re-invested from unblocked funds of ${sourceIpo.name}`,
        applications: []
      };
      addIPO(freshIpo);
      destIpoId = freshIpo.id;
    }

    if (!destIpoId) {
      showToast("Please select or create a target IPO!", "warning");
      return;
    }

    const newAppDetails = {
      id: `app-${Date.now()}`,
      applicantPartnerId: sourceApp.applicantPartnerId,
      payerPartnerId: sourceApp.payerPartnerId,
      accountId: sourceApp.accountId,
      lots: 1,
      amount: releasedAmount,
      status: "BLOCKED",
      partners: sourceApp.partners
    };

    recycleFunds(sourceApp.id, destIpoId, newAppDetails);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-lg text-white">Re-invest Released Funds ("Wapis Naye Me Laga Diya")</h2>
              <p className="text-xs text-slate-400">Transfer released bank cash to a new IPO application</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Source Fund Card */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
            <span className="font-bold text-amber-300 uppercase tracking-wider block text-[10px]">Source Released Capital:</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white">{sourceIpo.name}</span>
              <span className="font-mono font-extrabold text-base text-amber-300">{formatINR(releasedAmount)}</span>
            </div>
            <p className="text-slate-300 text-[11px]">
              Account: <strong>{applicantName}</strong> • Original Payer: <strong>{payerName}</strong>
            </p>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">Re-invest Into:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMode('EXISTING')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                  mode === 'EXISTING' 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Existing Active IPO
              </button>
              <button
                type="button"
                onClick={() => setMode('NEW')}
                className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all ${
                  mode === 'NEW' 
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                Create Fresh IPO
              </button>
            </div>
          </div>

          {mode === 'EXISTING' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Target IPO</label>
              <select
                value={targetIpoId}
                onChange={(e) => setTargetIpoId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Choose IPO --</option>
                {ipos.filter(i => i.id !== sourceIpo.id).map(i => (
                  <option key={i.id} value={i.id}>{i.name} ({formatINR(i.lotPrice)})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Upcoming IPO Name *</label>
                <input
                  type="text"
                  required
                  value={newIpoName}
                  onChange={(e) => setNewIpoName(e.target.value)}
                  placeholder="e.g. Premier Energies IPO, NTPC Green"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Lot Price (₹)</label>
                <input
                  type="number"
                  value={newLotPrice}
                  onChange={(e) => setNewLotPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Footer Submit */}
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
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Confirm Re-investment</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
