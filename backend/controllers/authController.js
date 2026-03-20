const { sendOtpEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const {
  deleteOtpsByEmail,
  createOtp,
  findValidOtp,
  deleteOtpById,
} = require("../models/otpModel");
const { 
  findOrCreateUserByEmail,
  getUserWithVehicleAndQuota,
  findUserByNic,
  updateVehicleDetails,
  setFuelReservation
} = require("../models/userModel");
const { findStationById } = require("../models/stationModel");

const getDbErrorMessage = (error) => {
  if (!error) return "Unknown error";
  
  if (error.code === "EAUTH") {
    return "Mail authentication failed. Check EMAIL_USER and EMAIL_PASS in .env.";
  }

  if (error.code === "ESOCKET" || error.code === "ETIMEDOUT") {
    return "Network error. Please check your internet connection.";
  }

  if (!error.code) {
    return "Internal server error";
  }

  if (error.code === "ER_ACCESS_DENIED_ERROR") {
    return "Database auth failed. Check DB_USER and DB_PASSWORD in backend/.env.";
  }

  if (error.code === "ER_BAD_DB_ERROR") {
    return "Database not found. Create DB_NAME in MySQL first.";
  }

  if (error.code === "PROTOCOL_CONNECTION_LOST" || error.code === "ETIMEDOUT") {
    return "Database connection timeout. Check MySQL service status.";
  }

  return "Database error: " + error.code;
};

const sendOtp = async (req, res) => {
  const { email } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  try {
    await deleteOtpsByEmail(normalizedEmail);
    await createOtp(normalizedEmail, otp, expiresAt);
    await sendOtpEmail(normalizedEmail, otp);

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOtp Error:", error);
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const otpRow = await findValidOtp(normalizedEmail, otp);

    if (!otpRow) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await deleteOtpById(otpRow.id);
    const user = await findOrCreateUserByEmail(normalizedEmail);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`OTP verified and user ${user.id} logged in`);
    return res.json({
      message: "OTP verified successfully",
      token,
      user,
      registrationToken: normalizedEmail,
    });
  } catch (error) {
    console.error("verifyOtp Error:", error);
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const getMe = async (req, res) => {
  try {
    const userData = await getUserWithVehicleAndQuota(req.user.userId);

    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user: userData });
  } catch (error) {
    console.error("getMe Error:", error);
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const register = async (req, res) => {
  const { registrationToken, personalDetails, vehicleDetails, nicOrPassport } = req.body;
  const email = registrationToken;

  try {
    const userId = await createUserWithDetails({
      nic: nicOrPassport,
      firstName: personalDetails.firstName,
      lastName: personalDetails.lastName,
      address: personalDetails.address,
      phoneNumber: personalDetails.phoneNumber,
      email: email,
    });

    await createVehicle({
      userId,
      vehicleNumber: vehicleDetails.vehicleNumber,
      chassisNo: vehicleDetails.chassisNo,
      vehicleType: vehicleDetails.vehicleType,
      fuelType: vehicleDetails.fuelType,
    });

    return res.json({ message: "Registration successful" });
  } catch (error) {
    console.error("register Error:", error);
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const stationLogin = async (req, res) => {
  const { stationId, password } = req.body;

  if (stationId === "station1" && password === "12345") {
    return res.json({
      message: "Login successful",
      station: { station_id: "station1", name: "Station 1" },
      token: "mock-token-for-station",
    });
  }

  try {
    const station = await findStationById(stationId);
    if (station && station.password === password) {
      return res.json({
        message: "Login successful",
        station,
        token: "mock-token-for-station",
      });
    }
    return res.status(401).json({ message: "Invalid credentials" });
  } catch (error) {
    console.error("stationLogin Error:", error);
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const checkNic = async (req, res) => {
  const { nic } = req.body;
  if (!nic) return res.status(400).json({ message: "NIC is required" });

  try {
    const user = await findUserByNic(nic);
    if (user) {
      return res.json({ exists: true, message: "This NIC is already registered." });
    }
    return res.json({ exists: false });
  } catch (error) {
    console.error("checkNic Error:", error);
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const updateVehicle = async (req, res) => {
  const { vehicleNumber, chassisNo, vehicleType, fuelType } = req.body;
  const userId = req.user.userId;

  try {
    await updateVehicleDetails(userId, {
      vehicleNumber,
      chassisNo,
      vehicleType,
      fuelType,
    });
    return res.json({ message: "Vehicle details updated successfully" });
  } catch (error) {
    console.error("updateVehicle Error:", error);
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const reserveFuel = async (req, res) => {
  const { reservedUntil } = req.body;
  const userId = req.user.userId;

  try {
    await setFuelReservation(userId, reservedUntil);
    return res.json({ message: "Fuel reserved successfully" });
  } catch (error) {
    console.error("reserveFuel Error:", error);
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getMe,
  register,
  stationLogin,
  checkNic,
  updateVehicle,
  reserveFuel,
};
