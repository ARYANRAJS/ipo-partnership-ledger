import React from 'react';
import { AlertTriangle, Trash2, X, Check, RotateCcw, AlertCircle } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "danger" // "danger", "warning", "info"
}) {
  if (!isOpen) return null;

  const isDanger = type === "danger";
  const isWarning = type === "warning";

  return (
    <div className="fixed inset-0 z-[999999] bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative z-[1000000] my-auto">
        
        {/* Header Icon & Title */}
        <div className="flex items-start space-x-3.5 border-b border-slate-800 pb-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            isDanger ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
            isWarning ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
            'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
          }`}>
            {isDanger ? <Trash2 className="w-5 h-5" /> :
             isWarning ? <AlertTriangle className="w-5 h-5" /> :
             <AlertCircle className="w-5 h-5" />}
          </div>

          <div className="flex-1">
            <h3 className="font-extrabold text-base text-white">{title}</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">{message}</p>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 font-bold text-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 rounded-xl text-white font-extrabold text-xs shadow-lg transition-all active:scale-95 cursor-pointer ${
              isDanger 
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' 
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
            }`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}
