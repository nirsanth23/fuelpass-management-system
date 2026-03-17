import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function FuelStationLogin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white px-4">
      <div className="relative w-[400px] max-w-md rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-white/10">

        {/* Close Button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-orange-400 hover:text-orange-300 transition cursor-pointer"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center">
          Fuel Station Login
        </h2>

        <form className="space-y-4">
          <input placeholder="Station ID" className="input" />
          <input type="password" placeholder="Password" className="input" />

          <button className="w-full py-3 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 font-semibold">
            Login
          </button>
        </form>

      </div>
    </div>
  );
}