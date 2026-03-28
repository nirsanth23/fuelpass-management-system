import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart as BarIcon, TrendingUp } from "lucide-react";

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    dailyUsage: [],
    fuelTypeUsage: [],
    activeStations: []
  });

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/analytics`);
      const data = await response.json();
      if (response.ok) setAnalytics(data);
    } catch (err) { console.error("Failed to fetch analytics", err); }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-10 text-white">Advanced Analytics</h2>
      
      <div className="grid grid-cols-1 gap-8 animate-in slide-in-from-bottom-5 duration-500">
        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl overflow-hidden shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-emerald-400 font-mono tracking-tighter uppercase text-sm">
            <BarIcon size={20} /> Most Active Stations
          </h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={analytics.activeStations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#9CA3AF" width={100} fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#16213A', border: 'none', borderRadius: '12px' }}
                  itemStyle={{ color: '#10B981' }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl overflow-hidden shadow-xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-fuchsia-400 font-mono tracking-tighter uppercase text-sm">
            <TrendingUp size={20} /> Data Trends
          </h3>
          <div className="p-4 text-center text-gray-400 border border-white/5 bg-white/5 rounded-2xl italic">
             Detailed station-wise usage trends and predictive supply analytics coming soon.
          </div>
        </div>
      </div>
    </div>
  );
}
