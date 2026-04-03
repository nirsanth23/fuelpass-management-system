import React, { useState, useEffect } from "react";
import { 
  LogOut, Bell, Check, X, Fuel, Activity, 
  Settings, MapPin, Plus, Edit, TrendingUp, PieChart as PieIcon, BarChart as BarIcon, Phone, Mail
} from "lucide-react";
export default function AdminDashboard() {
  // ...existing dashboard content code (cards, charts, tables, etc.)...

  const COLORS = ['#F472B6', '#8B5CF6', '#6366F1', '#34D399', '#FBBF24'];

  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex">
      
      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold capitalize">
            {activeTab === 'home' ? 'Dashboard Overview' : `${activeTab} Management`}
          </h2>

          <div className="flex items-center gap-4">
            {activeTab === 'stations' && (
              <button
                onClick={() => {
                  setFormData({ stationId: '', name: '', location: '', password: '1234' });
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-600 px-4 py-2.5 rounded-xl font-bold transition cursor-pointer shadow-lg shadow-fuchsia-500/20"
              >
                <Plus size={18} /> <span className="hidden md:inline">Add Station</span>
              </button>
            )}

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
                          <button 
                            onClick={() => handleApprove(n)}
                            disabled={loadingId === n.id}
                            className="mt-3 w-full py-2 bg-fuchsia-500 text-white rounded-xl text-xs font-bold transition hover:bg-fuchsia-600 disabled:opacity-50 shadow-lg shadow-fuchsia-500/10"
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
        </div>

        {/* Tab Content */}
        {activeTab === 'home' && (
          <div className="animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard title="Petrol Stock" value={`${stats.total_petrol_stock}L`} icon={Fuel} color="text-fuchsia-400" />
              <StatCard title="Diesel Stock" value={`${stats.total_diesel_stock}L`} icon={Fuel} color="text-blue-400" />
              <StatCard title="Active Stations" value={stats.active_stations} icon={MapPin} color="text-emerald-400" />
              <StatCard title="Issued Today" value={`${stats.total_fuel_issued_today}L`} icon={Check} color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <TrendingUp className="text-fuchsia-400" /> Consumption Trend (7 Days)
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.dailyUsage}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString([], {weekday: 'short'})} />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#16213A', border: 'none', borderRadius: '12px' }}
                        itemStyle={{ color: '#F472B6' }}
                      />
                      <Bar dataKey="total" fill="#D946EF" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <PieIcon className="text-blue-400" /> Fuel Type Comparison
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.fuelTypeUsage}
                        dataKey="total"
                        nameKey="fuel_type"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                      >
                        {analytics.fuelTypeUsage.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#16213A', border: 'none', borderRadius: '12px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quota' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-5 duration-500">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                  <th className="px-6 py-5">Vehicle Type</th>
                  <th className="px-6 py-5">Weekly Limit (L)</th>
                  <th className="px-6 py-5">Carry Forward (L)</th>
                  <th className="px-6 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {quotaRules.map(rule => (
                  <tr key={rule.vehicle_type} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 font-bold text-fuchsia-300">{rule.vehicle_type}</td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        defaultValue={rule.weekly_limit}
                        onChange={(e) => rule.weekly_limit = e.target.value}
                        className="bg-white/5 border border-white/10 rounded px-3 py-1.5 w-24 focus:outline-none focus:border-fuchsia-500 text-sm font-mono"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input 
                        type="number" 
                        defaultValue={rule.carry_forward_limit}
                        onChange={(e) => rule.carry_forward_limit = e.target.value}
                        className="bg-white/5 border border-white/10 rounded px-3 py-1.5 w-24 focus:outline-none focus:border-fuchsia-500 text-sm font-mono"
                      />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => updateQuota(rule)}
                        className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl hover:bg-emerald-500/20 transition cursor-pointer"
                      >
                        <Check size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stations' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-5 duration-500">
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/10 text-gray-400 text-xs uppercase tracking-wider">
                    <th className="px-6 py-5 font-bold">ID</th>
                    <th className="px-6 py-5 font-bold">Station Name</th>
                    <th className="px-6 py-5 font-bold">Location</th>
                    <th className="px-6 py-5 font-bold">Status</th>
                    <th className="px-6 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {stations.map(s => (
                    <tr key={s.station_id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 font-mono text-gray-400 text-sm">{s.station_id}</td>
                      <td className="px-6 py-4 font-bold text-fuchsia-100">{s.name || 'Set Name'}</td>
                      <td className="px-6 py-4 text-gray-300">{s.location || 'Set Location'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                          s.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2 transition-opacity">
                        <button 
                          onClick={() => {
                            setEditingStation(s);
                            setFormData({ name: s.name, location: s.location, password: s.password });
                            setShowEditModal(true);
                          }}
                          className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition cursor-pointer"
                        >
                          <Edit size={18}/>
                        </button>
                        <button 
                          onClick={() => toggleStationStatus(s.station_id, s.status)}
                          className={`p-2 rounded-lg transition cursor-pointer ${
                            s.status === 'Active' ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                          }`}
                        >
                          {s.status === 'Active' ? <X size={18}/> : <Check size={18}/>}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'supply' && (
          <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-xs uppercase">
                  <th className="px-6 py-5">Station</th>
                  <th className="px-6 py-5 text-fuchsia-400">Petrol Stock</th>
                  <th className="px-6 py-5 text-blue-400">Diesel Stock</th>
                  <th className="px-6 py-5">Last Supply</th>
                  <th className="px-6 py-5">Amount</th>
                  <th className="px-6 py-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {stations.map(s => (
                  <tr key={s.station_id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                        <p className="font-bold">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.station_id}</p>
                    </td>
                    <td className="px-6 py-4 font-mono">{s.petrol_stock}L</td>
                    <td className="px-6 py-4 font-mono">{s.diesel_stock}L</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{s.last_supplied_date ? new Date(s.last_supplied_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 font-mono">{s.last_supplied_amount}L</td>
                    <td className="px-6 py-4">
                         <span className={`h-2 w-2 inline-block rounded-full mr-2 ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                         {s.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}


      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#16213A] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-fuchsia-400">Add New Station</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition cursor-pointer"><X size={20}/></button>
            </div>
            <form onSubmit={handleAddStation} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Station ID</label>
                <input required value={formData.stationId} onChange={e => setFormData({...formData, stationId: e.target.value})} placeholder="e.g., ST011" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 transition"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Station Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g., Lanka Fuel" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 transition"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Location</label>
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g., Colombo 03" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 transition"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 transition"/>
              </div>
              <button className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 py-4 rounded-xl font-bold mt-4 shadow-lg shadow-fuchsia-500/20 transition cursor-pointer">Create Station</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingStation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#16213A] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-blue-400">Edit: {editingStation.station_id}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-white transition cursor-pointer"><X size={20}/></button>
            </div>
            <form onSubmit={handleEditStation} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"/>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Location</label>
                <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition"/>
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl font-bold mt-4 shadow-lg shadow-blue-500/20 transition cursor-pointer">Update Station</button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-8 right-8 max-w-sm p-4 rounded-2xl shadow-2xl border flex items-start gap-4 z-[120] animate-in slide-in-from-right-5 duration-300 ${
            toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
          <div className="mt-0.5">{toast.type === 'success' ? <Check size={24} /> : <X size={24} />}</div>
          <div className="flex-1">
            <h4 className="font-bold text-lg mb-1">{toast.title}</h4>
            <p className="text-sm opacity-90 leading-relaxed">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100 transition cursor-pointer ml-2"><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
