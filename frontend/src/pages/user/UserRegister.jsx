import React, { useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserRegister() {
  const navigate = useNavigate();

  const [idType, setIdType] = useState("nic");
  const [nicOrPassport, setNicOrPassport] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [step, setStep] = useState(1);
  const [registrationToken, setRegistrationToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [nicExists, setNicExists] = useState(false);

  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8081").replace(/\/$/, "");

  const resetMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const [personalDetails, setPersonalDetails] = useState({
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
  });

  const [vehicleDetails, setVehicleDetails] = useState({
    vehicleLetters: "",
    vehicleNumbers: "",
    chassisNo: "",
    vehicleType: "",
    fuelType: "",
    model: "",
    color: "",
  });

  const isIdentityValid =
    idType === "nic"
      ? /^(?:\d{12}|\d{9}[VvXx])$/.test(nicOrPassport.trim())
      : nicOrPassport.trim().length >= 5;

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isOtpValid = otp.length === 4;

  const isPersonalValid =
    personalDetails.firstName.trim() &&
    personalDetails.lastName.trim() &&
    personalDetails.address.trim() &&
    personalDetails.phoneNumber.trim().length === 9;

  const isVehicleValid =
    vehicleDetails.vehicleLetters.trim().length >= 2 &&
    vehicleDetails.vehicleNumbers.trim().length >= 3 &&
    vehicleDetails.chassisNo.trim() &&
    vehicleDetails.vehicleType.trim() &&
    vehicleDetails.fuelType.trim();

  const handleSendOtp = async () => {
    if (!isIdentityValid || !isEmailValid || isLoading || nicExists) return;

    resetMessages();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), type: "register" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Failed to send OTP.");
        return;
      }

      setOtpSent(true);
      setSuccessMessage(data.message || "OTP sent successfully.");
    } catch (error) {
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!isOtpValid || isLoading) return;

    resetMessages();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp, type: "register" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Invalid OTP.");
        return;
      }

      setRegistrationToken(data.registrationToken || "");
      setVerified(true);
      setStep(1);
      setSuccessMessage("OTP verified successfully.");
    } catch (error) {
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setPersonalDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVehicleChange = (e) => {
    const { name, value } = e.target;
    setVehicleDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (!isPersonalValid) return;
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!isVehicleValid || isLoading) return;

    resetMessages();
    setIsLoading(true);

    try {
      const finalData = {
        idType,
        nicOrPassport,
        email: email.trim(),
        personalDetails: {
          ...personalDetails,
          phoneNumber: `+94${personalDetails.phoneNumber.trim()}`,
        },
        vehicleDetails: {
          ...vehicleDetails,
          vehicleNumber: `${vehicleDetails.vehicleLetters} ${vehicleDetails.vehicleNumbers}`,
        },
        registrationToken,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || "Registration failed.");
        return;
      }

      if (data.token) {
        localStorage.setItem("fuelpass_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("fuelpass_user", JSON.stringify(data.user));
      }

      setSuccessMessage("Registration successful. Redirecting...");
      setTimeout(() => {
        navigate("/user/dashboard");
      }, 1000);
    } catch (error) {
      setErrorMessage("Unable to connect to the server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-white px-4 py-8">
      <div className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-xl p-8 border border-white/10">
        <button
          type="button"
          onClick={() => navigate("/user/login")}
          className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
        >
          <X size={20} strokeWidth={3} />
        </button>

        {verified && step === 2 && (
          <button
            type="button"
            onClick={handleBack}
            className="absolute top-5 left-5 text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
          >
            <ArrowLeft size={28} strokeWidth={2.5} />
          </button>
        )}

        <h2 className="text-3xl font-bold mb-6 text-center">Register</h2>

        {errorMessage && (
          <div className="mb-4 rounded-lg bg-red-500/20 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-lg bg-green-500/20 px-4 py-3 text-sm text-green-300">
            {successMessage}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          {!verified && (
            <>
              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  ID Type and Number
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={idType === "nic" ? "Ex: 67889012V" : "Ex: N1234567"}
                    value={nicOrPassport}
                    onChange={(e) => {
                      setNicOrPassport(e.target.value);
                      setNicExists(false);
                      resetMessages();
                    }}
                    onBlur={async () => {
                      if (idType === "nic" && isIdentityValid) {
                        try {
                          const response = await fetch(`${API_BASE_URL}/api/auth/check-nic`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ nic: nicOrPassport.trim() }),
                          });
                          const data = await response.json();
                          if (data.exists) {
                            setNicExists(true);
                            const msg = data.email 
                              ? `This NIC is already registered in ${data.email}`
                              : (data.message || "This NIC is already registered");
                            setErrorMessage(msg);
                          }
                        } catch (err) {
                          console.error("NIC check failed", err);
                        }
                      }
                    }}
                    className={`w-[250px] rounded-lg border px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 transition ${nicExists ? "border-red-500 focus:ring-red-500 bg-red-500/5" : "border-white/20 bg-white/10 focus:ring-cyan-500"
                      }`}
                  />

                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-[150px] rounded-lg border border-white/20 bg-white/10 px-2 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="nic" className="text-black">
                      NIC
                    </option>
                    <option value="passport" className="text-black">
                      Passport
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Ex: abc@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isIdentityValid || !isEmailValid || isLoading || nicExists}
                  className={`w-full py-3 rounded-lg font-semibold transition ${isIdentityValid && isEmailValid && !isLoading && !nicExists
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer"
                    : "bg-gray-500/70 cursor-not-allowed opacity-50"
                    }`}
                >
                  {isLoading ? "Sending..." : "Send OTP"}
                </button>
              )}

              {otpSent && (
                <>
                  <div>
                    <label className="block mb-2 text-sm text-gray-300">
                      OTP
                    </label>

                    <input
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      maxLength={4}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!isOtpValid || isLoading}
                    className={`w-full py-3 rounded-lg font-semibold transition ${isOtpValid && !isLoading
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer"
                      : "bg-gray-500/70 cursor-not-allowed"
                      }`}
                  >
                    {isLoading ? "Verifying..." : "Verify"}
                  </button>
                </>
              )}
            </>
          )}

          {verified && step === 1 && (
            <>
              <div className="rounded-lg bg-green-500/20 border border-green-400/30 px-4 py-3 text-sm text-green-300">
                Email verified successfully
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={personalDetails.firstName}
                  onChange={handlePersonalChange}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={personalDetails.lastName}
                  onChange={handlePersonalChange}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={personalDetails.address}
                  onChange={handlePersonalChange}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Phone Number
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400 font-medium">+94</span>
                  <input
                    type="text"
                    name="phoneNumber"
                    placeholder="771234567"
                    maxLength={9}
                    value={personalDetails.phoneNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      // Prevent leading 0 if possible (or just handle it)
                      const finalValue = value.startsWith("0") ? value.substring(1) : value;
                      if (finalValue.length <= 9) {
                        setPersonalDetails((prev) => ({
                          ...prev,
                          phoneNumber: finalValue,
                        }));
                      }
                    }}
                    className="w-full rounded-lg border border-white/20 bg-white/10 pl-14 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500 placeholder:text-gray-500/50"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!isPersonalValid}
                className={`w-full py-3 rounded-lg font-semibold transition ${isPersonalValid
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer"
                  : "bg-gray-500/70 cursor-not-allowed"
                  }`}
              >
                Next
              </button>
            </>
          )}

          {verified && step === 2 && (
            <>
              <div className="rounded-lg bg-cyan-500/10 border border-cyan-400/20 px-4 py-3 text-sm text-cyan-300">
                Enter vehicle details
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Vehicle Number
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    name="vehicleLetters"
                    placeholder="ABC"
                    maxLength={3}
                    value={vehicleDetails.vehicleLetters}
                    onChange={(e) =>
                      setVehicleDetails((prev) => ({
                        ...prev,
                        vehicleLetters: e.target.value
                          .replace(/[^A-Za-z]/g, "")
                          .toUpperCase(),
                      }))
                    }
                    className="w-1/2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-500"
                  />

                  <input
                    type="text"
                    name="vehicleNumbers"
                    placeholder="8895"
                    maxLength={4}
                    value={vehicleDetails.vehicleNumbers}
                    onChange={(e) =>
                      setVehicleDetails((prev) => ({
                        ...prev,
                        vehicleNumbers: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                    className="w-1/2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Chassis Number
                </label>
                <input
                  type="text"
                  placeholder="Ex: ME35WQ..."
                  name="chassisNo"
                  value={vehicleDetails.chassisNo}
                  onChange={handleVehicleChange}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={vehicleDetails.vehicleType}
                  onChange={handleVehicleChange}
                  className="w-full rounded-lg border border-white/20 bg-[#1E293B] px-4 py-3 text-white outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="" className="text-gray-400">
                    Select Vehicle Type
                  </option>
                  <option value="bike" className="text-white">
                    Bike
                  </option>
                  <option value="threewheeler" className="text-white">
                    Three Wheeler
                  </option>
                  <option value="car" className="text-white">
                    Car
                  </option>
                  <option value="van" className="text-white">
                    Van
                  </option>
                  <option value="bus" className="text-white">
                    Bus
                  </option>
                  <option value="lorry" className="text-white">
                    Lorry
                  </option>
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm text-gray-300">
                  Fuel Type
                </label>
                <select
                  name="fuelType"
                  value={vehicleDetails.fuelType}
                  onChange={handleVehicleChange}
                  className="w-full rounded-lg border border-white/20 bg-[#1E293B] px-4 py-3 text-white outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="" className="text-gray-400">
                    Select Fuel Type
                  </option>
                  <option value="petrol92" className="text-white">
                    Petrol 92
                  </option>
                  <option value="petrol95" className="text-white">
                    Petrol 95
                  </option>
                  <option value="diesel" className="text-white">
                    Diesel
                  </option>
                  <option value="superdiesel" className="text-white">
                    Super Diesel
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={!isVehicleValid || isLoading}
                className={`w-full py-3 rounded-lg font-semibold transition ${isVehicleValid && !isLoading
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer hover:shadow-lg hover:shadow-cyan-500/20"
                  : "bg-gray-500/70 cursor-not-allowed opacity-70"
                  }`}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}