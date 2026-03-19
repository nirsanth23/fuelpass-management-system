import React, { useState, useEffect } from "react";
import { LogOut, Bell, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notifications`);
      const data = await response.json();
      if (response.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 6000);
  };

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
        showToast("success", "Password Reset Successful", `Generated password is ${data.newPassword}. An email has been successfully sent to ${notification.email}.`);
        setShowNotifications(false); // Close dropdown on success
        fetchNotifications();
      } else {
        showToast("error", "Error", data.message);
      }
    } catch (err) {
      showToast("error", "Network Error", "Failed to communicate with the server.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>

          <div className="flex items-center gap-4">

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 bg-white/5 hover:bg-white/10 rounded-full transition cursor-pointer"
              >
                <Bell size={20} className="text-gray-300" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-[#16213A] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                  <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
                    <h3 className="font-semibold text-fuchsia-300">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-white cursor-pointer"><X size={16} /></button>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 text-sm">No new requests</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold px-2 py-1 bg-fuchsia-500/20 text-fuchsia-300 rounded">
                              {n.type === 'forgot_password' ? 'Password Reset' : 'Alert'}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-sm font-semibold">{n.station_username}</p>
                          <p className="text-xs text-gray-400 mt-1">Email: {n.email}</p>
                          <p className="text-xs text-gray-400">Phone: {n.phone_number}</p>

                          <button
                            onClick={() => handleApprove(n)}
                            disabled={loadingId === n.id}
                            className={`mt-3 w-full py-2 text-sm font-semibold rounded flex items-center justify-center gap-2 transition ${loadingId === n.id
                              ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                              : "bg-fuchsia-500 hover:bg-fuchsia-600 text-white cursor-pointer"
                              }`}
                          >
                            {loadingId === n.id ? "Sending..." : <><Check size={14} /> Approve & Send Password</>}
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/admin/login", { replace: true })}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-fuchsia-300 hover:text-fuchsia-200 transition px-4 py-2 rounded-lg cursor-pointer"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2 text-fuchsia-300">Total Users</h3>
            <p className="text-4xl font-bold">1,245</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2 text-fuchsia-300">Fuel Stations</h3>
            <p className="text-4xl font-bold">42</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl">
            <h3 className="text-xl font-semibold mb-2 text-fuchsia-300">System Status</h3>
            <p className="text-4xl font-bold text-green-400">Online</p>
          </div>
        </div>
      </div>

      {/* Toast Notification overlay */}
      {toast && (
        <div className={`fixed bottom-8 right-8 max-w-sm p-4 rounded-xl shadow-2xl border flex items-start gap-4 z-[100] animate-in slide-in-from-bottom-5 duration-300 ${toast.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
          <div className="mt-0.5">
            {toast.type === 'success' ? <Check size={24} /> : <X size={24} />}
          </div>
          <div>
            <h4 className="font-bold text-lg mb-1">{toast.title}</h4>
            <p className="text-sm opacity-90 leading-relaxed">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="opacity-50 hover:opacity-100 transition absolute top-4 right-4 cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

    </div>
  );
}
