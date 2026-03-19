import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-3xl font-bold mb-3">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            Welcome to User Dashboard
          </span>
        </h1>
        <p className="text-gray-300 mb-8">
          OTP login is successful. Next step is to build your fuel quota and reservation modules.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-5">
            <h2 className="text-lg font-semibold mb-2">My Fuel Quota</h2>
            <p className="text-sm text-gray-300">Track available monthly fuel quota.</p>
          </div>

          <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-5">
            <h2 className="text-lg font-semibold mb-2">Reservations</h2>
            <p className="text-sm text-gray-300">Create and manage fuel pickup reservations.</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/user/login")}
          className="mt-8 px-5 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-white/20 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
