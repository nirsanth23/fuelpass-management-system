import React, { useState, useEffect } from "react";
import { Check, X, Settings, Plus, Trash2 } from "lucide-react";

export default function QuotaManagement() {
  const [quotaRules, setQuotaRules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingVehicle, setDeletingVehicle] = useState(null);
  const [newVehicleData, setNewVehicleData] = useState({ vehicleType: '', weeklyLimit: 0, carryForwardLimit: 0, category: 'Light Vehicles' });
  const [toast, setToast] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  const fetchQuotaRules = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota-rules`);
      const data = await response.json();
      if (response.ok) setQuotaRules(data);
    } catch (err) { console.error("Failed to fetch quota rules", err); }
  };

  useEffect(() => {
    fetchQuotaRules();
  }, []);

  const updateQuota = async (rule) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota-rules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleType: rule.vehicle_type,
          weeklyLimit: rule.weekly_limit,
          carryForwardLimit: rule.carry_forward_limit
        }),
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Updated', message: 'Quota rule updated successfully.' });
        fetchQuotaRules();
      }
    } catch (err) { console.error("Update failed", err); }
  };

  const handleCreateQuota = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota-rules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newVehicleData),
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Vehicle Added', message: `${newVehicleData.vehicleType} added to quota rules.` });
        setShowAddModal(false);
        setNewVehicleData({ vehicleType: '', weeklyLimit: 0, carryForwardLimit: 0, category: 'Light Vehicles' });
        fetchQuotaRules();
      }
    } catch (err) { console.error("Create failed", err); }
  };

  const handleDeleteQuota = async (vehicleType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/quota-rules/${vehicleType}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Deleted', message: `${vehicleType} removed from quota rules.` });
        fetchQuotaRules();
        setShowDeleteModal(false);
        setDeletingVehicle(null);
      }
    } catch (err) { console.error("Delete failed", err); }
  };

  // Group rules dynamically by the correct database category
  const rulesGroup1 = quotaRules.filter(r => r.category === 'Light Vehicles');
  const rulesGroup2 = quotaRules.filter(r => r.category && r.category !== 'Light Vehicles');

  const QuotaTable = ({ title, rules }) => (
    <div className="flex-1 min-w-[400px]">
      <h3 className="text-xl font-bold mb-4 text-fuchsia-400 pl-2">{title}</h3>
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-5 duration-500">
        <table className="w-full text-left bg-transparent">
          <thead>
            <tr className="bg-white/10 text-gray-400 text-[10px] uppercase tracking-wider border-b border-white/5">
              <th className="px-6 py-5">Vehicle Type</th>
              <th className="px-6 py-5">Weekly Limit (L)</th>
              <th className="px-6 py-5">Carry Over (L)</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rules.map(rule => (
              <tr key={rule.vehicle_type} className="hover:bg-white/5 transition group">
                <td className="px-6 py-4 font-semibold text-white text-sm">{rule.vehicle_type}</td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    step="1"
                    defaultValue={Number(rule.weekly_limit).toFixed(2)}
                    onChange={(e) => rule.weekly_limit = e.target.value}
                    onBlur={(e) => e.target.value = parseFloat(e.target.value || 0).toFixed(2)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 w-20 focus:outline-none focus:border-fuchsia-500 text-xs font-mono"
                  />
                </td>
                <td className="px-6 py-4">
                  <input
                    type="number"
                    step="1"
                    defaultValue={Number(rule.carry_forward_limit).toFixed(2)}
                    onChange={(e) => rule.carry_forward_limit = e.target.value}
                    onBlur={(e) => e.target.value = parseFloat(e.target.value || 0).toFixed(2)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 w-20 focus:outline-none focus:border-blue-500 text-xs font-mono"
                  />
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-1 px-4">
                  <button
                    onClick={() => updateQuota(rule)}
                    className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition cursor-pointer"
                    title="Update Quota"
                  >
                    <Check size={18} />
                  </button>
                  <button
                    onClick={() => { setDeletingVehicle(rule.vehicle_type); setShowDeleteModal(true); }}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                    title="Delete Rule"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Quota Management</h2>
        <button
          onClick={() => {
            setNewVehicleData({ vehicleType: '', weeklyLimit: 0, carryForwardLimit: 0, category: 'Light Vehicles' });
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 text-gray-300 bg-transparent border border-fuchsia-500 hover:bg-fuchsia-600 hover:text-white px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
        >
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-10 mb-10">
        <QuotaTable title="Light Vehicles" rules={rulesGroup1} />
        <QuotaTable title="Heavy & Special Vehicles" rules={rulesGroup2} />
      </div>

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#16213A] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-fuchsia-400">Add New Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-500 hover:text-white transition cursor-pointer"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateQuota} className="p-6 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Vehicle Type</label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={newVehicleData.vehicleType}
                  onChange={e => setNewVehicleData({ ...newVehicleData, vehicleType: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 transition text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Category</label>
                <div className="relative">
                  <select
                    required
                    value={newVehicleData.category}
                    onChange={e => setNewVehicleData({ ...newVehicleData, category: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 appearance-none focus:outline-none focus:border-fuchsia-500 transition text-sm text-white"
                  >
                    <option value="Light Vehicles" className="bg-[#16213A] text-white">Light Vehicles</option>
                    <option value="Heavy & Special Vehicles" className="bg-[#16213A] text-white">Heavy & Special Vehicles</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Weekly Limit (L)</label>
                  <input
                    type="number"
                    required
                    value={newVehicleData.weeklyLimit}
                    onChange={e => setNewVehicleData({ ...newVehicleData, weeklyLimit: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 transition text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Carry Over (L)</label>
                  <input
                    type="number"
                    required
                    value={newVehicleData.carryForwardLimit}
                    onChange={e => setNewVehicleData({ ...newVehicleData, carryForwardLimit: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-fuchsia-500 transition text-sm font-mono"
                  />
                </div>
              </div>

              <button className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 py-4 rounded-xl font-bold mt-4 shadow-lg shadow-fuchsia-500/20 transition cursor-pointer">
                Create Quota Rule
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingVehicle && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#16213A] border border-white/10 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                <Trash2 className="text-red-400" size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white">Delete Rule?</h3>
              <p className="text-gray-400 text-sm">Are you sure you want to delete the quota for <span className="text-fuchsia-400 font-bold">{deletingVehicle}</span>? This action cannot be undone.</p>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeletingVehicle(null); }}
                  className="flex-1 py-3 rounded-xl font-bold bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteQuota(deletingVehicle)}
                  className="flex-1 py-3 rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
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
