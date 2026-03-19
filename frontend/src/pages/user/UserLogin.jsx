import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REQUEST_TIMEOUT_MS = 10000;

const fetchWithTimeout = async (url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
};

export default function UserLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const isValidEmail = EMAIL_REGEX.test(email.trim());
  const isOtpValid = otp.length === 4;

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleSendOtp = async () => {
    if (!isValidEmail || isSendingOtp) return;

    resetMessages();
    setIsSendingOtp(true);

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          type: "login",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to send OTP.");
        return;
      }

      setOtpSent(true);
      setSuccessMessage(data.message || "OTP sent successfully.");
    } catch (error) {
      if (error.name === "AbortError") {
        setErrorMessage("Server timeout. Please check backend connection and try again.");
      } else {
        setErrorMessage("Unable to connect to the server.");
      }
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleLogin = async () => {
    if (!isOtpValid || isVerifyingOtp) return;

    resetMessages();
    setIsVerifyingOtp(true);

    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          otp,
          type: "login",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid OTP.");
        return;
      }

      if (data.token) {
        localStorage.setItem("fuelpass_token", data.token);
      }

      if (data.user) {
        localStorage.setItem("fuelpass_user", JSON.stringify(data.user));
      }

      setSuccessMessage(data.message || "Login successful.");

      setTimeout(() => {
        navigate("/user/dashboard");
      }, 700);
    } catch (error) {
      if (error.name === "AbortError") {
        setErrorMessage("Server timeout. Please check backend connection and try again.");
      } else {
        setErrorMessage("Unable to connect to the server.");
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white px-4">
      <div className="relative w-[400px] max-w-md rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-white/10">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center">
          <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            User Login
          </span>
        </h2>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (otpSent) {
              handleLogin();
            } else {
              handleSendOtp();
            }
          }}
        >
          <div>
            <label className="block mb-2 text-sm text-gray-300">Email</label>

            <input
              type="email"
              placeholder="Ex: abc@gmail.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setOtpSent(false);
                setOtp("");
                resetMessages();
              }}
              className="w-full p-3 rounded-lg bg-white/10 border border-white/20 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          {!otpSent && (
            <button
              type="submit"
              disabled={!isValidEmail || isSendingOtp}
              className={`w-full py-3 rounded-lg font-semibold transition cursor-pointer ${
                isValidEmail && !isSendingOtp
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                  : "bg-gray-500 cursor-not-allowed"
              }`}
            >
              {isSendingOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          )}

          {otpSent && (
            <>
              <div>
                <label className="block mb-2 text-sm text-gray-300">OTP</label>

                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  maxLength={4}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    setOtp(value);
                    resetMessages();
                  }}
                  className="w-full p-3 rounded-lg bg-white/10 border border-white/20 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={!isOtpValid || isVerifyingOtp}
                className={`w-full py-3 rounded-lg font-semibold transition cursor-pointer ${
                  isOtpValid && !isVerifyingOtp
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                    : "bg-gray-500 cursor-not-allowed"
                }`}
              >
                {isVerifyingOtp ? "Verifying..." : "Login"}
              </button>

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp}
                className="w-full py-3 rounded-lg font-medium border border-white/20 bg-white/5 hover:bg-white/10 transition cursor-pointer"
              >
                {isSendingOtp ? "Resending..." : "Resend OTP"}
              </button>
            </>
          )}

          {errorMessage && (
            <p className="text-sm text-red-400 text-center">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="text-sm text-green-400 text-center">{successMessage}</p>
          )}
        </form>

        <p className="text-sm text-center mt-4">
          Don’t have an account?{" "}
          <Link to="/user/register" className="text-cyan-400 cursor-pointer">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}