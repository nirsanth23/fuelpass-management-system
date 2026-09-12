import React, { useState, useEffect } from "react";
import { Plus, Edit, X, Check, MapPin, Trash2 } from "lucide-react";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";
import Pagination from "../../components/common/Pagination";

export default function StationManagement() {
  const [stations, setStations] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [formData, setFormData] = useState({ stationId: "", name: "", location: "", email: "" });
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
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
    } catch (err) {
      console.error("Failed to fetch stations", err);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

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
          type: "success", 
          title: "Station Created & Email Sent", 
          message: `${formData.name || formData.stationId} created. Credentials sent to ${formData.email}.` 
        });
        setShowAddModal(false);
        setFormData({ stationId: "", name: "", location: "", email: "" });
        fetchStations();
      } else {
        setToast({ type: "error", title: "Create Failed", message: resData.message || "Failed to create station." });
      }
    } catch (err) { 
      console.error("Add failed", err);
      setToast({ type: "error", title: "Create Failed", message: "Failed to create station. Please try again." });
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
        setToast({ type: "success", title: "Updated", message: `${formData.name || editingStation.name} updated successfully.` });
        setShowEditModal(false);
        setEditingStation(null);
        fetchStations();
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const toggleStatus = async (stationId, currentStatus, stationName) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
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
        setToast({ type: "success", title: "Status Updated", message: `${displayName} is now ${newStatus}.` });
        fetchStations();
      }
    } catch (err) {
      console.error("Toggle status failed", err);
    }
  };

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
        setToast({ type: "success", title: "Deleted", message: `${editingStation.name || editingStation.station_id} deleted successfully.` });
        setShowDeleteModal(false);
        setShowEditModal(false);
        setEditingStation(null);
        fetchStations();
      } else {
        setToast({ type: "error", title: "Delete Failed", message: "Failed to delete station." });
      }
    } catch (err) {
      setToast({ type: "error", title: "Delete Failed", message: "Failed to delete station." });
      console.error("Delete failed", err);
    } finally {
      setDeleting(false);
    }
  };

  const generateNextStationId = () => {
    if (!stations || stations.length === 0) return "ST001";
    const ids = stations
      .map((s) => s.station_id)
      .filter((id) => id && id.startsWith("ST"))
      .map((id) => parseInt(id.replace("ST", ""), 10))
      .filter((n) => !isNaN(n));

    if (ids.length === 0) return "ST001";
    const nextNumber = Math.max(...ids) + 1;
    return `ST${String(nextNumber).padStart(3, "0")}`;
  };

  const totalStations = stations.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedStations = stations.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="p-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white">Stations Management</h2>
          <p className="text-gray-400 text-sm mt-1">Provision fuel station accounts, update status, and manage distribution centers.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ stationId: generateNextStationId(), name: "", location: "", email: "" });
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
            {paginatedStations.map((s) => (
              <tr key={s.station_id} className="hover:bg-white/5 transition group">
                <td className="px-6 py-4 font-mono text-gray-400 text-sm">{s.station_id}</td>
                <td className="px-6 py-4 font-semibold text-fuchsia-100">{s.name || "Set Name"}</td>
                <td className="px-6 py-4 text-gray-300">{s.location || "Set Location"}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                    s.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"
                  }`}>
                    {s.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingStation(s);
                      setFormData({ name: s.name, location: s.location, email: s.email || "" });
                      setShowEditModal(true);
                    }}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition cursor-pointer"
                    aria-label="Edit station"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => toggleStatus(s.station_id, s.status, s.name)}
                    className={`p-2 rounded-lg transition cursor-pointer ${
                      s.status === "Active" ? "text-red-400 hover:bg-red-500/10" : "text-emerald-400 hover:bg-emerald-500/10"
                    }`}
                    aria-label="Toggle active status"
                  >
                    {s.status === "Active" ? <X size={18} /> : <Check size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Reusable Pagination Component */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalStations}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Station Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Station">
        <form onSubmit={handleAddStation} className="space-y-4">
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Location</label>
            <input 
              required 
              value={formData.location} 
              onChange={(e) => setFormData({ ...formData, location: e.target.value })} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Station Email</label>
            <input 
              type="email" 
              required 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500" 
            />
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 disabled:opacity-50 py-4 rounded-xl font-bold mt-2 shadow-lg shadow-fuchsia-500/20 transition cursor-pointer text-white"
          >
            {isSubmitting ? "Creating Station..." : "Create Station"}
          </button>
        </form>
      </Modal>

      {/* Edit Station Modal */}
      <Modal isOpen={showEditModal && !!editingStation} onClose={() => setShowEditModal(false)} title={`Edit Station: ${editingStation?.station_id}`}>
        {editingStation && (
          <form onSubmit={handleEditStation} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Station Name</label>
              <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Location</label>
              <input required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
            </div>
            <div className="flex gap-4 mt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition cursor-pointer text-white"
              >
                Update Station
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="flex-1 bg-red-500 hover:bg-red-600 py-4 rounded-xl font-bold shadow-lg shadow-red-500/20 transition cursor-pointer text-white"
              >
                Delete Station
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Station Confirmation Modal */}
      <Modal isOpen={showDeleteModal && !!editingStation} onClose={() => setShowDeleteModal(false)} title="Confirm Deletion">
        {editingStation && (
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-4 text-red-500">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Delete Station?</h3>
            <p className="text-gray-300 mb-6 text-sm">Are you sure you want to delete station <span className="text-fuchsia-400 font-bold">{editingStation.station_id}</span>? This action cannot be undone.</p>
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
                className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-bold shadow-lg shadow-red-500/20 transition cursor-pointer text-white"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reusable Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
