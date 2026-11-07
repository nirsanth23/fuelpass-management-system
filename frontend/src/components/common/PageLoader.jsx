import React from "react";

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-800"></div>
        <div className="absolute inset-0 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="mt-4 text-xs font-semibold tracking-wider text-slate-400 uppercase">
        Loading FuelPass...
      </p>
    </div>
  );
}

