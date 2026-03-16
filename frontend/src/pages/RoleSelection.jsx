import React from "react";
import { useNavigate } from "react-router-dom";
import { User, ShieldCheck, Fuel, ArrowRight, Sparkles } from "lucide-react";

const ROLES = [
  {
    id: "user",
    title: "User Portal",
    description:
      "Access your fuel pass, manage quotas, view transaction history, and download reports with ease.",
    icon: User,
    buttonLabel: "Enter User Portal",
    path: "/user/login",
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    glow: "shadow-cyan-500/30",
  },
  {
    id: "admin",
    title: "Admin Dashboard",
    description:
      "Manage users, fuel stations, quotas, pricing, reports, and system settings from one dashboard.",
    icon: ShieldCheck,
    buttonLabel: "Enter Admin Panel",
    path: "/admin/login",
    gradient: "from-fuchsia-500 via-purple-500 to-violet-600",
    glow: "shadow-fuchsia-500/30",
  },
  {
    id: "fuelstation",
    title: "Station Operations",
    description:
      "Scan QR codes, validate passes, process transactions, and manage daily station operations efficiently.",
    icon: Fuel,
    buttonLabel: "Enter Station Panel",
    path: "/fuelstation/login",
    gradient: "from-amber-400 via-orange-500 to-red-500",
    glow: "shadow-orange-500/30",
  },
];

const BackgroundLayer = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#070B14]">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.18),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.18),_transparent_30%),radial-gradient(circle_at_bottom_center,_rgba(249,115,22,0.18),_transparent_28%)]" />
    <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
    <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
    <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-500/20 blur-3xl" />
    <div className="absolute inset-0 bg-black/35" />
  </div>
);

const RoleCard = ({ role, onNavigate }) => {
  const Icon = role.icon;

  return (
    <button
      type="button"
      onClick={() => onNavigate(role.path)}
      className={`group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.06] p-[1px] text-left backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.015] ${role.glow} hover:shadow-2xl`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-20`}
      />

      <div className="relative h-full rounded-[28px] border border-white/10 bg-[#0B1220]/90 p-8">
        
        {/* Icon */}
        <div
          className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${role.gradient} shadow-lg`}
        >
          <Icon className="h-8 w-8 text-white" />
        </div>

        {/* Title */}
        <h3 className="mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl">
          {role.title}
        </h3>

        {/* Description */}
        <p className="mb-8 text-sm leading-7 text-white/65">
          {role.description}
        </p>

        {/* Button */}
        <div
          className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r ${role.gradient} px-5 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 group-hover:gap-3`}
        >
          {role.buttonLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </button>
  );
};

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden no-scrollbar">
      <BackgroundLayer />

      <div className="relative z-10 flex h-screen items-center justify-center px-6 py-10">
        <div className="w-full max-w-7xl">

          {/* Header */}
          <div className="mx-auto mb-14 max-w-3xl text-center">

            <h1 className="mb-5 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
              FuelPass
              <span className="block text-4xl bg-gradient-to-r from-cyan-300 via-white to-fuchsia-300 bg-clip-text text-transparent">
                Management System
              </span>
            </h1>
          </div>

          {/* Role Cards */}
          <div className="grid gap-6 lg:grid-cols-3 mt-20">
            {ROLES.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                onNavigate={navigate}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="mt-15 flex justify-center px-6 py-4 text-sm text-white/50">
            <p>© 2026 FuelPass Management System</p>
          </div>

        </div>
      </div>
    </div>
  );
}