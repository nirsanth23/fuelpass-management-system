import React, { useState, useEffect } from "react";
import { 
  Fuel, Activity, TrendingUp, PieChart as PieIcon, Check, MapPin, Bell, X 
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function AdminOverview() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);

  const [stats, setStats] = useState({
    total_petrol_stock: 0,
    total_diesel_stock: 0,
    active_stations: 0,
    total_fuel_issued_today: 0
  });

  const [analytics, setAnalytics] = useState({
    dailyUsage: [],
    fuelTypeUsage: [],
    activeStations: [],
    lowStockStations: []
  });

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  const fetchData = async () => {
    try {
      const [notifsResp, statsResp, analyticsResp] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/notifications`),
        fetch(`${API_BASE_URL}/api/admin/stats`),
        fetch(`${API_BASE_URL}/api/admin/analytics`)
      ]);

      if (notifsResp.ok) {
        const d = await notifsResp.json();
        setNotifications(d.notifications || []);
      }
      if (statsResp.ok) {
        const d = await statsResp.json();
        setStats(d);
      }
      if (analyticsResp.ok) {
        const d = await analyticsResp.json();
        setAnalytics(d);
      }
    } catch (err) { console.error("Failed to fetch dashboard data", err); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (notification) => {
    setLoadingId(notification.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/send-station-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id, email: notification.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setToast({ type: 'success', title: 'Password Reset', message: `Password sent: ${data.newPassword}` });
        setShowNotifications(false);
        fetchData();
      }
    } catch (err) { console.error("Approve failed", err); }
    finally { setLoadingId(null); }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between">
      <div>
        <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
        <p className={`text-3xl font-bold ${color}`}>{value}</p>
      </div>
      <div className={`p-3 rounded-xl bg-white/5 ${color.replace('text-', 'bg-')}/10 ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  const COLORS = ['#F472B6', '#8B5CF6', '#6366F1', '#34D399', '#FBBF24'];

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer border border-white/10"
          >
            <Bell size={20} className="text-gray-300" />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#0B1220]">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-[#16213A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="font-bold text-fuchsia-300">Reset Requests</h3>
                <X size={16} className="cursor-pointer text-gray-500" onClick={() => setShowNotifications(false)} />
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="p-4 text-center text-gray-400 text-sm">Clear</p>
                ) : (
                  notifications.map(n => (
                    <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition">
                      <p className="text-sm font-bold">{n.station_username}</p>
                      <p className="text-xs text-gray-400">{n.email}</p>
                      <button 
                        onClick={() => handleApprove(n)}
                        disabled={loadingId === n.id}
                        className="mt-2 w-full py-1.5 bg-fuchsia-500 text-white rounded-lg text-xs font-bold transition hover:bg-fuchsia-600 disabled:opacity-50"
                      >
                        {loadingId === n.id ? "Sending..." : "Approve & Send"}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Petrol Stock" value={`${stats.total_petrol_stock}L`} icon={Fuel} color="text-fuchsia-400" />
          <StatCard title="Diesel Stock" value={`${stats.total_diesel_stock}L`} icon={Fuel} color="text-blue-400" />
          <StatCard title="Active Stations" value={stats.active_stations} icon={MapPin} color="text-emerald-400" />
          <StatCard title="Issued Today" value={`${stats.total_fuel_issued_today}L`} icon={Check} color="text-amber-400" />
        </div>

        {/* Consumption Trend - Full Width */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-fuchsia-400" /> Consumption Trend (7 Days)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.dailyUsage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString([], {weekday: 'short', month: 'short', day: 'numeric'})} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16213A', border: 'none', borderRadius: '12px' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString([], {weekday: 'long', year: 'numeric', month: 'short', day: 'numeric'})}
                />
                <Legend />
                <Bar dataKey="petrol" name="Petrol" fill="#F472B6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="diesel" name="Diesel" fill="#60A5FA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Warning - Full Width Below */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-400">
            🚨 Low Stock Warning
          </h3>
          <div className="overflow-y-auto pr-2 custom-scrollbar max-h-80 low-stock-scrollbar" style={{maxHeight: '18rem'}}>
            {(!analytics.lowStockStations || analytics.lowStockStations.length === 0) ? (
              <p className="text-gray-400 text-sm italic">All stations have sufficient stock.</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 bg-[#181F36] sticky top-0 z-10">
                    <th className="px-4 py-3">Station ID</th>
                    <th className="px-4 py-3">Station Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3 text-right">Petrol</th>
                    <th className="px-4 py-3 text-right">Diesel</th>
                    <th className="px-4 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {analytics.lowStockStations.slice(0, 5).map((station) => {
                    const minStock = Math.min(station.petrol_stock, station.diesel_stock);
                    const isCritical = minStock < 500;
                    return (
                      <tr key={station.station_id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-gray-300 font-mono text-sm">{station.station_id}</td>
                        <td className="px-4 py-3 font-semibold text-white">{station.station_name}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{station.location || '—'}</td>
                        <td className={`px-4 py-3 text-right font-mono text-sm ${station.petrol_stock < 1000 ? 'text-red-400' : 'text-fuchsia-300'}`}>{station.petrol_stock}L</td>
                        <td className={`px-4 py-3 text-right font-mono text-sm ${station.diesel_stock < 1000 ? 'text-red-400' : 'text-blue-300'}`}>{station.diesel_stock}L</td>
                        <td className="px-4 py-3 text-right">
                          {isCritical ? (
                            <span className="text-red-400 bg-red-400/10 px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                              🔴 Critical
                            </span>
                          ) : (
                            <span className="text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                              ⚠️ Warning
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {analytics.lowStockStations.slice(5).map((station) => {
                    const minStock = Math.min(station.petrol_stock, station.diesel_stock);
                    const isCritical = minStock < 500;
                    return (
                      <tr key={station.station_id} className="hover:bg-white/5 transition">
                        <td className="px-4 py-3 text-gray-300 font-mono text-sm">{station.station_id}</td>
                        <td className="px-4 py-3 font-semibold text-white">{station.station_name}</td>
                        <td className="px-4 py-3 text-gray-400 text-sm">{station.location || '—'}</td>
                        <td className={`px-4 py-3 text-right font-mono text-sm ${station.petrol_stock < 1000 ? 'text-red-400' : 'text-fuchsia-300'}`}>{station.petrol_stock}L</td>
                        <td className={`px-4 py-3 text-right font-mono text-sm ${station.diesel_stock < 1000 ? 'text-red-400' : 'text-blue-300'}`}>{station.diesel_stock}L</td>
                        <td className="px-4 py-3 text-right">
                          {isCritical ? (
                            <span className="text-red-400 bg-red-400/10 px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                              🔴 Critical
                            </span>
                          ) : (
                            <span className="text-yellow-400 bg-yellow-400/10 px-3 py-1 rounded-lg text-xs font-bold inline-flex items-center gap-1">
                              ⚠️ Warning
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Top Fuel Consuming Stations (Last 7 Days) - Full Width Below Low Stock Warning */}
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl overflow-hidden shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-400 font-mono tracking-tighter uppercase text-sm">
            <BarChart size={20} /> Top Fuel Consuming Stations (Last 7 Days)
          </h3>
          <p className="text-xs text-gray-400 ml-2 mb-4">
            This chart shows the stations where customers consumed the most fuel (in liters) over the past week.
          </p>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={analytics.activeStations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16213A', border: 'none', borderRadius: '12px' }}
                  formatter={(value) => [`${value} L`, 'Total Fuel']} 
                  itemStyle={{ color: '#10B981' }}
                />
                <Bar dataKey="total_fuel" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`fixed bottom-8 right-8 max-w-sm p-4 rounded-2xl shadow-2xl border flex items-start gap-4 z-[120] animate-in slide-in-from-right-5 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <Check size={24} className="mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">{toast.title}</h4>
            <p className="text-sm opacity-90 leading-relaxed">{toast.message}</p>
          </div>
          <X size={16} className="opacity-50 hover:opacity-100 transition cursor-pointer ml-2" onClick={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
