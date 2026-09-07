import React, { useState, useEffect } from "react";
import { Fuel, Edit, X, Check, Calendar, Droplets, Eye, Search, ChevronLeft, ChevronRight } from "lucide-react";

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
    last_supplied_date: '', 
    last_supplied_petrol: 0, 
    last_supplied_diesel: 0 
  });
  const [toast, setToast] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  const fetchStations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations`);
      const data = await response.json();
      if (response.ok) setStations(data);
    } catch (err) { console.error("Failed to fetch stations", err); }
  };

  const fetchHistory = async (stationId) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${stationId}/history`);
      if (response.ok) {
        const data = await response.json();
        setSupplyHistory(data || []);
      }
    } catch (err) { console.error("Failed to fetch history", err); }
    finally { setLoadingHistory(false); }
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

  const filteredStations = stations.filter(s => 
    s.station_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalStations = filteredStations.length;
  const totalPages = Math.ceil(totalStations / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedStations = filteredStations.slice(startIndex, startIndex + rowsPerPage);

  const handleUpdateSupply = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stations/${editingStation.station_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setToast({ type: 'success', title: 'Supply Updated', message: `Stock levels for ${editingStation.name || editingStation.station_id} updated.` });
        setShowEditModal(false);
        setEditingStation(null);
        fetchStations();
      }
    } catch (err) { console.error("Update failed", err); }
  };

  return (
    <div className="p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <h2 className="text-3xl font-bold">Station Fuel Supply</h2>
        
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-fuchsia-500" />
          <input 
            type="text" 
            placeholder="Search by ID or Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-fuchsia-500 rounded-2xl pl-12 pr-4 py-3 focus:outline-none focus:border-fuchsia-500 transition shadow-inner"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-5 duration-500 overflow-x-auto">
        <table className="w-full text-left min-w-[1000px]">
          <thead>
            <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest border-b border-white/10">
              <th className="px-6 py-5">Station</th>
              <th className="px-6 py-5 text-fuchsia-400">Petrol Stock</th>
              <th className="px-6 py-5 text-blue-400">Diesel Stock</th>
              <th className="px-6 py-5">Last Supply</th>
              <th className="px-6 py-5 text-gray-300">Petrol Supplied</th>
              <th className="px-6 py-5 text-gray-300">Diesel Supplied</th>
              <th className="px-6 py-5">Status</th>
              <th className="px-6 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {paginatedStations.map(s => (
              <tr key={s.station_id} className="hover:bg-white/5 transition group">
                <td className="px-6 py-4 min-w-[200px]">
                  <p className="font-semibold text-white">{s.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{s.station_id}</p>
                </td>
                <td className="px-6 py-4 font-mono text-fuchsia-300 text-sm">{s.petrol_stock}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
                <td className="px-6 py-4 font-mono text-blue-300 text-sm">{s.diesel_stock}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
                <td className="px-6 py-4 text-xs text-gray-400">
                  {s.last_supplied_date ? new Date(s.last_supplied_date).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 font-mono text-fuchsia-200/50 text-xs">{s.last_supplied_petrol || 0}<span className="text-[8px] opacity-50 ml-0.5">L</span></td>
                <td className="px-6 py-4 font-mono text-blue-200/50 text-xs">{s.last_supplied_diesel || 0}<span className="text-[8px] opacity-50 ml-0.5">L</span></td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${s.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">{s.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-1">
                  <button 
                    onClick={() => {
                        setHistoryStation(s);
                        setHistoryCurrentPage(1);
                        fetchHistory(s.station_id);
                        setShowHistoryModal(true);
                    }}
                    className="p-2 text-fuchsia-400 hover:bg-fuchsia-500/10 rounded-lg transition cursor-pointer"
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => {
                        setEditingStation(s);
                        setFormData({
                            petrol_stock: s.petrol_stock,
                            diesel_stock: s.diesel_stock,
                            last_supplied_date: s.last_supplied_date ? new Date(s.last_supplied_date).toISOString().split('T')[0] : '',
                            last_supplied_petrol: s.last_supplied_petrol,
                            last_supplied_diesel: s.last_supplied_diesel
                        });
                        setShowEditModal(true);
                    }}
                    className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition cursor-pointer"
                  >
                    <Edit size={18} />
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

      {/* Edit Supply Modal */}
      {showEditModal && editingStation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#16213A] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-xl font-bold text-blue-400">Manage Supply</h3>
                <p className="text-xs text-gray-400 mt-1">{editingStation.name} ({editingStation.station_id})</p>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-gray-500 hover:text-white transition cursor-pointer"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleUpdateSupply} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-fuchsia-400 border-b border-white/5 pb-2">Current Stock</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Petrol Stock (L)</label>
                    <input type="number" required value={formData.petrol_stock} onChange={e => setFormData({...formData, petrol_stock: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-fuchsia-500 transition text-sm font-mono"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Diesel Stock (L)</label>
                    <input type="number" required value={formData.diesel_stock} onChange={e => setFormData({...formData, diesel_stock: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition text-sm font-mono"/>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-emerald-400 border-b border-white/5 pb-2">Last Delivery</h4>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Petrol Supplied (L)</label>
                    <input type="number" required value={formData.last_supplied_petrol} onChange={e => setFormData({...formData, last_supplied_petrol: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition text-sm font-mono"/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase">Diesel Supplied (L)</label>
                    <input type="number" required value={formData.last_supplied_diesel} onChange={e => setFormData({...formData, last_supplied_diesel: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-emerald-500 transition text-sm font-mono"/>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-widest">Supply Date</label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-4 top-3 text-gray-400" />
                  <input type="date" required value={formData.last_supplied_date} onChange={e => setFormData({...formData, last_supplied_date: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-2.5 focus:outline-none focus:border-white/30 transition text-sm"/>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 py-4 rounded-xl font-bold mt-4 shadow-xl shadow-blue-500/20 transition cursor-pointer flex items-center justify-center gap-2">
                <Check size={20} /> Update Station Supply
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyStation && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#16213A] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-xl font-bold text-fuchsia-400 font-inter">Supply History</h3>
                <p className="text-xs text-gray-400 mt-1">{historyStation.name} ({historyStation.station_id})</p>
              </div>
              <button 
                onClick={() => setShowHistoryModal(false)} 
                className="p-2 text-gray-500 hover:text-white transition cursor-pointer"
              >
                <X size={20}/>
              </button>
            </div>
            
            <div className="p-6">
              {loadingHistory ? (
                <div className="flex justify-center p-10"><Fuel className="animate-spin text-fuchsia-500" /></div>
              ) : supplyHistory.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 italic">No supply records found for this station.</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto min-h-[220px]">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-gray-500 border-b border-white/5">
                          <th className="px-4 py-2">Date & Time</th>
                          <th className="px-4 py-2 text-right text-fuchsia-400">Petrol (L)</th>
                          <th className="px-4 py-2 text-right text-blue-400">Diesel (L)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const startIdx = (historyCurrentPage - 1) * historyRowsPerPage;
                          return supplyHistory.slice(startIdx, startIdx + historyRowsPerPage).map(h => (
                            <tr key={h.id} className="bg-white/5 hover:bg-white/10 transition group">
                              <td className="px-4 py-3 text-xs text-gray-300 rounded-l-xl">
                                {new Date(h.supplied_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-fuchsia-300 text-sm">{Number(h.petrol_amount).toFixed(2)}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
                              <td className="px-4 py-3 text-right font-mono text-blue-300 text-sm rounded-r-xl">{Number(h.diesel_amount).toFixed(2)}<span className="text-[10px] opacity-50 ml-0.5">L</span></td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>

                  {/* History Pagination Bar */}
                  {(() => {
                    const totalHistory = supplyHistory.length;
                    const totalHistoryPages = Math.ceil(totalHistory / historyRowsPerPage) || 1;
                    const startIdx = (historyCurrentPage - 1) * historyRowsPerPage;

                    return (
                      <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs mt-3">
                        <div className="flex flex-wrap items-center gap-2 text-gray-400">
                          <span>Rows:</span>
                          <select
                            value={historyRowsPerPage}
                            onChange={(e) => {
                              setHistoryRowsPerPage(Number(e.target.value));
                              setHistoryCurrentPage(1);
                            }}
                            className="bg-[#0B1220] border border-white/10 rounded-lg px-2 py-1 text-white outline-none focus:border-fuchsia-500 cursor-pointer"
                          >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                          </select>
                          <span className="text-gray-400">
                            Showing {totalHistory === 0 ? 0 : startIdx + 1} - {Math.min(startIdx + historyRowsPerPage, totalHistory)} of {totalHistory}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setHistoryCurrentPage(p => Math.max(1, p - 1))}
                            disabled={historyCurrentPage === 1}
                            className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-semibold"
                          >
                            <ChevronLeft size={14} /> Prev
                          </button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalHistoryPages }, (_, i) => i + 1)
                              .filter(p => p === 1 || p === totalHistoryPages || (p >= historyCurrentPage - 1 && p <= historyCurrentPage + 1))
                              .map((p, idx, arr) => {
                                const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                                return (
                                  <React.Fragment key={p}>
                                    {showEllipsis && <span className="px-1 text-gray-500">...</span>}
                                    <button
                                      onClick={() => setHistoryCurrentPage(p)}
                                      className={`w-7 h-7 rounded-lg text-xs font-bold transition cursor-pointer ${
                                        historyCurrentPage === p
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
                            onClick={() => setHistoryCurrentPage(p => Math.min(totalHistoryPages, p + 1))}
                            disabled={historyCurrentPage === totalHistoryPages || totalHistory === 0}
                            className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer font-semibold"
                          >
                            Next <ChevronRight size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>
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
