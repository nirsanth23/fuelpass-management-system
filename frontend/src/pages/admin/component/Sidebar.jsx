import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LogOut, Fuel, Activity, Settings, MapPin, TrendingUp 
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { to: "/admin/dashboard", label: "Dashboard", icon: Activity, end: true },
    { to: "/admin/dashboard/quota", label: "Quota Rules", icon: Settings },
    { to: "/admin/dashboard/stations", label: "Stations", icon: MapPin },
    { to: "/admin/dashboard/supply", label: "Station Supply", icon: Fuel },
  ];

  return (
    <div className="w-64 border-r border-white/10 flex flex-col p-6 gap-2 overflow-hidden bg-[#0B1220]">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="p-2 bg-fuchsia-500 rounded-lg">
          <Fuel size={24} className="text-white" />
        </div>
        <span className="text-xl font-bold bg-gradient-to-r from-fuchsia-400 to-purple-500 bg-clip-text text-transparent italic">
          FUELPASS ADMIN
        </span>
      </div>

      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition cursor-pointer ${
              isActive 
                ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20" 
                : "text-gray-400 hover:bg-white/5"
            }`
          }
        >
          <item.icon size={20} />
          <span className="font-medium">{item.label}</span>
        </NavLink>
      ))}

      <div className="mt-auto pt-6 border-t border-white/10">
        <button
          onClick={() => navigate("/admin/login", { replace: true })}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
