import React, { useState } from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { X, Plus, Trash2, Check, Sparkles, AlertCircle, UserPlus, CreditCard, Users } from 'lucide-react';

export default function ApplicationModal({ isOpen, onClose, initialData }) {
  const { partners, accounts, addIPO, addPartner, addAccount, showToast } = useIPOLedger();

  const [ipoName, setIpoName] = useState('');
  const [lotPrice, setLotPrice] = useState(15000);
  const [sharesPerLot, setSharesPerLot] = useState(30);
  const [applyDate, setApplyDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');

  // Quick Add Partner/Account state
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickBank, setQuickBank] = useState('');

  const getPartnerDisplayName = (partnerId) => {
    const p = partners.find(item => item.id === partnerId);
    if (p && p.name) return p.name;
    if (partnerId === 'p-self') return 'Me (Self)';
    if (partnerId === 'p-vishal') return 'Vishal';
    if (partnerId === 'p-partner3') return 'Partner 3 (Rohit)';
    return partnerId.replace(/^p-/, '').toUpperCase();
  };

  const createInitialPartners = (preset = '50-50') => {
    if (!partners || partners.length === 0) return [];
    
    if (preset === '50-50') {
      const selfIdx = partners.findIndex(p => p.isSelf);
      const firstIdx = selfIdx !== -1 ? selfIdx : 0;
      const secondIdx = partners.findIndex((_, idx) => idx !== firstIdx);
      
      return partners.map((p, i) => ({
        partnerId: p.id,
        percentage: (i === firstIdx || (secondIdx !== -1 && i === secondIdx)) ? 50 : 0
      }));
    }
    
    if (preset === '3-way') {
      if (partners.length >= 3) {
        return partners.map((p, i) => ({
          partnerId: p.id,
          percentage: i === 0 ? 34 : (i === 1 || i === 2 ? 33 : 0)
        }));
      } else {
        const share = Math.floor(100 / partners.length);
        return partners.map((p, i) => ({
          partnerId: p.id,
          percentage: i === 0 ? 100 - (share * (partners.length - 1)) : share
        }));
      }
    }

    // Solo preset (100% to Self)
    const selfIdx = partners.findIndex(p => p.isSelf);
    const mainIdx = selfIdx !== -1 ? selfIdx : 0;
    return partners.map((p, i) => ({
      partnerId: p.id,
      percentage: i === mainIdx ? 100 : 0
    }));
  };

  // Applications list
  const [applications, setApplications] = useState([]);

  React.useEffect(() => {
    if (isOpen) {
      if (initialData && typeof initialData === 'object') {
        setIpoName(initialData.name || '');
        setLotPrice(initialData.lotPrice || 15000);
        setSharesPerLot(initialData.sharesPerLot || 30);
      } else {
        setIpoName('');
        setLotPrice(15000);
        setSharesPerLot(30);
      }

      setApplications([
        {
          id: `app-${Date.now()}-1`,
          applicantPartnerId: partners.find(p => !p.isSelf)?.id || partners[0]?.id || '',
          payerPartnerId: partners.find(p => p.isSelf)?.id || partners[0]?.id || '',
          lots: 1,
          partners: createInitialPartners('50-50')
        }
      ]);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleAddPartnerQuick = (e) => {
    if (e) e.preventDefault();
    if (!quickName.trim()) return;

    const newPartnerId = `p-${Date.now()}`;
    const newPartner = {
      id: newPartnerId,
      name: quickName.trim(),
      upiOrBank: quickBank.trim() || 'Bank Account',
      notes: 'Added dynamically during IPO application',
      isSelf: false
    };

    const newAccount = {
      id: `acc-${Date.now()}`,
      partnerId: newPartnerId,
      name: `${quickName.trim()} Account`,
      accountNumber: quickBank.trim() ? quickBank.trim().slice(-4) : 'XXXX'
    };

    addPartner(newPartner);
    addAccount(newAccount);

    setApplications(prev => prev.map(app => ({
      ...app,
      partners: [...app.partners, { partnerId: newPartnerId, percentage: 0 }]
    })));

    setQuickName('');
    setQuickBank('');
    setShowQuickAdd(false);
  };

  const handleAddApplication = () => {
    setApplications(prev => [
      ...prev,
      {
        id: `app-${Date.now()}-${prev.length + 1}`,
        applicantPartnerId: partners[0]?.id || '',
        payerPartnerId: partners.find(p => p.isSelf)?.id || partners[0]?.id || '',
        lots: 1,
        partners: createInitialPartners('50-50')
      }
    ]);
  };

  const handleRemoveApplication = (index) => {
    if (applications.length === 1) return;
    setApplications(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateApp = (index, field, value) => {
    setApplications(prev => prev.map((app, i) => i === index ? { ...app, [field]: value } : app));
  };

  const handleTogglePartnerInclusion = (appIndex, partnerId) => {
    setApplications(prev => prev.map((app, idx) => {
      if (idx !== appIndex) return app;

      const current = app.partners.map(p => ({ ...p }));
      const pIdx = current.findIndex(p => p.partnerId === partnerId);
      if (pIdx === -1) return app;

      const isCurrentlyIncluded = current[pIdx].percentage > 0;

      if (isCurrentlyIncluded) {
        // Exclude partner (set 0%)
        current[pIdx].percentage = 0;
      } else {
        // Include partner (give minimum 10%)
        current[pIdx].percentage = 10;
      }

      // Rebalance among active included partners
      const active = current.filter(p => p.percentage > 0);
      if (active.length > 0) {
        const share = Math.floor(100 / active.length);
        const remainder = 100 - (share * active.length);
        
        current.forEach(p => {
          if (p.percentage > 0) p.percentage = share;
        });

        if (remainder > 0) {
          const firstActive = current.find(p => p.percentage > 0);
          if (firstActive) firstActive.percentage += remainder;
        }
      }

      return { ...app, partners: current };
    }));
  };

  const handleAutoBalance = (appIndex) => {
    setApplications(prev => prev.map((app, idx) => {
      if (idx !== appIndex) return app;
      const active = app.partners.filter(p => p.percentage > 0);
      if (active.length === 0) return { ...app, partners: createInitialPartners('50-50') };
      
      const equalShare = Math.floor(100 / active.length);
      const remainder = 100 - (equalShare * active.length);
      
      const rebalanced = app.partners.map(p => {
        if (p.percentage > 0) {
          return { ...p, percentage: equalShare };
        }
        return p;
      });

      if (remainder > 0) {
        const firstActiveIdx = rebalanced.findIndex(p => p.percentage > 0);
        if (firstActiveIdx !== -1) {
          rebalanced[firstActiveIdx].percentage += remainder;
        }
      }

      return { ...app, partners: rebalanced };
    }));
  };

  const handlePartnerPercentageChange = (appIndex, partnerId, newPct) => {
    const targetPct = Math.max(0, Math.min(100, Number(newPct)));

    setApplications(prev => prev.map((app, idx) => {
      if (idx !== appIndex) return app;

      const currentPartners = app.partners.map(p => ({ ...p }));
      const changedIndex = currentPartners.findIndex(p => p.partnerId === partnerId);
      if (changedIndex === -1) return app;

      const oldPct = currentPartners[changedIndex].percentage;
      const diff = targetPct - oldPct;
      if (diff === 0) return app;

      currentPartners[changedIndex].percentage = targetPct;

      const activeOtherPartners = currentPartners.filter(p => p.partnerId !== partnerId && p.percentage > 0);
      const otherSum = activeOtherPartners.reduce((acc, p) => acc + p.percentage, 0);

      if (activeOtherPartners.length > 0) {
        const remainingToDistribute = 100 - targetPct;

        if (otherSum === 0) {
          activeOtherPartners[0].percentage = remainingToDistribute;
        } else {
          let allocated = 0;
          activeOtherPartners.forEach((p, i) => {
            if (i === activeOtherPartners.length - 1) {
              p.percentage = Math.max(0, remainingToDistribute - allocated);
            } else {
              const share = Math.round((p.percentage / otherSum) * remainingToDistribute);
              p.percentage = Math.max(0, share);
              allocated += p.percentage;
            }
          });
        }
      }

      return { ...app, partners: currentPartners };
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ipoName.trim()) {
      showToast("Please enter IPO Name!", "warning");
      return;
    }

    for (let i = 0; i < applications.length; i++) {
      const app = applications[i];
      const sum = app.partners.reduce((acc, p) => acc + p.percentage, 0);
      if (sum !== 100) {
        showToast(`Application #${i + 1} partnership split percentages sum to ${sum}%. Auto-balancing to 100%!`, "warning");
        handleAutoBalance(i);
        return;
      }
    }

    const newIpo = {
      id: `ipo-${Date.now()}`,
      name: ipoName,
      lotPrice: Number(lotPrice),
      sharesPerLot: Number(sharesPerLot),
      applyDate,
      status: "BLOCKED",
      notes,
      applications: applications.map(app => ({
        ...app,
        amount: Number(lotPrice) * Number(app.lots),
        status: "BLOCKED",
        accountId: accounts.find(a => a.partnerId === app.applicantPartnerId)?.id || 'acc-default'
      }))
    };

    addIPO(newIpo);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <h2 className="font-extrabold text-lg text-white">Apply New Multi-Account IPO</h2>
            <p className="text-xs text-slate-400">Select participating partners and configure investment split</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* IPO Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">IPO Company Name *</label>
              <input
                type="text"
                required
                value={ipoName}
                onChange={(e) => setIpoName(e.target.value)}
                placeholder="e.g. Swiggy Limited, Tata Technologies"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price Per Lot (₹) *</label>
              <input
                type="number"
                required
                value={lotPrice}
                onChange={(e) => setLotPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Apply Date</label>
              <input
                type="date"
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Quick Add Partner / Account Panel */}
          {showQuickAdd && (
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 flex items-center space-x-1.5">
                  <UserPlus className="w-4 h-4 text-indigo-400" />
                  <span>Dynamically Add New Partner & Demat Account</span>
                </span>
                <button type="button" onClick={() => setShowQuickAdd(false)} className="text-slate-400 hover:text-white text-xs">✕</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Partner Name (e.g. Rahul, Suresh, Ankit)"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Bank / UPI Details (e.g. HDFC 9012, SBI Bank)"
                  value={quickBank}
                  onChange={(e) => setQuickBank(e.target.value)}
                  className="px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-1">
                <button type="button" onClick={() => setShowQuickAdd(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="button" onClick={handleAddPartnerQuick} className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg shadow">Add & Auto-Select</button>
              </div>
            </div>
          )}

          {/* Applications List Config */}
          <div className="space-y-4 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-200">Lot Applications Configuration</h3>
              <button
                type="button"
                onClick={handleAddApplication}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Application</span>
              </button>
            </div>

            {applications.map((app, idx) => {
              const currentTotal = app.partners.reduce((sum, p) => sum + p.percentage, 0);
              const isBalanced = currentTotal === 100;
              const activePartnersCount = app.partners.filter(p => p.percentage > 0).length;

              return (
                <div key={app.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 relative">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-xs text-indigo-400 uppercase tracking-wider">
                      Application Lot #{idx + 1}
                    </span>
                    {applications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveApplication(idx)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-slate-400">Applicant Demat Account (Owner)</label>
                        <button
                          type="button"
                          onClick={() => setShowQuickAdd(!showQuickAdd)}
                          className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
                        >
                          <UserPlus className="w-3 h-3" />
                          <span>+ New Partner</span>
                        </button>
                      </div>
                      <select
                        value={app.applicantPartnerId}
                        onChange={(e) => handleUpdateApp(idx, 'applicantPartnerId', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        {partners.map(p => {
                          const name = getPartnerDisplayName(p.id);
                          const pAcc = accounts.find(a => a.partnerId === p.id);
                          const detail = pAcc ? ` (${pAcc.name})` : p.upiOrBank ? ` (${p.upiOrBank})` : '';
                          return (
                            <option key={p.id} value={p.id}>
                              {name} {p.isSelf ? '(You)' : ''}{detail}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-medium text-slate-400">Upfront Bank Payer (Who Blocked Money?)</label>
                        <button
                          type="button"
                          onClick={() => setShowQuickAdd(!showQuickAdd)}
                          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center space-x-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>+ New Account</span>
                        </button>
                      </div>
                      <select
                        value={app.payerPartnerId}
                        onChange={(e) => handleUpdateApp(idx, 'payerPartnerId', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                      >
                        {partners.map(p => {
                          const name = getPartnerDisplayName(p.id);
                          const pAcc = accounts.find(a => a.partnerId === p.id);
                          const detail = pAcc ? ` (${pAcc.name})` : p.upiOrBank ? ` (${p.upiOrBank})` : '';
                          return (
                            <option key={p.id} value={p.id}>
                              {name} {p.isSelf ? '(You)' : ''}{detail}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  {/* Partnership Inclusion Checklist & Sliders */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-indigo-400" />
                        <label className="text-xs font-bold text-white">Participating Partners ({activePartnersCount} Active):</label>
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-extrabold rounded-full border ${
                          isBalanced
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          Total: {currentTotal}% {isBalanced ? '✓' : '⚠️'}
                        </span>
                      </div>

                      {!isBalanced && (
                        <button
                          type="button"
                          onClick={() => handleAutoBalance(idx)}
                          className="px-2.5 py-1 text-[11px] rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow transition-all"
                        >
                          Auto-Balance to 100%
                        </button>
                      )}
                    </div>

                    {/* Partner Selection Chips */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {partners.map(p => {
                        const name = getPartnerDisplayName(p.id);
                        const pState = app.partners.find(pt => pt.partnerId === p.id);
                        const isIncluded = pState && pState.percentage > 0;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleTogglePartnerInclusion(idx, p.id)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                              isIncluded
                                ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/50 shadow-md'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center text-[9px] ${
                              isIncluded ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-600'
                            }`}>
                              {isIncluded ? '✓' : ''}
                            </span>
                            <span>{name}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Sliders List */}
                    <div className="space-y-2.5 bg-slate-900/80 p-3.5 rounded-xl border border-slate-800">
                      {app.partners
                        .filter(pt => pt.percentage > 0)
                        .map(pt => {
                          const name = getPartnerDisplayName(pt.partnerId);
                          return (
                            <div key={pt.partnerId} className="flex items-center justify-between space-x-3 text-xs">
                              <span className="w-32 text-white font-bold truncate">{name}</span>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={pt.percentage}
                                onChange={(e) => handlePartnerPercentageChange(idx, pt.partnerId, e.target.value)}
                                className="flex-1 accent-indigo-500"
                              />
                              <span className="w-12 text-right font-mono font-extrabold text-indigo-400 text-sm">{pt.percentage}%</span>
                            </div>
                          );
                        })}

                      {activePartnersCount === 0 && (
                        <p className="text-xs text-amber-400 italic text-center py-1">
                          No partners selected yet. Click any partner chip above to include them!
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Reminders</label>
            <textarea
              rows="2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Vishal's 2nd account, if unblocked transfer to upcoming SME IPO"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

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
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Confirm Application & Block Capital
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
