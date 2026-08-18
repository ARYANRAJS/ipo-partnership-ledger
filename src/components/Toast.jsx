import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const { id, message, type = 'info', duration = 3500 } = toast;

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isWarning = type === 'warning';

  return (
    <div className="fixed top-5 right-5 z-[9999999] animate-bounce-in max-w-md w-full">
      <div className={`p-4 rounded-xl border shadow-2xl flex items-start space-x-3 backdrop-blur-md ${
        isSuccess ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200' :
        isError ? 'bg-rose-950/90 border-rose-500/40 text-rose-200' :
        isWarning ? 'bg-amber-950/90 border-amber-500/40 text-amber-200' :
        'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
      }`}>
        <div className="shrink-0 mt-0.5">
          {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {isError && <AlertCircle className="w-5 h-5 text-rose-400" />}
          {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-indigo-400" />}
        </div>

        <div className="flex-1 text-xs font-semibold leading-relaxed">
          {message}
        </div>

        <button 
          onClick={() => onClose(id)} 
          className="text-slate-400 hover:text-white p-0.5 shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
