import React, { useState, useEffect, useRef } from "react";
import { generateMonthlyReportPDF } from "./MonthlyReportGenerator";
import {
  Fuel, Activity, TrendingUp, PieChart as PieIcon, Check, MapPin, Bell, X, Phone, Mail
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function AdminOverview() {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationTab, setNotificationTab] = useState('pending');
  const [loadingId, setLoadingId] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strHours = hours.toString().padStart(2, '0');
    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
  };

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
    return () => {
      clearInterval(interval);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleApprove = async (notification) => {
    setLoadingId(notification.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/send-station-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id, email: notification.email }),
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Password Reset' });
        setShowNotifications(false);
        fetchData();
        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = setTimeout(() => {
          setToast(null);
          toastTimerRef.current = null;
        }, 10000);
      }
    } catch (err) { console.error("Approve failed", err); }
    finally { setLoadingId(null); }
  };

  const handleReject = async (notification) => {
    setLoadingId(notification.id);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/reject-station-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: notification.id }),
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Request Rejected' });
        fetchData();
        if (toastTimerRef.current) {
          clearTimeout(toastTimerRef.current);
        }
        toastTimerRef.current = setTimeout(() => {
          setToast(null);
          toastTimerRef.current = null;
        }, 10000);
      }
    } catch (err) { console.error("Reject failed", err); }
    finally { setLoadingId(null); }
  };

  const StatCard = ({ title, value, icon: Icon, color, unit = "" }) => (
    <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex items-center justify-between group hover:bg-white/10 transition-all duration-300">
      <div>
        <h3 className="text-gray-400 text-xs font-bold mb-1 uppercase tracking-widest">{title}</h3>
        <p className={`text-3xl font-bold ${color} font-mono flex items-baseline gap-1`}>
          {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
          {unit && <span className="text-[14px] font-medium opacity-60 ml-1 tracking-normal">{unit}</span>}
        </p>
      </div>
      <div className={`p-4 rounded-xl bg-white/5 ${color.replace('text-', 'bg-')}/10 ${color} shadow-lg shadow-black/20`}>
        <Icon size={24} />
      </div>
    </div>
  );

  const COLORS = ['#F472B6', '#8B5CF6', '#6366F1', '#34D399', '#FBBF24'];

  const handleGenerateReport = () => {
    generateMonthlyReportPDF();
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold">Dashboard Overview</h2>
          <span className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white text-sm font-bold px-5 py-1 rounded-2xl shadow">
            Colombo District
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition cursor-pointer border border-white/10"
            >
              <Bell size={20} className="text-fuchsia-500" />
              {notifications.filter(n => n.status === 'pending').length > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#0B1220]">
                  {notifications.filter(n => n.status === 'pending').length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-[#16213A] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#182542]">
                  <h3 className="font-bold text-fuchsia-300">Reset Requests</h3>
                  <X size={16} className="cursor-pointer text-gray-500 hover:text-white transition" onClick={() => setShowNotifications(false)} />
                </div>

                <div className="flex border-b border-white/10 bg-white/5">
                  {['pending', 'resolved', 'rejected'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setNotificationTab(tab)}
                      className={`flex-1 py-2.5 text-xs font-bold capitalize transition-colors ${notificationTab === tab
                          ? 'border-b-2 border-fuchsia-500 text-fuchsia-400 bg-white/5'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                    >
                      {tab === 'resolved' ? 'Approved' : tab}
                    </button>
                  ))}
                </div>

                <div className="max-h-72 overflow-y-auto low-stock-scrollbar">
                  {notifications.filter(n => n.status === (notificationTab === 'approved' ? 'resolved' : notificationTab)).length === 0 ? (
                    <p className="p-8 text-center text-gray-400 text-sm">No {notificationTab === 'resolved' ? 'approved' : notificationTab} requests</p>
                  ) : (
                    notifications.filter(n => n.status === (notificationTab === 'approved' ? 'resolved' : notificationTab)).map(n => (
                      <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition flex flex-col gap-1">
                        <div className="flex justify-between items-start">
                          <p className="text-xs font-mono text-fuchsia-400 uppercase tracking-wider">{n.station_username}</p>
                        </div>
                        <p className="text-sm font-bold text-white mb-0.5">{n.station_name || 'Station Name'}</p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Phone size={12} className="text-fuchsia-500/50" />
                            <span>{n.phone_number}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Mail size={12} className="text-fuchsia-500/50" />
                            <span>{n.email}</span>
                          </div>
                        </div>

                        {notificationTab === 'pending' ? (
                          <>
                            <div className="flex gap-2 mt-3 text-[10px] text-gray-400 font-mono text-center justify-center border-t border-white/5 pt-2">
                              Requested at: {formatDateTime(n.created_at)}
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleApprove(n)}
                                disabled={loadingId === n.id}
                                className="flex-1 py-2 bg-fuchsia-500 text-white rounded-xl text-xs font-bold transition hover:bg-fuchsia-600 disabled:opacity-50 shadow-lg shadow-fuchsia-500/10 cursor-pointer"
                              >
                                {loadingId === n.id ? "..." : "Approve"}
                              </button>
                              <button
                                onClick={() => handleReject(n)}
                                disabled={loadingId === n.id}
                                className="flex-1 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition hover:bg-red-500/20 disabled:opacity-50 cursor-pointer"
                              >
                                {loadingId === n.id ? "..." : "Reject"}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                            <div className="flex items-center">
                              {notificationTab === 'resolved' && <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"><Check size={12} /> APPROVED</span>}
                              {notificationTab === 'rejected' && <span className="text-red-400 bg-red-500/10 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1"><X size={12} /> REJECTED</span>}
                            </div>
                            <div className="text-gray-400 text-[10px] text-right">
                              <span className="opacity-70 mr-1">{notificationTab === 'resolved' ? 'Approved:' : 'Rejected:'}</span>
                              <span className="font-mono text-[10px]">
                                {n.resolved_at ? formatDateTime(n.resolved_at) : formatDateTime(n.created_at)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Generate Report Button */}
          <button
            onClick={handleGenerateReport}
            className="ml-2 px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-semibold rounded-xl shadow transition border border-fuchsia-700 cursor-pointer"
          >

            Generate Report
          </button>
        </div>
      </div>

      <div className="animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Petrol Stock" value={stats.total_petrol_stock} unit="L" icon={Fuel} color="text-fuchsia-400" />
          <StatCard title="Diesel Stock" value={stats.total_diesel_stock} unit="L" icon={Fuel} color="text-blue-400" />
          <StatCard title="Active Stations" value={stats.active_stations} icon={MapPin} color="text-emerald-400" />
          <StatCard title="Issued Today" value={stats.total_fuel_issued_today} unit="L" icon={Check} color="text-amber-400" />
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
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#16213A', border: 'none', borderRadius: '12px' }}
                  labelFormatter={(val) => new Date(val).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
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
          <div className="overflow-y-auto pr-2 custom-scrollbar max-h-80 low-stock-scrollbar" style={{ maxHeight: '18rem' }}>
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
                        <td className={`px-4 py-3 text-right font-mono text-sm ${station.petrol_stock < 1000 ? 'text-red-400' : 'text-fuchsia-300'}`}>{station.petrol_stock}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
                        <td className={`px-4 py-3 text-right font-mono text-sm ${station.diesel_stock < 1000 ? 'text-red-400' : 'text-blue-300'}`}>{station.diesel_stock}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
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
                        <td className={`px-4 py-3 text-right font-mono text-sm ${station.petrol_stock < 1000 ? 'text-red-400' : 'text-fuchsia-300'}`}>{station.petrol_stock}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
                        <td className={`px-4 py-3 text-right font-mono text-sm ${station.diesel_stock < 1000 ? 'text-red-400' : 'text-blue-300'}`}>{station.diesel_stock}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
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
        <div className={`fixed bottom-8 right-8 max-w-sm p-4 rounded-2xl shadow-2xl border flex items-start gap-4 z-[120] animate-in slide-in-from-right-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
          <Check size={24} className="mt-0.5" />
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">{toast.title}</h4>
          </div>
          <X size={16} className="opacity-50 hover:opacity-100 transition cursor-pointer ml-2" onClick={() => setToast(null)} />
        </div>
      )}
    </div>
  );
}
