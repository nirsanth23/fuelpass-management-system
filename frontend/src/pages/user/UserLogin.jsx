import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { X } from "lucide-react";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const navigate = useNavigate();

  const isValidEmail = email.endsWith("@gmail.com") && email.length > 10;
  const isOtpValid = otp.length === 4;

  const handleSendOtp = () => {
    if (!isValidEmail) return;
    setOtpSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white px-4">
      <div className="relative w-[400px] max-w-md rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-white/10">

        {/* Close Button */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
        >
          <X size={20} strokeWidth={3} />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-center">
          User Login
        </h2>

        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>

          {/* Email */}
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-lg bg-white/10 border border-white/20"
          />

          {/* SEND OTP */}
          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={!isValidEmail}
              className={`w-full py-3 rounded-lg font-semibold transition cursor-pointer
                ${
                  isValidEmail
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                    : "bg-gray-500 cursor-not-allowed"
                }`}
            >
              Send OTP
            </button>
          )}

          {/* OTP + LOGIN */}
          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                maxLength={4}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setOtp(value);
                }}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20"
              />

              <button
                type="button"
                disabled={!isOtpValid}
                className={`w-full py-3 rounded-lg font-semibold transition cursor-pointer
                  ${
                    isOtpValid
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600"
                      : "bg-gray-500 cursor-not-allowed"
                  }`}
              >
                Login
              </button>
            </>
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