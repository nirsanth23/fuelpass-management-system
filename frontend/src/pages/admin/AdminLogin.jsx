import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const isLoginValid = username.trim() !== "" && password.trim() !== "";

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (username === "admin" && password === "admin123") {
      navigate("/admin/dashboard");
    } else {
      setError("Invalid username or password");
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
          Admin Login
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