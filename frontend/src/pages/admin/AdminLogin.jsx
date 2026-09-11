import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5050").replace(/\/$/, "");
  const isLoginValid = username.trim() !== "" && password.trim() !== "" && !loading;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("admin_token", data.token);
        localStorage.setItem("admin_user", JSON.stringify(data.user));
        navigate("/admin/dashboard");
      } else {
        setError(data.message || "Invalid administrator credentials");
      }
    } catch (err) {
      setError("Network error. Please make sure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white px-4">
      <div className="relative w-[400px] max-w-md rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-white/10">

        {/* Close Button */}
        <button
          type="button"
          onClick={() => navigate("/", { replace: true })}
          className="absolute top-4 right-4 text-violet-400 hover:text-violet-300 transition cursor-pointer"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-600 bg-clip-text text-transparent">
            Admin Login
          </span>
        </h2>

        <form
          className="space-y-4"
          onSubmit={handleLogin}
        >
          {/* Username */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={!isLoginValid}
            className={`w-full py-3 rounded-lg font-semibold transition ${isLoginValid
              ? "bg-gradient-to-r from-purple-500 to-violet-600 cursor-pointer"
              : "bg-gray-500 cursor-not-allowed"
              }`}
          >
            Login
          </button>
        </form>

      </div>
    </div>
  );
}