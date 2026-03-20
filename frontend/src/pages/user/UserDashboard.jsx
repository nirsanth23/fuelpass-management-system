import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Fuel, Calendar, Car, AlertCircle, LogOut, User, Edit, X } from "lucide-react";

export default function UserDashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("fuelpass_token");
      if (!token) {
        navigate("/user/login");
        return;
      }

      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  const getQuotaInfo = () => {
    if (!userData || !userData.vehicle_type) return null;

    const rawType = userData.vehicle_type.toLowerCase();
    const type = rawType === "motorcycle" ? "bike" : rawType;
    let totalQuota = 20; // Default

    if (type === "bike") totalQuota = 5;
    else if (type === "car") totalQuota = 15;
    else if (type === "threewheeler") totalQuota = 15;
    else if (type === "van") totalQuota = 50;
    else if (type === "lorry") totalQuota = 100;

    const used = userData.used_fuel || 0;
    const remaining = Math.max(0, totalQuota - used);

    return { totalQuota, used, remaining, type };
  };

  const quota = getQuotaInfo();

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).replace(/\//g, ".");
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent border-b-2 border-transparent hover:border-cyan-400 transition cursor-default">
              FuelPass Dashboard
            </span>
          </h1>
          <button
            onClick={() => {
              localStorage.removeItem("fuelpass_token");
              localStorage.removeItem("fuelpass_user");
              navigate("/user/login", { replace: true });
            }}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-cyan-400 hover:text-cyan-300 transition px-4 py-2 rounded-lg cursor-pointer border border-white/5"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Fuel size={120} className="text-cyan-400" />
            </div>

            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Fuel size={24} className="text-cyan-400" />
              Weekly Fuel Quota
            </h2>

            {quota ? (
              <div className="space-y-6">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-4xl font-bold text-white">{quota.remaining}L</p>
                    <p className="text-gray-400 text-sm">Remaining this week</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-semibold text-gray-300">{quota.totalQuota}L</p>
                    <p className="text-gray-400 text-sm">Total Allowance</p>
                  </div>
                </div>

                <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500"
                    style={{ width: `${(quota.used / quota.totalQuota) * 100}%` }}
                  ></div>
                </div>

                <div className="flex gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    Used: {quota.used}L
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-3 h-3 rounded-full bg-white/20"></div>
                    Available: {quota.remaining}L
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-sm text-gray-400">
                  <Calendar size={16} className="text-cyan-400" />
                  Cycle: {formatDate(userData.week_start)} to {formatDate(userData.week_end)}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-500">
                Vehicle information not found. Please register your vehicle details.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Car size={24} className="text-blue-400" />
                Vehicle Details
              </h2>
              {userData && userData.vehicle_number ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Vehicle Number</p>
                    <p className="text-lg font-mono font-bold text-white uppercase">{userData.vehicle_number}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Type</p>
                    <p className="text-lg font-semibold text-white capitalize">
                      {quota.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Fuel Type</p>
                    <p className="text-lg font-semibold text-white capitalize">{userData.fuel_type}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Chassis Number</p>
                    <p className="text-lg font-semibold text-white uppercase">{userData.chassis_no || userData.chassisNo || "N/A"}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 italic">No vehicle found</p>
              )}
            </div>

            <button
              onClick={() => navigate("/user/update-vehicle")}
              className="mt-6 w-full py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-cyan-400 hover:text-cyan-300 transition text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Edit size={16} /> Update Details
            </button>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div
            onClick={() => setShowQr(true)}
            className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-6 flex items-center justify-between group cursor-pointer hover:bg-blue-500/20 transition"
          >
            <div>
              <h3 className="text-lg font-semibold mb-1">QR Fuel Pass</h3>
              <p className="text-sm text-blue-300">View and download your digital pass</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-400/20 flex items-center justify-center group-hover:scale-110 transition">
              <AlertCircle className="text-blue-400" />
            </div>
          </div>

          <div className="rounded-2xl border border-purple-400/30 bg-purple-500/10 p-6 flex items-center justify-between group cursor-pointer hover:bg-purple-500/20 transition">
            <div>
              <h3 className="text-lg font-semibold mb-1">Reservations</h3>
              <p className="text-sm text-purple-300">Schedule your next fuel pickup</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-400/20 flex items-center justify-center group-hover:scale-110 transition">
              <Calendar className="text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* QR PASS MODAL */}
      {showQr && userData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-sm rounded-[32px] bg-[#16213A] border border-white/10 p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowQr(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 transition text-gray-400 hover:text-white cursor-pointer"
            >
              <X size={24} />
            </button>
            
            <div className="text-center">
              <div className="mb-6 inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
                <Fuel size={32} className="text-cyan-400" />
              </div>

              <h2 className="text-2xl font-bold mb-1">Your Fuel Pass</h2>
              <p className="text-gray-400 text-sm mb-8">Show this QR to the fuel station</p>

              <div className="bg-white p-6 rounded-3xl mb-8 relative group">
                <p className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                  {userData.vehicle_number}
                </p>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${userData.vehicle_number}`}
                  alt="QR Pass"
                  className="w-full aspect-square rounded-xl"
                />
              </div>

              <div className="space-y-3">
                <a
                  href={`https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${userData.vehicle_number}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 font-semibold hover:shadow-lg hover:shadow-cyan-500/20 transition cursor-pointer"
                >
                  Download Pass
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
