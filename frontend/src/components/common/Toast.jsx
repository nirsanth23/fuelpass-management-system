import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

/**
 * Reusable Toast Notification Banner
 * @param {{ type: 'success'|'error', title: string, message: string }|null} toast
 * @param {Function} onClose
 * @param {number} duration - Auto dismiss duration in ms (default: 5000)
 */
export default function Toast({ toast, onClose, duration = 5000 }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  if (!toast) return null;

  const isSuccess = toast.type === "success";

  return (
    <div className="fixed bottom-6 right-6 z-[120] max-w-md animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-xl ${
          isSuccess
            ? "bg-[#064e3b]/90 border-emerald-500/30 text-emerald-100 shadow-emerald-900/20"
            : "bg-[#7f1d1d]/90 border-red-500/30 text-red-100 shadow-red-900/20"
        }`}
      >
        <div className="mt-0.5">
          {isSuccess ? (
            <CheckCircle2 size={20} className="text-emerald-400" />
          ) : (
            <AlertCircle size={20} className="text-red-400" />
          )}
        </div>
        <div className="flex-1">
          {toast.title && <p className="font-bold text-sm leading-tight text-white mb-0.5">{toast.title}</p>}
          {toast.message && <p className="text-xs opacity-90 leading-relaxed">{toast.message}</p>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          aria-label="Dismiss toast"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
