import React, { useState, useEffect } from "react";
import { LogOut, Fuel, Users, History, TrendingUp, ChevronLeft, ChevronRight, Calendar, Search, Filter, ChevronDown, Car, Settings, Mail, Phone, MapPin, User, Shield, CheckCircle2, AlertCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function FuelStationDashboard() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({
    stats: {
      petrol_stock: 0,
      diesel_stock: 0,
      petrol_issued_today: 0,
      diesel_issued_today: 0,
      customers_today: 0
    },
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    location: "",
    phone_number: "",
    email: ""
  });
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");
  const stationId = localStorage.getItem("stationId");
  const token = localStorage.getItem("stationToken");

  const fetchDashboardData = async (date) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/station/dashboard?date=${date}`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else if (response.status === 401) {
        navigate("/fuelstation/login", { replace: true });
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/station/profile`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const result = await response.json();
        setProfileData(result);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback({ type: "", message: "" });
    try {
      const response = await fetch(`${API_BASE_URL}/api/station/profile`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(profileData)
      });
      if (response.ok) {
        setFeedback({ type: "success", message: "Profile updated successfully!" });
        setTimeout(() => {
          setShowSettings(false);
          setFeedback({ type: "", message: "" });
        }, 2000);
      } else {
        const err = await response.json();
        setFeedback({ type: "error", message: err.message || "Update failed" });
      }
    } catch (error) {
      setFeedback({ type: "error", message: "Network error. Try again." });
    } finally {
      setIsSaving(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("All");
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate("/fuelstation/login", { replace: true });
      return;
    }
    fetchDashboardData(selectedDate);
    fetchProfile();
    // Auto refresh stock stats only if looking at today
    let interval;
    if (selectedDate === new Date().toISOString().split('T')[0]) {
      interval = setInterval(() => fetchDashboardData(selectedDate), 30000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [token, navigate, selectedDate]);

  const changeDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const newDate = d.toISOString().split('T')[0];
    setSelectedDate(newDate);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const StatCard = ({ title, value, icon: Icon, color, bg, unit = "L" }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl flex items-center justify-between group hover:bg-white/10 transition-all duration-300">
      <div>
        <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{title}</h3>
        <p className={`text-3xl font-bold ${color} font-mono flex items-baseline gap-1`}>
          {parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          {unit && <span className="text-[14px] font-medium opacity-60 ml-0.5 tracking-normal">{unit}</span>}
        </p>
      </div>
      <div className={`p-4 rounded-2xl ${bg} ${color} shadow-lg shadow-black/20`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-4 md:p-10 font-sans selection:bg-orange-500/30">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tighter">
                <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-red-600 bg-clip-text text-transparent italic">
                  FUELPASS
                </span>
                <span className="ml-2 text-white/90">STATION</span>
              </h1>
              <span className="bg-orange-500/10 text-orange-400 text-[10px] font-black px-3 py-1 rounded-full border border-orange-500/20 uppercase tracking-widest">
                Partner Dashboard
              </span>
            </div>
            <p className="text-gray-400 text-sm font-medium flex items-center gap-2">
              Welcome back, <span className="text-white bg-white/5 px-2 py-0.5 rounded font-mono">{stationId}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 transition-all py-2.5 px-6 rounded-2xl cursor-pointer text-gray-400 hover:text-white border border-white/10 font-bold text-sm shadow-xl hover:shadow-orange-500/5 group"
            >
              <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" /> Settings
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem("stationToken");
                localStorage.removeItem("stationId");
                navigate("/fuelstation/login", { replace: true });
              }}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 transition-all py-2.5 px-6 rounded-2xl cursor-pointer text-red-400 border border-red-500/20 font-bold text-sm shadow-xl shadow-red-500/5 group"
            >
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> Logout
            </button>
          </div>
        </div>

        {/* Top Cards - Admin Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-12">
          <StatCard title="Petrol Stock" value={data.stats.petrol_stock} icon={Fuel} color="text-fuchsia-400" bg="bg-fuchsia-500/10" />
          <StatCard title="Diesel Stock" value={data.stats.diesel_stock} icon={Fuel} color="text-blue-400" bg="bg-blue-500/10" />
          <StatCard title="Petrol Issued" value={data.stats.petrol_issued_today} icon={TrendingUp} color="text-emerald-400" bg="bg-emerald-500/10" />
          <StatCard title="Diesel Issued" value={data.stats.diesel_issued_today} icon={TrendingUp} color="text-amber-400" bg="bg-amber-500/10" />
          <StatCard title="Total Customers" value={data.stats.customers_today} icon={Users} color="text-orange-400" bg="bg-orange-500/10" unit="Users" />
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl backdrop-blur-sm">
          <div className="p-8 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
                <History size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Transaction Records</h3>
                <p className="text-gray-400 text-sm font-medium">Detailed log of all fuel issued at this station</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
              {/* Original Date Navigator */}
              <div className="flex items-center gap-3 bg-black/20 p-1.5 rounded-2xl border border-white/5">
                <button 
                  onClick={() => changeDate(-1)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white cursor-pointer active:scale-95"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="flex items-center gap-2 px-3 min-w-[120px] justify-center">
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] italic">
                    {isToday ? "Today" : selectedDate}
                  </span>
                </div>
                <button 
                  onClick={() => changeDate(1)}
                  disabled={isToday}
                  className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white cursor-pointer disabled:opacity-10 disabled:cursor-not-allowed active:scale-95"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Vehicle Number Search */}
              <div className="relative w-full sm:w-64">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search Vehicle ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-orange-500/50 transition-all text-sm font-medium placeholder:text-gray-600 shadow-inner"
                />
              </div>

              {/* Filter Popover Button */}
              <div className="relative">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-3 rounded-2xl transition-all cursor-pointer flex items-center gap-2 ${showFilters ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'}`}
                >
                  <Filter size={20} />
                  {(fuelTypeFilter !== "All" || vehicleTypeFilter !== "All") && (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  )}
                </button>

                {showFilters && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowFilters(false)} />
                    <div className="absolute right-0 top-full mt-4 w-72 bg-[#16213A] border border-white/10 rounded-3xl p-6 shadow-2xl z-30 animate-in zoom-in-95 duration-200">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Fuel Type</label>
                          <div className="grid grid-cols-3 gap-2">
                            {["All", "Petrol", "Diesel"].map(type => (
                              <button
                                key={type}
                                onClick={() => setFuelTypeFilter(type)}
                                className={`py-2 rounded-xl text-[10px] font-black uppercase transition-all ${fuelTypeFilter === type ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/10' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                              >
                                {type}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Vehicle Category</label>
                          <div className="relative">
                            <Car size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            <select 
                              value={vehicleTypeFilter}
                              onChange={(e) => setVehicleTypeFilter(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-gray-300 focus:outline-none focus:border-orange-500/50 appearance-none cursor-pointer"
                            >
                              <option value="All">All Categories</option>
                              <option value="Bike">Bike</option>
                              <option value="Car">Car</option>
                              <option value="ThreeWheeler">3 Wheeler</option>
                              <option value="Van">Van</option>
                              <option value="Lorry">Lorry</option>
                              <option value="Bus">Bus</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-black text-gray-400 mb-3 uppercase tracking-widest">Jump to Date</label>
                          <div className="relative">
                            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                            <input 
                              type="date" 
                              value={selectedDate}
                              onChange={(e) => setSelectedDate(e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-black text-orange-400 focus:outline-none [color-scheme:dark] cursor-pointer"
                            />
                          </div>
                        </div>

                        <button 
                          onClick={() => { setFuelTypeFilter("All"); setVehicleTypeFilter("All"); }}
                          className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors border-t border-white/5 mt-2"
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[850px] overflow-y-auto low-stock-scrollbar">
            <table className="w-full text-left">
              <thead className="sticky top-0 z-10">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] bg-[#16213A] border-b border-white/10">
                  <th className="px-8 py-5">Time</th>
                  <th className="px-8 py-5">Vehicle Number</th>
                  <th className="px-8 py-5">Vehicle Category</th>
                  <th className="px-8 py-5">Fuel Type</th>
                  <th className="px-8 py-5 text-right">Fuel Issued</th>
                  <th className="px-8 py-5">Customer Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {data.transactions
                  .filter(t => 
                    (fuelTypeFilter === "All" || t.fuel_type === fuelTypeFilter) &&
                    (vehicleTypeFilter === "All" || t.vehicle_type?.toLowerCase() === vehicleTypeFilter.toLowerCase()) &&
                    (t.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()))
                  )
                  .length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <History size={48} />
                        <p className="text-lg font-medium italic">
                          {searchTerm || fuelTypeFilter !== "All" || vehicleTypeFilter !== "All"
                            ? "No matching transactions found" 
                            : `No transactions found for the selected date`}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.transactions
                    .filter(t => 
                      (fuelTypeFilter === "All" || t.fuel_type === fuelTypeFilter) &&
                      (vehicleTypeFilter === "All" || t.vehicle_type?.toLowerCase() === vehicleTypeFilter.toLowerCase()) &&
                      (t.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()))
                    )
                    .map((t, i) => (
                      <tr key={i} className="hover:bg-white/[0.03] transition-colors group">
                        <td className="px-8 py-5 text-xs text-gray-400 font-mono">
                          {t.date.split(' ')[1]}
                        </td>
                        <td className="px-8 py-5">
                          <span className="font-black text-white uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 group-hover:border-orange-500/30 transition-colors">
                            {t.vehicle_number || "GUEST"}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-sm font-semibold text-gray-300">
                          <span className="flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-gray-600" />
                             {t.vehicle_type || "N/A"}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            t.fuel_type === 'Petrol' 
                              ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' 
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {t.fuel_type}
                          </span>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <p className="text-xl font-black text-emerald-400 font-mono tracking-tighter">
                            {t.fuel_amount}<span className="text-[10px] ml-1 opacity-50 uppercase tracking-normal">Liters</span>
                          </p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors cursor-default">
                            <Users size={14} className="opacity-40" />
                            {t.customer_email}
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-8 bg-white/[0.02] border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            <p>Displaying {data.transactions.length} records</p>
            <p>Real-time data sync active</p>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isSaving && setShowSettings(false)} />
          <div className="bg-[#0B1220] border border-white/10 w-full max-w-xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-8 border-b border-white/10 flex items-center bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-400">
                  <Settings size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Station Profile</h3>
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-widest mt-0.5">Manage Your Station Details</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSettings(false)} 
                className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors cursor-pointer p-2 hover:bg-white/5 rounded-xl block"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Station ID</label>
                  <div className="relative">
                    <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input 
                      type="text" 
                      value={profileData.station_id || ""} 
                      disabled 
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm font-mono text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Station Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                    <input 
                      type="text" 
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all shadow-inner"
                      placeholder="Lanka IOC - Colombo"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Location Address</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                  <input 
                    type="text" 
                    value={profileData.location}
                    onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all shadow-inner"
                    placeholder="Enter full address"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Contact Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                    <input 
                      type="tel" 
                      value={profileData.phone_number || ""}
                      onChange={(e) => setProfileData({...profileData, phone_number: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all shadow-inner"
                      placeholder="+94 XX XXX XXXX"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-widest">Support Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
                    <input 
                      type="email" 
                      value={profileData.email || ""}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-orange-500/50 transition-all shadow-inner"
                      placeholder="station@example.com"
                    />
                  </div>
                </div>
              </div>

              {feedback.message && (
                <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <p className="text-xs font-bold">{feedback.message}</p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowSettings(false)}
                  disabled={isSaving}
                  className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 font-bold text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
