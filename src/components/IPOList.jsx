import React from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import IPOCard from './IPOCard.jsx';
import { Search, Filter, PlusCircle, Layers } from 'lucide-react';

export default function IPOList({ onOpenNewIPO, onOpenExitModal, onOpenReinvestModal, onOpenCheckIPO }) {
  const { 
    ipos, 
    searchQuery, 
    setSearchQuery, 
    statusFilter, 
    setStatusFilter, 
    partners 
  } = useIPOLedger();

  const statusOptions = [
    { id: 'ALL', label: 'All Applications' },
    { id: 'BLOCKED', label: 'Blocked / Active' },
    { id: 'ALLOTTED', label: 'Allotted' },
    { id: 'NOT_ALLOTTED', label: 'Not Allotted (Refunded)' },
    { id: 'SOLD', label: 'Sold / Exited' },
  ];

  const filteredIPOs = ipos.filter(ipo => {
    // Status filter
    if (statusFilter !== 'ALL') {
      if (ipo.status !== statusFilter && !ipo.applications?.some(a => a.status === statusFilter)) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = ipo.name.toLowerCase().includes(q);
      const partnerMatch = ipo.applications?.some(app => {
        const applicant = partners.find(p => p.id === app.applicantPartnerId)?.name || '';
        const payer = partners.find(p => p.id === app.payerPartnerId)?.name || '';
        return applicant.toLowerCase().includes(q) || payer.toLowerCase().includes(q);
      });
      return nameMatch || partnerMatch;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Search & Filter Header Bar */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search IPO, Vishal, Account..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto no-scrollbar py-1">
          {statusOptions.map(opt => {
            const isActive = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setStatusFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

      </div>

      {/* List / Cards */}
      {filteredIPOs.length === 0 ? (
        <div className="p-12 rounded-2xl glass-panel border border-slate-800 text-center space-y-4">
          <Layers className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h3 className="font-bold text-base text-slate-200">No IPO applications found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL' 
                ? 'Try adjusting your search query or filter selection.'
                : 'Click "+ Apply New IPO" to add your first multi-account application.'}
            </p>
          </div>
          <button
            onClick={onOpenNewIPO}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 inline-flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply New IPO</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIPOs.map(ipo => (
            <IPOCard
              key={ipo.id}
              ipo={ipo}
              onOpenExitModal={onOpenExitModal}
              onOpenReinvestModal={onOpenReinvestModal}
              onOpenCheckIPO={onOpenCheckIPO}
            />
          ))}
        </div>
      )}

    </div>
  );
}
