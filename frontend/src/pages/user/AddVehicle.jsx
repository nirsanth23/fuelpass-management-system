import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Car, Plus, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";

export default function AddVehicle() {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [vehicleCount, setVehicleCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);

  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleLetters: "",
    vehicleNumbers: "",
    chassisNo: "",
    vehicleType: "",
    fuelType: "",
  });

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  useEffect(() => {
    const fetchVehicles = async () => {
      const token = localStorage.getItem("fuelpass_token");
      if (!token) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/vehicles`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.vehicles)) {
          setVehicleCount(data.vehicles.length);
          if (data.vehicles.length >= 3) {
            setIsLimitReached(true);
            setError("Maximum limit reached! You have already registered 3 vehicles (Maximum allowed per NIC).");
          }
        }
      } catch (err) {
        console.error("Failed to fetch vehicles count", err);
      }
    };

    fetchVehicles();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    setError("");
    setSuccess("");

    const token = localStorage.getItem("fuelpass_token");
    const finalVehicleNumber = `${vehicleDetails.vehicleLetters} ${vehicleDetails.vehicleNumbers}`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/vehicles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleNumber: finalVehicleNumber,
          chassisNo: vehicleDetails.chassisNo,
          vehicleType: vehicleDetails.vehicleType,
          fuelType: vehicleDetails.fuelType,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to add vehicle");

      setSuccess("Vehicle added successfully!");
      setTimeout(() => navigate(`/user/dashboard?vehicleNumber=${encodeURIComponent(finalVehicleNumber)}`), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="h-screen bg-[#0B1220] text-white px-6 overflow-hidden flex flex-col justify-center">
      <div className="max-w-xl mx-auto w-full">
        <button
          onClick={() => navigate("/user/dashboard")}
          className="mb-8 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-cyan-400/20 flex items-center justify-center">
              <Plus className="text-cyan-400" />
            </div>
            <h1 className="text-2xl font-bold">Add More Vehicle</h1>
          </div>

          {isLimitReached ? (
            <div className="mb-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-300 flex items-start gap-3">
              <AlertTriangle size={22} className="text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-bold text-sm">Maximum Vehicle Limit Reached (3/3)</p>
                <p className="text-xs text-amber-200/80 mt-1">
                  You have already registered 3 vehicles for this NIC. Under National Fuel Pass regulations, you cannot register more than 3 vehicles per NIC.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 flex items-center gap-3">
              <AlertCircle size={20} />
              <p>{error}</p>
            </div>
          ) : null}

          {success && (
            <div className="mb-6 p-4 rounded-xl border border-green-500/30 bg-green-500/10 text-green-400 flex items-center gap-3">
              <CheckCircle size={20} />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleAdd} className="space-y-6">
            <div>
              <label className="block mb-2 text-sm text-gray-400 uppercase tracking-wider font-semibold">
                Vehicle Number
              </label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="ABC"
                  maxLength={3}
                  disabled={isLimitReached}
                  value={vehicleDetails.vehicleLetters}
                  onChange={(e) => setVehicleDetails(p => ({ ...p, vehicleLetters: e.target.value.replace(/[^A-Za-z]/g, "").toUpperCase() }))}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  required
                />
                <input
                  type="text"
                  placeholder="1234"
                  maxLength={4}
                  disabled={isLimitReached}
                  value={vehicleDetails.vehicleNumbers}
                  onChange={(e) => setVehicleDetails(p => ({ ...p, vehicleNumbers: e.target.value.replace(/\D/g, "") }))}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400 uppercase tracking-wider font-semibold">
                Chassis Number
              </label>
              <input
                type="text"
                placeholder="Ex: ME35WQ..."
                disabled={isLimitReached}
                value={vehicleDetails.chassisNo}
                onChange={(e) => setVehicleDetails(p => ({ ...p, chassisNo: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:opacity-40 disabled:cursor-not-allowed"
                required
              />
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400 uppercase tracking-wider font-semibold">
                Vehicle Type
              </label>
              <select
                disabled={isLimitReached}
                value={vehicleDetails.vehicleType}
                onChange={(e) => setVehicleDetails(p => ({ ...p, vehicleType: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#1E293B] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                required
              >
                <option value="" disabled className="text-gray-400">
                  Select Vehicle Type
                </option>
                <option value="bike">Bike</option>
                <option value="threewheeler">Three Wheeler</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="bus">Bus</option>
                <option value="lorry">Lorry</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm text-gray-400 uppercase tracking-wider font-semibold">
                Fuel Type
              </label>
              <select
                disabled={isLimitReached}
                value={vehicleDetails.fuelType}
                onChange={(e) => setVehicleDetails(p => ({ ...p, fuelType: e.target.value }))}
                className="w-full rounded-xl border border-white/10 bg-[#1E293B] px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                required
              >
                <option value="" disabled className="text-gray-400">
                  Select Fuel Type
                </option>
                <option value="petrol92">Petrol 92</option>
                <option value="petrol95">Petrol 95</option>
                <option value="diesel">Diesel</option>
                <option value="superdiesel">Super Diesel</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={adding || isLimitReached}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {adding ? "Adding..." : <><Car size={20} /> Add Vehicle</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
