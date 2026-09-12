import React, { useState, useEffect } from "react";
import { Fuel, Edit, Calendar, Droplets, Eye, Search } from "lucide-react";
import Modal from "../../components/common/Modal";
import Toast from "../../components/common/Toast";
import Pagination from "../../components/common/Pagination";

export default function StationSupply() {
  const [stations, setStations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingStation, setEditingStation] = useState(null);
  const [historyStation, setHistoryStation] = useState(null);
  const [supplyHistory, setSupplyHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyRowsPerPage, setHistoryRowsPerPage] = useState(5);
  const [formData, setFormData] = useState({ 
    petrol_stock: 0, 
    diesel_stock: 0, 
    last_supplied_date: "", 
    last_supplied_petrol: 0, 
    last_supplied_diesel: 0 
  });
  const [toast, setToast] = useState(null);

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

  const fetchHistory = async (stationId) => {
    setLoadingHistory(true);
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${stationId}/history`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (response.ok) {
        const data = await response.json();
        setSupplyHistory(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchStations();
  }, []);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${editingStation.station_id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setToast({ 
          type: "success", 
          title: "Stock & Supply Updated", 
          message: `Fuel levels updated for ${editingStation.name || editingStation.station_id}.` 
        });
        setShowEditModal(false);
        setEditingStation(null);
        fetchStations();
      }
    } catch (err) {
      console.error("Update failed", err);
      setToast({ type: "error", title: "Update Failed", message: "Failed to update station stock." });
    }
  };

  const filteredStations = stations.filter(s => 
    (s.station_id && s.station_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.location && s.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalFiltered = filteredStations.length;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedStations = filteredStations.slice(startIndex, startIndex + rowsPerPage);

  const totalHistory = supplyHistory.length;
  const historyStartIdx = (historyCurrentPage - 1) * historyRowsPerPage;
  const paginatedHistory = supplyHistory.slice(historyStartIdx, historyStartIdx + historyRowsPerPage);

  return (
    <div className="p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-3xl font-bold text-white">Fuel Stock & Supply Tracking</h2>
          <p className="text-gray-400 text-sm mt-1">Audit station reserves, dispatch records, and delivery history logs.</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search stations..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#16213A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500 transition"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-5 duration-500">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/10 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-5">Station</th>
                <th className="px-6 py-5">Location</th>
                <th className="px-6 py-5">Petrol Stock (L)</th>
                <th className="px-6 py-5">Diesel Stock (L)</th>
                <th className="px-6 py-5">Last Delivery Details</th>
                <th className="px-6 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedStations.map(s => {
                const isLowPetrol = Number(s.petrol_stock) <= 1000;
                const isLowDiesel = Number(s.diesel_stock) <= 1000;
                return (
                  <tr key={s.station_id} className="hover:bg-white/5 transition group">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{s.name || "Station"}</div>
                      <div className="font-mono text-xs text-gray-400">{s.station_id}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">{s.location || "N/A"}</td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Droplets size={16} className={isLowPetrol ? "text-red-400 animate-pulse" : "text-fuchsia-400"} />
                        <span className={`font-mono font-bold ${isLowPetrol ? "text-red-400" : "text-white"}`}>
                          {Number(s.petrol_stock || 0).toLocaleString()} L
                        </span>
                      </div>
                      {isLowPetrol && <span className="text-[10px] text-red-400 font-semibold uppercase">Low Petrol Stock</span>}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Droplets size={16} className={isLowDiesel ? "text-red-400 animate-pulse" : "text-blue-400"} />
                        <span className={`font-mono font-bold ${isLowDiesel ? "text-red-400" : "text-white"}`}>
                          {Number(s.diesel_stock || 0).toLocaleString()} L
                        </span>
                      </div>
                      {isLowDiesel && <span className="text-[10px] text-red-400 font-semibold uppercase">Low Diesel Stock</span>}
                    </td>

                    <td className="px-6 py-4">
                      {s.last_supplied_date ? (
                        <div className="text-xs">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Calendar size={13} className="text-gray-400" />
                            {new Date(s.last_supplied_date).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                          <div className="text-gray-400 font-mono text-[11px] mt-0.5">
                            P: <span className="text-fuchsia-400 font-bold">{Number(s.last_supplied_petrol || 0).toLocaleString()}L</span> | D: <span className="text-blue-400 font-bold">{Number(s.last_supplied_diesel || 0).toLocaleString()}L</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500 italic">No supply logged</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingStation(s);
                          setFormData({
                            petrol_stock: s.petrol_stock || 0,
                            diesel_stock: s.diesel_stock || 0,
                            last_supplied_date: s.last_supplied_date ? s.last_supplied_date.split("T")[0] : "",
                            last_supplied_petrol: s.last_supplied_petrol || 0,
                            last_supplied_diesel: s.last_supplied_diesel || 0
                          });
                          setShowEditModal(true);
                        }}
                        className="p-2 text-fuchsia-400 hover:bg-fuchsia-500/10 rounded-xl transition cursor-pointer"
                        title="Update Stock Levels"
                        aria-label="Update Stock Levels"
                      >
                        <Edit size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setHistoryStation(s);
                          fetchHistory(s.station_id);
                          setHistoryCurrentPage(1);
                          setShowHistoryModal(true);
                        }}
                        className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-xl transition cursor-pointer"
                        title="View Supply Batch History"
                        aria-label="View Supply History"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Reusable Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={totalFiltered}
          rowsPerPage={rowsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Update Stock Modal */}
      <Modal 
        isOpen={showEditModal && !!editingStation} 
        onClose={() => setShowEditModal(false)} 
        title={`Adjust Stock: ${editingStation?.name || editingStation?.station_id}`}
      >
        {editingStation && (
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Current Petrol (L)</label>
                <input 
                  type="number"
                  step="any"
                  required 
                  value={formData.petrol_stock} 
                  onChange={(e) => setFormData({ ...formData, petrol_stock: e.target.value })} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Current Diesel (L)</label>
                <input 
                  type="number"
                  step="any"
                  required 
                  value={formData.diesel_stock} 
                  onChange={(e) => setFormData({ ...formData, diesel_stock: e.target.value })} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4">
              <span className="block text-xs font-bold text-fuchsia-400 mb-3">Latest Delivery Information</span>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Delivery Date</label>
                  <input 
                    type="date" 
                    value={formData.last_supplied_date} 
                    onChange={(e) => setFormData({ ...formData, last_supplied_date: e.target.value })} 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Delivered Petrol (L)</label>
                    <input 
                      type="number" 
                      step="any"
                      value={formData.last_supplied_petrol} 
                      onChange={(e) => setFormData({ ...formData, last_supplied_petrol: e.target.value })} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500" 
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Delivered Diesel (L)</label>
                    <input 
                      type="number" 
                      step="any"
                      value={formData.last_supplied_diesel} 
                      onChange={(e) => setFormData({ ...formData, last_supplied_diesel: e.target.value })} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-fuchsia-500 hover:bg-fuchsia-600 py-3.5 rounded-xl font-bold mt-4 shadow-lg shadow-fuchsia-500/20 transition cursor-pointer text-white"
            >
              Save Stock Levels
            </button>
          </form>
        )}
      </Modal>

      {/* History Modal */}
      <Modal 
        isOpen={showHistoryModal && !!historyStation} 
        onClose={() => setShowHistoryModal(false)} 
        title={`Supply History: ${historyStation?.name || historyStation?.station_id}`}
        maxWidth="max-w-2xl"
      >
        {loadingHistory ? (
          <div className="flex justify-center py-10"><Fuel className="animate-spin text-fuchsia-500" size={32} /></div>
        ) : supplyHistory.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 italic text-sm">No supply logs recorded for this station yet.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto min-h-[220px]">
              <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-gray-400 border-b border-white/5">
                    <th className="px-4 py-2">Date & Time</th>
                    <th className="px-4 py-2 text-right text-fuchsia-400">Petrol (L)</th>
                    <th className="px-4 py-2 text-right text-blue-400">Diesel (L)</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedHistory.map((h) => (
                    <tr key={h.id} className="bg-white/5 hover:bg-white/10 transition group">
                      <td className="px-4 py-3 text-xs text-gray-300 rounded-l-xl">
                        {new Date(h.supplied_at).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-fuchsia-300 text-sm">{Number(h.petrol_amount).toFixed(2)}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
                      <td className="px-4 py-3 text-right font-mono text-blue-300 text-sm rounded-r-xl">{Number(h.diesel_amount).toFixed(2)}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sub-pagination for modal history */}
            <Pagination
              currentPage={historyCurrentPage}
              totalItems={totalHistory}
              rowsPerPage={historyRowsPerPage}
              onPageChange={setHistoryCurrentPage}
            />
          </div>
        )}
      </Modal>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
