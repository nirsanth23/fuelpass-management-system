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

  const isIdentityValid = nicOrPassport.trim().length >= 5;
  const isEmailValid = email.endsWith("@gmail.com") && email.length > 10;
  const isOtpValid = otp.length === 4;

  const isPersonalValid =
    personalDetails.firstName.trim() &&
    personalDetails.lastName.trim() &&
    personalDetails.address.trim() &&
    personalDetails.phoneNumber.trim();

  const isVehicleValid =
    vehicleDetails.vehicleLetters.trim().length >= 2 &&
    vehicleDetails.vehicleNumbers.trim().length >= 3 &&
    vehicleDetails.chassisNo.trim() &&
    vehicleDetails.vehicleType.trim() &&
    vehicleDetails.fuelType.trim();

  const handleSendOtp = () => {
    if (!isIdentityValid || !isEmailValid) return;
    setOtpSent(true);
  };

  const handleVerifyOtp = () => {
    if (!isOtpValid) return;
    setVerified(true);
    setStep(1);
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

  const handleRegister = (e) => {
    e.preventDefault();

    if (!isVehicleValid) return;

    const finalData = {
      idType,
      nicOrPassport,
      email,
      personalDetails,
      vehicleDetails: {
        ...vehicleDetails,
        vehicleNumber: `${vehicleDetails.vehicleLetters} ${vehicleDetails.vehicleNumbers}`,
      },
    };

    console.log("Register Data:", finalData);
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

        <form className="space-y-4" onSubmit={handleRegister}>
          {!verified && (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={idType === "nic" ? "Ex: 67889012V" : "Ex: N1234567"}
                  value={nicOrPassport}
                  onChange={(e) => setNicOrPassport(e.target.value)}
                  className="w-[250px] rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
                />

                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="w-[150px] rounded-lg border border-white/20 bg-white/10 px-2 py-3 text-white outline-none"
                >
                  <option value="nic" className="text-black">
                    NIC
                  </option>
                  <option value="passport" className="text-black">
                    Passport
                  </option>
                </select>
              </div>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
              />

              {!otpSent && (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={!isIdentityValid || !isEmailValid}
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    isIdentityValid && isEmailValid
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer"
                      : "bg-gray-500/70 cursor-not-allowed"
                  }`}
                >
                  Send OTP
                </button>
              )}

              {otpSent && (
                <>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    maxLength={4}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!isOtpValid}
                    className={`w-full py-3 rounded-lg font-semibold transition ${
                      isOtpValid
                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer"
                        : "bg-gray-500/70 cursor-not-allowed"
                    }`}
                  >
                    Verify
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

              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={personalDetails.firstName}
                onChange={handlePersonalChange}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={personalDetails.lastName}
                onChange={handlePersonalChange}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
              />

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={personalDetails.address}
                onChange={handlePersonalChange}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
              />

              <input
                type="text"
                name="phoneNumber"
                placeholder="Phone Number"
                value={personalDetails.phoneNumber}
                onChange={(e) =>
                  setPersonalDetails((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value.replace(/\D/g, ""),
                  }))
                }
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
              />

              <button
                type="button"
                onClick={handleNext}
                disabled={!isPersonalValid}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  isPersonalValid
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
                  className="w-1/2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
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
                  className="w-1/2 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
                />
              </div>

              <input
                type="text"
                name="chassisNo"
                placeholder="Chassis No"
                value={vehicleDetails.chassisNo}
                onChange={handleVehicleChange}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-gray-400 outline-none"
              />

              <select
                name="vehicleType"
                value={vehicleDetails.vehicleType}
                onChange={handleVehicleChange}
                className="w-full rounded-lg border border-white/20 bg-[#1E293B] px-4 py-3 text-white outline-none appearance-none cursor-pointer"
              >
                <option value="" className="text-gray-400">
                  Select Vehicle Type
                </option>
                <option value="motorcycle" className="text-white">
                  Motorcycle
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

              <select
                name="fuelType"
                value={vehicleDetails.fuelType}
                onChange={handleVehicleChange}
                className="w-full rounded-lg border border-white/20 bg-[#1E293B] px-4 py-3 text-white outline-none appearance-none cursor-pointer"
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

              <button
                type="submit"
                disabled={!isVehicleValid}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  isVehicleValid
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 cursor-pointer"
                    : "bg-gray-500/70 cursor-not-allowed"
                }`}
              >
                Register
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}