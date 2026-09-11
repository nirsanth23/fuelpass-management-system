import React, { useState, useEffect } from "react";
import { Plus, Edit, X, Check, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export default function StationManagement() {
  const [stations, setStations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({ stationId: '', name: '', location: '', email: '' });
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  const fetchStations = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/api/admin/stations`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      const data = await response.json();
      if (response.ok) setStations(data);
    } catch (err) { console.error("Failed to fetch stations", err); }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAddStation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/api/admin/stations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData),
      });
      const resData = await response.json();
      if (response.ok) {
        setToast({ 
          type: 'success', 
          title: 'Station Created & Email Sent', 
          message: `${formData.name || formData.stationId} created. 6-digit password sent to ${formData.email}.` 
        });
        setShowAddModal(false);
        setFormData({ stationId: '', name: '', location: '', email: '' });
        fetchStations();
      } else {
        setToast({ type: 'error', title: 'Create Failed', message: resData.message || 'Failed to create station.' });
      }
    } catch (err) { 
      console.error("Add failed", err);
      setToast({ type: 'error', title: 'Create Failed', message: 'Failed to create station. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStation = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${editingStation.station_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ name: formData.name, location: formData.location }),
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Updated', message: `${formData.name || editingStation.name} updated successfully.` });
        setShowEditModal(false);
        setEditingStation(null);
        fetchStations();
      }
    } catch (err) { console.error("Update failed", err); }
  };

  const toggleStatus = async (stationId, currentStatus, stationName) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${stationId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        const displayName = stationName || stationId;
        setToast({ type: 'success', title: 'Status Updated', message: `${displayName} is now ${newStatus}.` });
        fetchStations();
      }
    } catch (err) { console.error("Toggle status failed", err); }
  };

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const handleDeleteStation = async () => {
    if (!editingStation) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${editingStation.station_id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Deleted', message: `${editingStation.name || editingStation.station_id} deleted successfully.` });
        setShowEditModal(false);
        setEditingStation(null);
        fetchStations();
      } else {
        setToast({ type: 'error', title: 'Delete Failed', message: 'Failed to delete station.' });
      }
    } catch (err) {
      setToast({ type: 'error', title: 'Delete Failed', message: 'Failed to delete station.' });
      console.error("Delete failed", err);
    }
    setDeleting(false);
    setShowDeleteModal(false);
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

  const totalStations = stations.length;
  const totalPages = Math.ceil(totalStations / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedStations = stations.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Stations Management</h2>
        <button
          onClick={() => {
            setFormData({ stationId: generateNextStationId(), name: '', location: '', email: '' });
            setShowAddModal(true);
          }}
          className="group flex items-center gap-2 text-gray-300 bg-transparent border border-fuchsia-500 hover:bg-fuchsia-600 hover:text-white px-4 py-2.5 rounded-xl font-bold transition cursor-pointer"
        >
          <Plus size={18} className="text-fuchsia-500 group-hover:text-white transition" /> Add Station
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
            {paginatedStations.map(s => (
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
                      setFormData({ name: s.name, location: s.location, email: s.email || '' });
                      setShowEditModal(true);
                    }}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition cursor-pointer"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => toggleStatus(s.station_id, s.status, s.name)}
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

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-3 text-gray-400">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#16213A] border border-white/10 rounded-lg px-2.5 py-1 text-white outline-none focus:border-fuchsia-500 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-gray-400 text-xs">
              Showing {totalStations === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + rowsPerPage, totalStations)} of {totalStations} stations
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer text-xs font-semibold"
            >
              <ChevronLeft size={16} /> Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                .map((p, idx, arr) => {
                  const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                  return (
                    <React.Fragment key={p}>
                      {showEllipsis && <span className="px-1 text-gray-500">...</span>}
                      <button
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                          currentPage === p
                            ? "bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/30"
                            : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  );
                })}
            </div>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer text-xs font-semibold"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#16213A] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-xl font-bold text-fuchsia-400">Add New Station</h3>
              <X className="cursor-pointer text-gray-400 hover:text-white transition" onClick={() => setShowAddModal(false)} />
            </div>
            <form onSubmit={handleAddStation} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Station ID (Autogenerated)</label>
                <input
                  required
                  readOnly
                  value={formData.stationId}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 opacity-70 cursor-not-allowed text-fuchsia-300 font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Station Name</label>
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Location</label>
                <input 
                  required 
                  value={formData.location} 
                  onChange={e => setFormData({ ...formData, location: e.target.value })} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Station Email</label>
                <input 
                  type="email" 
                  required 
                  value={formData.email} 
                  onChange={e => setFormData({ ...formData, email: e.target.value })} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500" 
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 disabled:opacity-50 py-4 rounded-xl font-bold mt-2 shadow-lg shadow-fuchsia-500/20 transition cursor-pointer text-white"
              >
                {isSubmitting ? 'Creating Station...' : 'Create Station'}
              </button>
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
              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition cursor-pointer"
                >
                  Update Station
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-1 bg-red-500 hover:bg-red-600 py-4 rounded-xl font-bold shadow-lg shadow-red-500/20 transition cursor-pointer"
                >
                  Delete Station
                </button>
                    {/* Delete Station Modal */}
                    {showDeleteModal && editingStation && (
                      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[120] p-4">
                        <div className="bg-[#16213A] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
                          <div className="flex flex-col items-center p-8">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm5 6v10M9 9v10" /></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-red-400 mb-2">Delete Station?</h3>
                            <p className="text-gray-300 mb-6 text-center">Are you sure you want to delete the station <span className="text-fuchsia-400 font-bold">{editingStation.station_id}</span>? This action cannot be undone.</p>
                            <div className="flex gap-4 w-full">
                              <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-white/10 hover:bg-white/20 text-gray-300 py-3 rounded-xl font-bold transition cursor-pointer"
                                disabled={deleting}
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleDeleteStation}
                                className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 transition cursor-pointer"
                                disabled={deleting}
                              >
                                {deleting ? 'Deleting...' : 'Delete'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-8 right-8 max-w-sm p-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 z-[120] animate-in slide-in-from-right-5 duration-300 bg-[#16213A] ${
          toast.type === 'success' ? 'border-emerald-500/50 shadow-emerald-950/50' : 'border-red-500/50 shadow-red-950/50'
        }`}>
          <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            <Check size={18} strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-bold text-sm mb-0.5 ${toast.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
              {toast.title}
            </h4>
            <p className="text-xs text-gray-200 leading-relaxed">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-gray-400 hover:text-white transition cursor-pointer p-1 shrink-0">
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
