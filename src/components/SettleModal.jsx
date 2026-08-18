import React, { useState, useEffect } from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { X, ArrowRightLeft, Check, Sparkles } from 'lucide-react';
import { formatINR } from '../utils/calculations.js';

export default function SettleModal({ isOpen, onClose, initialData }) {
  const { partners, addSettlement, showToast } = useIPOLedger();

  const [fromPartnerId, setFromPartnerId] = useState('');
  const [toPartnerId, setToPartnerId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI / GPay');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData?.fromPartnerId) {
        setFromPartnerId(initialData.fromPartnerId);
        setToPartnerId(initialData.toPartnerId || partners.find(p => p.id !== initialData.fromPartnerId)?.id || '');
        setAmount(initialData.amount || '');
      } else {
        setFromPartnerId(partners[0]?.id || '');
        setToPartnerId(partners[1]?.id || partners[0]?.id || '');
        setAmount('');
      }
      setPaymentMode('UPI / GPay');
      setNote('');
    }
  }, [isOpen, initialData, partners]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fromPartnerId || !toPartnerId) {
      showToast("Please select both Payer and Receiver!", "warning");
      return;
    }

    if (fromPartnerId === toPartnerId) {
      showToast("Payer and Receiver cannot be the same partner!", "warning");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      showToast("Please enter a valid settlement amount!", "warning");
      return;
    }

    addSettlement({
      id: `settle-${Date.now()}`,
      fromPartnerId,
      toPartnerId,
      amount: Number(amount),
      date: new Date().toISOString().slice(0, 10),
      paymentMode,
      note
    });

    onClose();
  };

  const fromName = partners.find(p => p.id === fromPartnerId)?.name || 'Payer';
  const toName = partners.find(p => p.id === toPartnerId)?.name || 'Receiver';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-fade-in my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="font-extrabold text-base text-white">Record Direct Settlement Payment</h2>
              <p className="text-xs text-slate-400">Clear debt between partners ("Hisab Settle Karo")</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          
          {/* Quick Summary Pill */}
          {amount && Number(amount) > 0 && (
            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-medium space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Settlement Transaction:</span>
                <span className="font-mono font-extrabold text-white">{formatINR(amount)}</span>
              </div>
              <p className="text-[11px] text-slate-300">
                <strong className="text-rose-400">{fromName}</strong> pays <strong className="text-emerald-400">{toName}</strong>
              </p>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Who Paid? (Payer)</label>
            <select
              value={fromPartnerId}
              onChange={(e) => setFromPartnerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.isSelf ? '(You)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Who Received? (Receiver)</label>
            <select
              value={toPartnerId}
              onChange={(e) => setToPartnerId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {partners.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.isSelf ? '(You)' : ''}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Amount Paid (₹) *</label>
            <input
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 36672"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white font-mono font-bold focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Payment Mode</label>
            <input
              type="text"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              placeholder="e.g. GPay / PhonePe / Bank Transfer"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notes / Description</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Settlement for Hyundai IPO profit share"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Save Settlement</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
