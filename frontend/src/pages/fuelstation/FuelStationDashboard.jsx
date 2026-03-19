import React from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FuelStationDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-red-600 bg-clip-text text-transparent">
              Fuel Station Status Board
            </span>
          </h1>
          <button 
            onClick={() => navigate("/fuelstation/login", { replace: true })}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-4 py-2 rounded-lg cursor-pointer text-orange-300"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2 text-orange-300">Petrol Stock</h3>
            <p className="text-4xl font-bold">12,500 L</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2 text-orange-300">Diesel Stock</h3>
            <p className="text-4xl font-bold">8,200 L</p>
          </div>
        </div>
      </div>
    </div>
  );
}
