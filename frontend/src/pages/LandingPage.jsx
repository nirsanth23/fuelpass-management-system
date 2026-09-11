import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  ShieldCheck,
  Fuel,
  ArrowRight,
  Sparkles,
  QrCode,
  Calendar,
  Lock,
  ChevronDown,
  Car,
  Bike,
  Truck,
  Bus,
  Zap,
  Droplets,
  CheckCircle2,
  Clock,
  Smartphone,
  Shield,
  Layers,
  Award
} from "lucide-react";

const BackgroundLayer = () => (
  <div className="absolute inset-0 overflow-hidden bg-[#070B14] pointer-events-none">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.14),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(168,85,247,0.14),_transparent_35%),radial-gradient(circle_at_bottom_center,_rgba(249,115,22,0.10),_transparent_40%)]" />
    <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
    <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-fuchsia-500/10 blur-3xl" />
    <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
  </div>
);

// Clean helper for vehicle icons and style accents
const getVehicleMeta = (vehicleType = "") => {
  const type = vehicleType.toLowerCase();
  if (type.includes("bike") || type.includes("motorcycle") || type.includes("scooter")) {
    return {
      icon: Bike,
      badge: "Two-Wheeler",
      fuelType: "Petrol 92 / 95",
      accent: "text-cyan-400",
      bg: "bg-cyan-500/10 border-cyan-500/20",
      glow: "group-hover:border-cyan-500/40"
    };
  }
  if (type.includes("three") || type.includes("tuk") || type.includes("wheeler")) {
    return {
      icon: Car,
      badge: "Three-Wheeler",
      fuelType: "Petrol 92",
      accent: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
      glow: "group-hover:border-emerald-500/40"
    };
  }
  if (type.includes("car") || type.includes("sedan") || type.includes("suv")) {
    return {
      icon: Car,
      badge: "Passenger Car",
      fuelType: "Petrol / Diesel",
      accent: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/20",
      glow: "group-hover:border-blue-500/40"
    };
  }
  if (type.includes("van")) {
    return {
      icon: Truck,
      badge: "Dual Purpose / Van",
      fuelType: "Diesel / Petrol",
      accent: "text-indigo-400",
      bg: "bg-indigo-500/10 border-indigo-500/20",
      glow: "group-hover:border-indigo-500/40"
    };
  }
  if (type.includes("bus")) {
    return {
      icon: Bus,
      badge: "Public Transport",
      fuelType: "Auto Diesel",
      accent: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
      glow: "group-hover:border-amber-500/40"
    };
  }
  if (type.includes("lorry") || type.includes("truck")) {
    return {
      icon: Truck,
      badge: "Commercial Cargo",
      fuelType: "Auto Diesel",
      accent: "text-orange-400",
      bg: "bg-orange-500/10 border-orange-500/20",
      glow: "group-hover:border-orange-500/40"
    };
  }
  return {
    icon: Fuel,
    badge: "Special Class",
    fuelType: "Petrol / Diesel",
    accent: "text-fuchsia-400",
    bg: "bg-fuchsia-500/10 border-fuchsia-500/20",
    glow: "group-hover:border-fuchsia-500/40"
  };
};

