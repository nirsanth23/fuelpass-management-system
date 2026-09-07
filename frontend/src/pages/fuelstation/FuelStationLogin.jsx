import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Lock, Key, ShieldCheck, CheckCircle2, Eye, EyeOff, AlertCircle } from "lucide-react";

export default function FuelStationLogin() {
  const navigate = useNavigate();

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // First-Time Change Password State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [activeStationId, setActiveStationId] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Validation Rules for New Password
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-\+=~`\[\]\\\/]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isNewPasswordValid = hasMinLength && hasLetter && hasNumber && hasSpecial && passwordsMatch;

  const isLoginValid = username.trim() !== "" && password.trim() !== "";
  const isForgotValid =
    forgotUsername.trim() !== "" && email.includes("@") && phoneNumber.trim().length === 10;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/station-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stationId: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("stationToken", data.token);
        localStorage.setItem("stationId", data.stationId);

        if (data.mustChangePassword) {
          setActiveStationId(data.stationId);
          setShowChangePassword(true);
          setShowForgot(false);
        } else {
          navigate("/fuelstation/dashboard");
        }
      } else {
        setErrorMsg(data.message || "Invalid username or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!isNewPasswordValid) {
      setErrorMsg("Please satisfy all password security requirements.");
      return;
    }

    setIsLoading(true);
    const token = localStorage.getItem("stationToken");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/change-station-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg("Password updated successfully! Entering dashboard...");
        setTimeout(() => {
          navigate("/fuelstation/dashboard");
        }, 1200);
      } else {
        setErrorMsg(data.message || "Failed to update password. Please try again.");
      }
    } catch (error) {
      console.error("Change password error:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/notifications/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stationUsername: forgotUsername.trim(),
          stationName: username,
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.message || "Password reset request sent successfully!");
        setForgotUsername("");
        setUsername("");
        setEmail("");
        setPhoneNumber("");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setErrorMsg(data.message || "Failed to send password reset request.");
      }
    } catch (error) {
      console.error("Forgot password request error:", error);
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white px-4 py-8">
      <div className="relative w-full max-w-md rounded-3xl bg-[#16213A]/90 backdrop-blur-2xl p-8 border border-white/10 shadow-2xl transition-all duration-300">

        {/* Close Button */}
        {!showChangePassword && (
          <button
            type="button"
            onClick={() => navigate("/")}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition cursor-pointer p-1"
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        )}

        {/* 1. FIRST-TIME CHANGE PASSWORD VIEW */}
        {showChangePassword ? (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-orange-500/30 mx-auto mb-4 text-orange-400 shadow-lg shadow-orange-500/10">
              <ShieldCheck size={28} />
            </div>

            <h2 className="text-2xl font-bold text-center mb-1">
              <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-red-500 bg-clip-text text-transparent">
                First-Time Login
              </span>
            </h2>
            <p className="text-xs text-gray-400 text-left mb-5 leading-relaxed">
              Welcome, <strong className="text-orange-400 font-mono">{activeStationId}</strong>! Please replace your temporary password with a secure permanent password.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full p-3.5 pr-11 rounded-xl bg-white/5 border border-white/10 placeholder:text-gray-500 focus:outline-none focus:border-orange-500 text-sm font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition cursor-pointer p-1"
                  >
                    {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    required
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrorMsg("");
                    }}
                    className="w-full p-3.5 pr-11 rounded-xl bg-white/5 border border-white/10 placeholder:text-gray-500 focus:outline-none focus:border-orange-500 text-sm font-medium transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition cursor-pointer p-1"
                  >
                    {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Brief Password Helper Text */}
              <p className="text-[11px] text-gray-400 text-left px-0.5">
                Password must be at least 6 characters with letters, numbers, and a special character.
              </p>

              <button
                type="submit"
                disabled={!isNewPasswordValid || isLoading}
                className={`w-full py-3.5 rounded-xl font-bold transition shadow-lg cursor-pointer text-sm ${
                  isNewPasswordValid && !isLoading
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/25"
                    : "bg-white/10 text-gray-500 opacity-60 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Saving Password..." : "Save Password & Enter Dashboard"}
              </button>
            </form>
          </div>
        ) : !showForgot ? (
          /* 2. REGULAR LOGIN SECTION */
          <>
            <h2 className="text-3xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-red-600 bg-clip-text text-transparent">
                Station Login
              </span>
            </h2>

            {errorMsg && (
              <p className="text-sm text-red-400 text-center mb-4">{errorMsg}</p>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Station ID
                </label>
                <input
                  placeholder="e.g. ST001"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 placeholder:text-gray-500 focus:outline-none focus:border-orange-500 text-sm transition"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 placeholder:text-gray-500 focus:outline-none focus:border-orange-500 text-sm transition"
                />
              </div>

              <button
                disabled={!isLoginValid || isLoading}
                className={`w-full py-3.5 rounded-xl font-bold transition shadow-lg cursor-pointer text-sm ${
                  isLoginValid && !isLoading
                    ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/20"
                    : "bg-white/10 text-gray-500 opacity-60 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Signing in..." : "Login"}
              </button>
            </form>

            <p className="text-sm text-center mt-5">
              <button
                onClick={() => {
                  setShowForgot(true);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-orange-400 hover:text-orange-300 transition cursor-pointer text-xs font-semibold"
              >
                Forgot Password?
              </button>
            </p>
          </>
        ) : (
          /* 3. FORGOT PASSWORD SECTION */
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">
              <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-red-600 bg-clip-text text-transparent">
                Request Password Reset
              </span>
            </h2>

            <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-400/20 text-xs text-yellow-200 leading-relaxed">
              Submit your station details. The Admin will review and send a new password to your email.
            </div>

            {errorMsg && (
              <p className="text-sm text-red-400 text-center mb-4">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-sm text-green-400 text-center mb-4">{successMsg}</p>
            )}

            <form className="space-y-4" onSubmit={handleForgot}>
              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Station ID
                </label>
                <input
                  placeholder="e.g. ST001"
                  value={forgotUsername}
                  onChange={(e) => {
                    setForgotUsername(e.target.value);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 placeholder:text-gray-500 focus:outline-none focus:border-orange-500 text-sm transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Registered Email
                </label>
                <input
                  type="email"
                  placeholder="station@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 placeholder:text-gray-500 focus:outline-none focus:border-orange-500 text-sm transition"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="07XXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhoneNumber(onlyNums);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 placeholder:text-gray-500 focus:outline-none focus:border-orange-500 text-sm transition font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={!isForgotValid || isLoading}
                className={`w-full py-3.5 rounded-xl font-bold transition shadow-lg cursor-pointer text-sm ${
                  isForgotValid && !isLoading
                    ? "bg-gradient-to-r from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600 text-white shadow-orange-500/20"
                    : "bg-white/10 text-gray-500 opacity-60 cursor-not-allowed"
                }`}
              >
                {isLoading ? "Sending..." : "Send Request"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgot(false);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="w-full text-xs text-gray-400 hover:text-orange-400 transition cursor-pointer font-semibold py-1"
              >
                ← Back to Login
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}