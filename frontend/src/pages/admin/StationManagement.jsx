import React, { useState, useEffect } from "react";
import { Plus, Edit, X, Check, MapPin } from "lucide-react";

export default function StationManagement() {
  const [stations, setStations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({ stationId: '', name: '', location: '', password: '1234' });
  const [toast, setToast] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  const fetchStations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations`);
      const data = await response.json();
      if (response.ok) setStations(data);
    } catch (err) { console.error("Failed to fetch stations", err); }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleAddStation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Station Added', message: `Station ${formData.stationId} created.` });
        setShowAddModal(false);
        setFormData({ stationId: '', name: '', location: '', password: '1234' });
        fetchStations();
      }
    } catch (err) { console.error("Add failed", err); }
  };

  const handleEditStation = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${editingStation.station_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: formData.name, location: formData.location }),
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Updated', message: 'Station updated successfully.' });
        setShowEditModal(false);
        setEditingStation(null);
        fetchStations();
      }
    } catch (err) { console.error("Update failed", err); }
  };

  const toggleStatus = async (stationId, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${stationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Status Updated', message: `Station is now ${newStatus}.` });
        fetchStations();
      }
    } catch (err) { console.error("Toggle status failed", err); }
  };

  const generateNextStationId = () => {
    if (!stations || stations.length === 0) return 'ST001';
    const ids = stations
      .map(s => s.station_id)
      .filter(id => id && id.startsWith('ST'))
      .map(id => parseInt(id.replace('ST', ''), 10))
      .filter(n => !isNaN(n));

    if (ids.length === 0) return 'ST001';
    const nextNumber = Math.max(...ids) + 1;
    return `ST${String(nextNumber).padStart(3, '0')}`;
  };

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Stations Management</h2>
        <button
          onClick={() => {
            setFormData({ stationId: generateNextStationId(), name: '', location: '', password: '1234' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 text-gray-300 bg-transparent border border-fuchsia-500 hover:bg-fuchsia-600 hover:text-white px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
        >
          <Plus size={18} /> Add Station
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-5 duration-500">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/10 text-gray-400 text-xs uppercase tracking-wider">
              <th className="px-6 py-5">ID</th>
              <th className="px-6 py-5">Station Name</th>
              <th className="px-6 py-5">Location</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {stations.map(s => (
              <tr key={s.station_id} className="hover:bg-white/5 transition group">
                <td className="px-6 py-4 font-mono text-gray-400 text-sm">{s.station_id}</td>
                <td className="px-6 py-4 font-semibold text-fuchsia-100">{s.name || 'Set Name'}</td>
                <td className="px-6 py-4 text-gray-300">{s.location || 'Set Location'}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-red-500/10 text-red-400 border-red-500/30'
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
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => toggleStatus(s.station_id, s.status)}
                    className={`p-2 rounded-lg transition cursor-pointer ${s.status === 'Active' ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'
                      }`}
                  >
                    {s.status === 'Active' ? <X size={18} /> : <Check size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#16213A] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-fuchsia-400">Add New Station</h3>
              <X className="cursor-pointer text-gray-500" onClick={() => setShowAddModal(false)} />
            </div>
            <form onSubmit={handleAddStation} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Station ID (Autogenerated)</label>
                <input
                  required
                  readOnly
                  value={formData.stationId}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 opacity-70 cursor-not-allowed text-gray-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Station Name</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Location</label>
                <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Password</label>
                <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500" />
              </div>
              <button className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 py-4 rounded-xl font-bold mt-4 shadow-lg shadow-fuchsia-500/20 transition cursor-pointer">Create Station</button>
            </form>
          </div>
        </div>
      )}

      {showEditModal && editingStation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#16213A] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-blue-400">Edit: {editingStation.station_id}</h3>
              <X className="cursor-pointer text-gray-500" onClick={() => setShowEditModal(false)} />
            </div>
            <form onSubmit={handleEditStation} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Station Name</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Location</label>
                <input required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500" />
              </div>
              <button className="w-full bg-blue-500 hover:bg-blue-600 py-4 rounded-xl font-bold mt-4 shadow-lg shadow-blue-500/20 transition cursor-pointer">Update Station</button>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-8 right-8 max-w-sm p-4 rounded-2xl shadow-2xl border flex items-start gap-4 z-[120] animate-in slide-in-from-right-5 duration-300 ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
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
