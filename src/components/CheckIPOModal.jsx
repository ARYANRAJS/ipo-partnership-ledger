import React from 'react';
import { 
  X, 
  ExternalLink, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Globe, 
  Building2, 
  FileText, 
  ArrowUpRight,
  Info
} from 'lucide-react';

export default function CheckIPOModal({ isOpen, onClose, ipoName = '' }) {
  if (!isOpen) return null;

  const verificationPortals = [
    {
      name: "NSE India (Official IPO Bid Verification)",
      description: "Verify your IPO bid status directly on National Stock Exchange of India",
      url: "https://www.nseindia.com/invest/check-trades-bids-verify-ipo-bids",
      badge: "OFFICIAL NSE",
      badgeClass: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      featured: true
    },
    {
      name: "BSE India (Official Allotment Check)",
      description: "Check official allotment status using PAN or Application Number on Bombay Stock Exchange",
      url: "https://www.bseindia.com/investors/appli_check.aspx",
      badge: "OFFICIAL BSE",
      badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      featured: true
    },
    {
      name: "Link Intime India Portal",
      description: "Official registrar allotment status portal for Link Intime managed IPOs",
      url: "https://linkintime.co.in/initial_offer/public-issues.html",
      badge: "REGISTRAR",
      badgeClass: "bg-slate-800 text-slate-300 border-slate-700"
    },
    {
      name: "KFintech Allotment Portal",
      description: "Official registrar allotment status portal for KFintech managed IPOs",
      url: "https://kosmic.kfintech.com/ipostatus/",
      badge: "REGISTRAR",
      badgeClass: "bg-slate-800 text-slate-300 border-slate-700"
    },
    {
      name: "Bigshare Services Portal",
      description: "Official allotment portal for SME & Mainboard IPOs processed by Bigshare",
      url: "https://www.bigshareonline.com/ipo_allotment.html",
      badge: "REGISTRAR",
      badgeClass: "bg-slate-800 text-slate-300 border-slate-700"
    }
  ];

  return (
    <div className="fixed inset-0 z-[999999] bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative z-[1000000] my-8">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-mono font-extrabold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center space-x-1">
                <ShieldCheck className="w-3 h-3" />
                <span>EXCHANGE VERIFICATION CENTER</span>
              </span>
            </div>
            <h3 className="font-extrabold text-xl text-white mt-1.5">
              Verify IPO Bids & Allotment Status
            </h3>
            {ipoName && (
              <p className="text-xs text-indigo-300 font-semibold mt-0.5">
                Target IPO: <strong className="text-white">{ipoName}</strong>
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Instructions Banner */}
        <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 space-y-1">
          <div className="font-bold text-white flex items-center space-x-1.5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>How to check your allotment on official exchanges:</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed pl-5">
            1. Click on <strong>NSE India</strong> or <strong>BSE India</strong> official portal below.<br />
            2. Select Issue Type (Equity) and pick <strong>{ipoName || 'IPO Company Name'}</strong>.<br />
            3. Enter your <strong>PAN Card Number</strong> or Application Number & click Search.
          </p>
        </div>

        {/* Official Links List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Official Stock Exchange & Registrar Portals</h4>
          
          {verificationPortals.map((portal, idx) => (
            <a
              key={idx}
              href={portal.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-4 rounded-xl border flex items-center justify-between group transition-all ${
                portal.featured 
                  ? 'bg-slate-950 hover:bg-indigo-950/30 border-slate-800 hover:border-indigo-500/50 shadow-md' 
                  : 'bg-slate-950/60 hover:bg-slate-950 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="space-y-1 pr-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-white group-hover:text-indigo-300 transition-colors">
                    {portal.name}
                  </span>
                  <span className={`px-2 py-0.5 text-[9px] font-mono font-extrabold rounded border ${portal.badgeClass}`}>
                    {portal.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{portal.description}</p>
              </div>

              <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-indigo-600 group-hover:text-white text-slate-400 flex items-center justify-center shrink-0 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>

        {/* Footer Button */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            Close Verification Center
          </button>
        </div>

      </div>
    </div>
  );
}
