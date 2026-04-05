import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function FuelStationLogin() {
  const navigate = useNavigate();

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  // Login State
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Forgot Password State
  const [showForgot, setShowForgot] = useState(false);
  const [forgotUsername, setForgotUsername] = useState("");
  const [email, setEmail] = useState(""); // Renamed from stationEmail for forgot password
  const [phoneNumber, setPhoneNumber] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isLoginValid = username.trim() !== "" && password.trim() !== "";
  const isForgotValid =
    forgotUsername.trim() !== "" && email.includes("@") && phoneNumber.trim() !== "";

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/station-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stationId: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("stationToken", data.token);
        localStorage.setItem("stationId", data.stationId);
        navigate("/fuelstation/dashboard");
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
          stationUsername: forgotUsername,
          stationName: username, // Assuming 'username' is used for station name in forgot form
          email: email,
          phoneNumber: phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(data.message || "Password reset request sent successfully!");
        // Optionally clear form fields or navigate
        setForgotUsername("");
        setUsername(""); // Clear station name field
        setEmail("");
        setPhoneNumber("");
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
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white px-4">
      <div className="relative w-[400px] max-w-md rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-white/10">

        {/* Close Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-orange-400 hover:text-orange-300 cursor-pointer"
        >
          <X size={20} strokeWidth={3} />
        </button>

        {/* CONDITIONAL RENDER */}
        {!showForgot ? (
          <>
            {/* LOGIN SECTION */}
            <h2 className="text-3xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-red-600 bg-clip-text text-transparent">
                Station Login
              </span>
            </h2>

            {errorMsg && !showForgot && (
              <p className="text-sm text-red-400 text-center mb-4">{errorMsg}</p>
            )}

            <form className="space-y-4" onSubmit={handleLogin}>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Station ID
                </label>
                <input
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 "
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg("");
                  }}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 "
                />
              </div>

              <button
                disabled={!isLoginValid}
                className={`w-full py-3 rounded-lg font-semibold cursor-pointer ${isLoginValid
                  ? "bg-gradient-to-r from-orange-500 to-red-500"
                  : "bg-gray-500"
                  }`}
              >
                Login
              </button>
            </form>

            <p className="text-sm text-center mt-4">
              <button
                onClick={() => {
                  setShowForgot(true);
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-orange-400 cursor-pointer"
              >
                Forgot Password?
              </button>
            </p>
          </>
        ) : (
          <>
            {/* FORGOT PASSWORD SECTION */}
            <h2 className="text-2xl font-bold mb-4 text-center">
              <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-red-600 bg-clip-text text-transparent">
                Request Password Reset
              </span>
            </h2>

            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-400/20 text-sm text-yellow-200">
              Submit your details. Admin will reset and send new password.
            </div>

            {errorMsg && (
              <p className="text-sm text-red-400 text-center mb-4">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-sm text-green-400 text-center mb-4">{successMsg}</p>
            )}

            <form className="space-y-4" onSubmit={handleForgot}>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Station ID
                </label>
                <input
                  value={forgotUsername}
                  onChange={(e) => {
                    setForgotUsername(e.target.value);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Registered Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>

              <button
                type="submit"
                disabled={!isForgotValid || isLoading}
                className={`w-full py-3 rounded-lg font-semibold cursor-pointer ${isForgotValid && !isLoading
                    ? "bg-gradient-to-r from-orange-400 to-red-500 hover:shadow-lg hover:shadow-orange-500/20"
                    : "bg-gray-500 opacity-70 cursor-not-allowed"
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
                className="w-full text-sm text-gray-400 hover:text-orange-500 transition cursor-pointer"
              >
                Back to Login
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}