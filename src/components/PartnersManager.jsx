import React, { useState } from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { Users, UserPlus, CreditCard, Plus, Check, Trash2 } from 'lucide-react';

export default function PartnersManager() {
  const { partners, accounts, addPartner, deletePartner, addAccount, deleteAccount } = useIPOLedger();

  const [partnerName, setPartnerName] = useState('');
  const [upiOrBank, setUpiOrBank] = useState('');
  const [notes, setNotes] = useState('');

  const [accPartnerId, setAccPartnerId] = useState(partners[0]?.id || '');
  const [accName, setAccName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  const handleAddPartnerSubmit = (e) => {
    e.preventDefault();
    if (!partnerName.trim()) return;

    addPartner({
      id: `partner-${Date.now()}`,
      name: partnerName,
      upiOrBank,
      notes,
      isSelf: false
    });

    setPartnerName('');
    setUpiOrBank('');
    setNotes('');
  };

  const handleAddAccountSubmit = (e) => {
    e.preventDefault();
    if (!accName.trim()) return;

    addAccount({
      id: `acc-${Date.now()}`,
      partnerId: accPartnerId,
      name: accName,
      accountNumber,
      pan: ''
    });

    setAccName('');
    setAccountNumber('');
  };

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-indigo-400" />
          <h2 className="font-extrabold text-xl text-white">Partners & Demat Bank Accounts Directory</h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage your partners (e.g., Vishal, Rohit) and their linked bank & Demat application accounts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Partners List & Add */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Registered Partners ({partners.length})</span>
            </h3>
          </div>

          {/* List of Partners */}
          <div className="space-y-3">
            {partners.map(p => (
              <div key={p.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between group">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-white">{p.name}</span>
                    {p.isSelf && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        YOU (PRIMARY)
                      </span>
                    )}
                  </div>
                  {p.upiOrBank && <p className="text-xs text-slate-400">UPI/Bank: {p.upiOrBank}</p>}
                  {p.notes && <p className="text-[11px] text-slate-500 italic">{p.notes}</p>}
                </div>

                {/* Delete Partner Action */}
                {!p.isSelf && (
                  <button
                    onClick={() => deletePartner(p.id)}
                    title={`Delete partner ${p.name}`}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Form to Add New Partner */}
          <form onSubmit={handleAddPartnerSubmit} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-xs text-indigo-400 uppercase tracking-wider flex items-center space-x-1">
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add New IPO Partner</span>
            </h4>

            <div>
              <input
                type="text"
                required
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Partner Name (e.g. Vishal, Rohit)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <input
                type="text"
                value={upiOrBank}
                onChange={(e) => setUpiOrBank(e.target.value)}
                placeholder="UPI ID / Bank details (e.g. vishal@okicici)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes (e.g. 50-50 partner)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-indigo-600/30"
            >
              Add Partner
            </button>
          </form>

        </div>

        {/* Right Column: Bank Accounts */}
        <div className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-white flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <span>Bank & Demat Accounts ({accounts.length})</span>
            </h3>
          </div>

          {/* Accounts List */}
          <div className="space-y-3">
            {accounts.map(acc => {
              const partner = partners.find(p => p.id === acc.partnerId)?.name || 'Unknown';
              return (
                <div key={acc.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between group">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{acc.name}</span>
                      <span className="text-xs text-indigo-300 font-semibold">({partner})</span>
                    </div>
                    <p className="text-xs font-mono text-slate-400">Acc No: {acc.accountNumber || 'N/A'}</p>
                  </div>

                  {/* Delete Account Action */}
                  <button
                    onClick={() => deleteAccount(acc.id)}
                    title={`Delete account ${acc.name}`}
                    className="p-2 rounded-lg bg-slate-900 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Form to Add Account */}
          <form onSubmit={handleAddAccountSubmit} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h4 className="font-bold text-xs text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Bank / Demat Account</span>
            </h4>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Account Owner</label>
              <select
                value={accPartnerId}
                onChange={(e) => setAccPartnerId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <input
                type="text"
                required
                value={accName}
                onChange={(e) => setAccName(e.target.value)}
                placeholder="Account Nickname (e.g. Vishal SBI Bank)"
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Account Number / Masked No."
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all active:scale-95 shadow-md shadow-emerald-600/30"
            >
              Add Bank Account
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
