import React from "react";
import { X } from "lucide-react";

/**
 * Reusable Accessible Modal Component
 * @param {boolean} isOpen - Controls modal visibility
 * @param {Function} onClose - Callback to close modal
 * @param {string} title - Modal title header
 * @param {React.ReactNode} children - Modal body content
 * @param {string} maxWidth - Tailwind max-w class (default: max-w-lg)
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={`relative w-full ${maxWidth} rounded-3xl bg-[#16213A] border border-white/10 p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-200`}>
        <div className="flex items-center justify-between mb-6">
          {title && <h3 className="text-xl font-bold text-white">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
