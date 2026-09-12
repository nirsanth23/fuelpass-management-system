import React from "react";

/**
 * Reusable Metric Telemetry Card
 * @param {string} title - Card header title
 * @param {number|string} value - Numerical value or text
 * @param {React.ComponentType} icon - Lucide React Icon component
 * @param {string} color - Text color class
 * @param {string} bg - Background icon container class
 * @param {string} unit - Optional metric unit (e.g. 'L', 'Stations')
 * @param {boolean} isInteger - Whether to format as integer
 */
export default function StatCard({
  title,
  value,
  icon: Icon,
  color = "text-white",
  bg = "bg-white/10",
  unit = "L",
  isInteger = false,
}) {
  const isCount = isInteger || unit === "Users" || title.toLowerCase().includes("station") || title.toLowerCase().includes("customer");
  const num = parseFloat(value) || 0;
  const formattedValue = isCount
    ? Math.round(num).toLocaleString()
    : num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all duration-300 shadow-lg shadow-black/10">
      <div>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1.5">{title}</h3>
        <p className={`text-3xl font-bold ${color} font-mono flex items-baseline gap-1`}>
          {formattedValue}
          {unit && <span className="text-sm font-medium opacity-60 ml-0.5 tracking-normal">{unit}</span>}
        </p>
      </div>
      {Icon && (
        <div className={`p-4 rounded-2xl ${bg} ${color} shadow-lg shadow-black/20 group-hover:scale-105 transition-transform`}>
          <Icon size={24} />
        </div>
      )}
    </div>
  );
}