export default function LandingPage() {
  const navigate = useNavigate();
  const [staffMenuOpen, setStaffMenuOpen] = useState(false);
  const [quotaRules, setQuotaRules] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5050").replace(/\/$/, "");

  // Fallback defaults in case backend is offline
  const fallbackRules = [
    { vehicle_type: "Bike", weekly_limit: 5.0, carry_forward_limit: 2.0, category: "Light Vehicles" },
    { vehicle_type: "Car", weekly_limit: 20.0, carry_forward_limit: 5.0, category: "Light Vehicles" },
    { vehicle_type: "Three Wheeler", weekly_limit: 8.0, carry_forward_limit: 3.0, category: "Light Vehicles" },
    { vehicle_type: "Van", weekly_limit: 15.0, carry_forward_limit: 3.0, category: "Light Vehicles" },
    { vehicle_type: "Bus", weekly_limit: 40.0, carry_forward_limit: 10.0, category: "Heavy & Special Vehicles" },
    { vehicle_type: "Lorry", weekly_limit: 50.0, carry_forward_limit: 10.0, category: "Heavy & Special Vehicles" }
  ];

  const fetchQuotaRules = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/quota-rules`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setQuotaRules(data);
        } else {
          setQuotaRules(fallbackRules);
        }
      } else {
        setQuotaRules(fallbackRules);
      }
    } catch (err) {
      setQuotaRules(fallbackRules);
    }
  };

  useEffect(() => {
    fetchQuotaRules();
  }, []);

  const displayRules = quotaRules.length > 0 ? quotaRules : fallbackRules;

  // Filter rules by category
  const filteredRules = displayRules.filter((rule) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Light") {
      return (
        rule.category === "Light Vehicles" ||
        (!rule.category && ["Bike", "Car", "Three Wheeler", "Van"].includes(rule.vehicle_type))
      );
    }
    if (selectedCategory === "Heavy") {
      return (
        rule.category === "Heavy & Special Vehicles" ||
        (rule.category && rule.category !== "Light Vehicles") ||
        (!rule.category && !["Bike", "Car", "Three Wheeler", "Van"].includes(rule.vehicle_type))
      );
    }
    return true;
  });

  const steps = [
    {
      step: "01",
      title: "Register Vehicle",
      desc: "Provide your National ID (NIC), Mobile Number, and Vehicle details.",
      icon: User
    },
    {
      step: "02",
      title: "Get Digital QR Pass",
      desc: "Instantly receive your digital fuel pass with your assigned weekly quota.",
      icon: QrCode
    },
    {
      step: "03",
      title: "Scan & Pump",
      desc: "Present your QR code at any certified fuel station for quick fueling.",
      icon: Fuel
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#070B14] text-slate-100 selection:bg-cyan-500 selection:text-white font-sans antialiased">
      <BackgroundLayer />

      {/* TOP NAVIGATION BAR */}
      <header className="relative z-50 border-b border-white/10 bg-[#0B1220]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
              <div className="h-full w-full bg-[#0B1220] rounded-[11px] flex items-center justify-center group-hover:bg-transparent transition-colors">
                <Fuel className="h-6 w-6 text-cyan-400 group-hover:text-white transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent">
                  FuelPass
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  National Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Sri Lanka Fuel Quota Management</p>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-cyan-400 transition-colors"
            >
              Home
            </a>
            <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
            <a href="#quotas" className="hover:text-cyan-400 transition-colors">Fuel Quotas</a>
          </nav>

          {/* Action Buttons & Staff Dropdown */}
          <div className="flex items-center gap-3">
            {/* Citizen Login Button */}
            <button
              onClick={() => navigate("/user/login")}
              className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <User className="h-4 w-4 text-cyan-400" />
              Citizen Login
            </button>

            {/* Citizen Register CTA */}
            <button
              onClick={() => navigate("/user/register")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Register Vehicle</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            {/* Staff / Administration Portal Menu */}
            <div className="relative ml-2">
              <button
                onClick={() => setStaffMenuOpen(!staffMenuOpen)}
                className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer"
                title="Staff / Operator Login"
              >
                <Lock className="h-3.5 w-3.5 text-slate-400" />
                <span className="hidden sm:inline">Portals</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${staffMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {staffMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-2xl border border-white/10 bg-[#0E1726]/95 backdrop-blur-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                  onMouseLeave={() => setStaffMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-white/5 mb-1">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Authorized Access</p>
                  </div>
                  <button
                    onClick={() => { setStaffMenuOpen(false); navigate("/fuelstation/login"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-orange-400 hover:bg-orange-500/10 transition-colors group cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                      <Fuel className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Fuel Station Portal</div>
                      <div className="text-[10px] text-slate-400 font-normal">Operator scanner & sales</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setStaffMenuOpen(false); navigate("/admin/login"); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold text-slate-300 hover:text-purple-400 hover:bg-purple-500/10 transition-colors group mt-1 cursor-pointer"
                  >
                    <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">System Admin</div>
                      <div className="text-[10px] text-slate-400 font-normal">Ministry & quota control</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative z-10 min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto w-full">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold mb-6 shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
            <span>Official National Fuel Pass System</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
            Smart, Guaranteed <br />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Fuel Quota Management
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Fair and transparent weekly fuel distribution for every vehicle in Sri Lanka. Register your vehicle, receive your instant digital QR pass, and pump with ease.
          </p>

          {/* Hero CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/user/register")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-base shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <span>Register Your Vehicle</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => navigate("/user/login")}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-white/15 bg-white/5 hover:bg-white/10 text-white font-semibold text-base backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <User className="h-5 w-5 text-cyan-400" />
              <span>Check My Quota / Login</span>
            </button>
          </div>

          {/* Highlights Mini Cards */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Instant QR Fuel Pass</div>
                <div className="text-[11px] text-slate-400">Scan at certified stations</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Weekly Auto-Reset</div>
                <div className="text-[11px] text-slate-400">Every Sunday midnight</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Fuel className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">Island-wide Network</div>
                <div className="text-[11px] text-slate-400">Valid at all petrol stations</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative z-10 py-20 border-t border-white/10 bg-[#0B1220]/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">Simple 3-Step Process</span>
            <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
              How FuelPass Works
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Get your digital pass in under 2 minutes and pump without waiting in queues.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div 
                  key={idx}
                  className="relative group p-8 rounded-3xl border border-white/10 bg-[#0E1726]/80 hover:border-cyan-500/40 transition-all duration-300 hover:-translate-y-1.5"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="text-3xl font-black text-white/15 font-mono group-hover:text-cyan-500/40 transition-colors">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CLEAN & PROFESSIONAL WEEKLY FUEL QUOTA CATEGORIES */}
      <section id="quotas" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-cyan-400 text-xs font-bold uppercase tracking-widest">National Allocations</span>
          <h2 className="mt-2 text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Weekly Fuel Quota Categories
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Current government fuel limits by vehicle classification. Quotas reset automatically every Sunday midnight.
          </p>

          {/* Category Filter Buttons */}
          <div className="mt-6 inline-flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "All"
                  ? "bg-cyan-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedCategory("Light")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "Light"
                  ? "bg-cyan-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Light Vehicles
            </button>
            <button
              onClick={() => setSelectedCategory("Heavy")}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === "Heavy"
                  ? "bg-cyan-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Heavy & Special
            </button>
          </div>
        </div>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRules.map((rule, idx) => {
            const meta = getVehicleMeta(rule.vehicle_type);
            const Icon = meta.icon;
            const weeklyLimit = Number(rule.weekly_limit) || 0;
            const carryLimit = Number(rule.carry_forward_limit) || 0;

            return (
              <div
                key={idx}
                className={`p-6 rounded-3xl border border-white/10 bg-[#0E1726]/80 backdrop-blur-xl ${meta.glow} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col justify-between`}
              >
                <div>
                  {/* Top: Icon + Title + Class Badge */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center ${meta.bg}`}>
                        <Icon className={`h-6 w-6 ${meta.accent}`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg leading-snug">{rule.vehicle_type}</h4>
                        <span className="text-[11px] text-slate-400">{meta.badge}</span>
                      </div>
                    </div>
                  </div>

                  {/* Main Metric: Weekly Limit */}
                  <div className="mb-6">
                    <div className="text-3xl font-extrabold text-white tracking-tight">
                      {weeklyLimit} Liters
                    </div>
                    <span className="text-xs text-slate-400">Weekly Quota Allocation</span>
                  </div>
                </div>

                {/* Bottom Stats: Carry Forward & Fuel Type */}
                <div className="pt-4 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Droplets className="h-3.5 w-3.5 text-cyan-400" />
                      Fuel Type:
                    </span>
                    <span className="font-medium text-slate-200">
                      {meta.fuelType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-amber-400" />
                      Carry-over limit:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {carryLimit > 0 ? `${carryLimit} L` : "None"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </section>

      {/* CITIZEN ACTION BANNER */}
      <section className="relative z-10 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 p-8 sm:p-12 backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Ready to claim your weekly fuel pass?
            </h3>
            <p className="mt-2 text-sm text-slate-300">
              Registration takes less than 2 minutes with your National Identity Card (NIC) and Vehicle Registration Number.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate("/user/register")}
              className="px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Register Now</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("/user/login")}
              className="px-6 py-3.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Citizen Login
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/10 bg-[#05080F] pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            
            {/* Column 1: Info */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Fuel className="h-4 w-4 text-cyan-400" />
                </div>
                <span className="font-bold text-lg text-white">FuelPass National Portal</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                National digital fuel quota allocation and QR authentication platform managed under the Ministry of Power & Energy, Sri Lanka.
              </p>
            </div>

            {/* Column 2: Public Portals */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Citizen Services</h5>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <button onClick={() => navigate("/user/register")} className="hover:text-cyan-400 transition-colors cursor-pointer">
                    Vehicle Registration
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/user/login")} className="hover:text-cyan-400 transition-colors cursor-pointer">
                    Check Quota / Sign In
                  </button>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#quotas" className="hover:text-cyan-400 transition-colors">
                    Quota Allocation Table
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Authorized Staff Access */}
            <div>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Staff & Administration</h5>
              <ul className="space-y-2.5 text-xs text-slate-400">
                <li>
                  <button 
                    onClick={() => navigate("/fuelstation/login")} 
                    className="flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors group cursor-pointer"
                  >
                    <Fuel className="h-3.5 w-3.5 text-orange-500/70 group-hover:text-orange-400" />
                    <span>Station Operator Portal</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => navigate("/admin/login")} 
                    className="flex items-center gap-2 text-slate-400 hover:text-purple-400 transition-colors group cursor-pointer"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-purple-500/70 group-hover:text-purple-400" />
                    <span>System Admin Dashboard</span>
                  </button>
                </li>
                <li className="pt-2 text-[11px] text-slate-500">
                  <span>Restricted to authorized officials & licensed fuel station staff.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© 2026 FuelPass National Management System. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-400 transition-colors cursor-pointer">Ministry Helpline: 1919</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
