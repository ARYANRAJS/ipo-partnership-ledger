import React, { useRef, useState } from 'react';
import { useIPOLedger } from '../context/IPOContext.jsx';
import { 
  PlusCircle, 
  LayoutDashboard, 
  Layers, 
  Scale, 
  GitCommit, 
  Users, 
  Flame, 
  Download, 
  Upload, 
  RotateCcw,
  TrendingUp,
  Trash2,
  ShieldCheck,
  ChevronDown,
  Settings
} from 'lucide-react';

export default function Header({ onOpenNewIPO, onOpenCheckIPO }) {
  const { 
    activeTab, 
    setActiveTab, 
    handleExport, 
    handleImport, 
    handleResetDemo,
    handleClearFresh
  } = useIPOLedger();

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const fileInputRef = useRef(null);

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        handleImport(json);
      } catch (err) {
        handleImport(null);
      }
    };
    reader.readAsText(file);
    setIsToolsOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Market & GMP', icon: Flame },
    { id: 'ipos', label: 'IPO Applications', icon: Layers },
    { id: 'ledger', label: 'Hisab-Kitab Ledger', icon: Scale },
    { id: 'flow', label: 'Money Flow', icon: GitCommit },
    { id: 'partners', label: 'Partners & Accounts', icon: Users },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl sticky top-0 z-40 font-sans shadow-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Bar - Fixed Height to Prevent Overlap */}
        <div className="flex items-center justify-between h-14 sm:h-16">
          
          {/* Left Zone: Brand Logo & Title */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 shrink">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-sky-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="font-extrabold text-xs xs:text-sm sm:text-base md:text-lg text-white tracking-tight leading-tight truncate">
                  IPO Ledger
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 text-[9px] font-mono font-extrabold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                  OFFLINE SECURE
                </span>
              </div>
              <p className="hidden sm:block text-xs text-slate-400 font-medium truncate">
                Capital & Settlement Tracker
              </p>
            </div>
          </div>

          {/* Right Zone: Responsive Actions & Tools Dropdown */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
            
            {/* Verify Bids Button */}
            <button
              onClick={() => onOpenCheckIPO && onOpenCheckIPO('')}
              title="Verify IPO Bids on official NSE / BSE exchange portals"
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all shadow-md active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 shrink-0" />
              <span className="hidden sm:inline">Verify Bids</span>
              <span className="sm:hidden text-[11px]">Verify</span>
            </button>

            {/* Apply New IPO Primary CTA */}
            <button
              onClick={onOpenNewIPO}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-indigo-600/30 active:scale-95 cursor-pointer shrink-0 whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span className="hidden sm:inline">Apply New IPO</span>
              <span className="sm:hidden text-[11px]">+ Apply</span>
            </button>

            {/* Tools & Backup Dropdown Menu */}
            <div className="relative shrink-0">
              <button
                onClick={() => setIsToolsOpen(!isToolsOpen)}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-all active:scale-95 cursor-pointer flex items-center space-x-1 shrink-0 whitespace-nowrap"
                title="Data Tools & Options"
              >
                <Settings className="w-4 h-4 text-slate-400 shrink-0" />
                <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
              </button>

              {isToolsOpen && (
                <>
                  {/* Backdrop dismiss */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsToolsOpen(false)} 
                  />

                  {/* Dropdown Menu Box */}
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-2 z-50 space-y-1 animate-fade-in">
                    
                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                      Backup & Restore
                    </div>

                    <button
                      onClick={() => {
                        handleExport();
                        setIsToolsOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Download className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Export JSON Backup</span>
                    </button>

                    <button
                      onClick={() => {
                        fileInputRef.current?.click();
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-left text-xs font-semibold text-slate-200 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Restore JSON Backup</span>
                    </button>

                    <div className="my-1 border-t border-slate-800" />

                    <div className="px-3 py-1.5 text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">
                      Data Reset Options
                    </div>

                    <button
                      onClick={() => {
                        handleClearFresh();
                        setIsToolsOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-rose-500/10 text-left text-xs font-semibold text-rose-300 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>Clear All Dummy Data</span>
                    </button>

                    <button
                      onClick={() => {
                        handleResetDemo();
                        setIsToolsOpen(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-slate-800 text-left text-xs font-semibold text-slate-400 hover:text-amber-300 flex items-center space-x-2 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Reset Interactive Demo</span>
                    </button>

                  </div>
                </>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept=".json"
              className="hidden"
            />

          </div>
        </div>

        {/* Navigation Ribbon Bar */}
        <div className="flex items-center space-x-1 border-t border-slate-800/80 overflow-x-auto no-scrollbar py-1.5 w-full">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-bold text-xs transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
