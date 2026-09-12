const jwt = require("jsonwebtoken");
const { sendOtpEmail } = require("../utils/sendEmail");
const {
  deleteOtpsByEmail,
  createOtp,
  findLatestActiveOtpByEmail,
  incrementFailedAttempts,
  deleteOtpById,
} = require("../models/otpModel");
const userModel = require("../models/userModel");
const stationModel = require("../models/stationModel");
const { hashPassword, comparePassword } = require("../utils/passwordHelper");
const { signFuelPass } = require("../utils/qrCrypto");
const { getDatabaseErrorMessage } = require("../utils/responseHelper");

/**
 * Dispatches an email OTP for Citizen login or registration
 * @route POST /api/auth/send-otp
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const sendOtp = async (req, res) => {
  const { email, type } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  try {
    // 1. Guard: Check if email is already registered with an active NIC
    if (type === "register") {
      const existingUser = await userModel.findUserByEmail(normalizedEmail);
      if (existingUser && existingUser.nic) {
        return res.status(400).json({ message: "This email is already registered" });
      }
    }

    // 2. Guard: Check if email exists for login
    if (type === "login") {
      const existingUser = await userModel.findUserByEmail(normalizedEmail);
      if (!existingUser) {
        return res.status(404).json({ message: "This email is not registered. Please register first." });
      }
    }

    await deleteOtpsByEmail(normalizedEmail);
    await createOtp(normalizedEmail, otp, expiresAt);
    await sendOtpEmail(normalizedEmail, otp);

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("sendOtp error:", error);
    return res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};

/**
 * Verifies OTP with 3-attempt brute force lockout protection
 * @route POST /api/auth/verify-otp
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const activeOtp = await findLatestActiveOtpByEmail(normalizedEmail);
    if (!activeOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new OTP." });
    }

    // Guard: Check 3-attempt lockout defense
    if (activeOtp.failed_attempts >= 3) {
      return res.status(429).json({
        message: "Too many incorrect attempts. This OTP has been locked for security. Please request a new OTP.",
      });
    }

    // Check OTP Match
    if (activeOtp.otp !== String(otp).trim()) {
      await incrementFailedAttempts(activeOtp.id);
      const remainingAttempts = 3 - (activeOtp.failed_attempts + 1);

      if (remainingAttempts <= 0) {
        return res.status(400).json({
          message: "Incorrect OTP. Maximum attempts exceeded (3/3). This OTP has been locked. Please request a new OTP.",
        });
      }

      return res.status(400).json({
        message: `Incorrect OTP. You have ${remainingAttempts} attempt(s) remaining.`,
      });
    }

    // Success: Clean up OTP and issue Citizen JWT
    await deleteOtpById(activeOtp.id);
    const user = await userModel.findOrCreateUserByEmail(normalizedEmail);

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: "citizen" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "OTP verified successfully",
      registrationToken: token,
      token,
      user,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};

/**
 * Retrieves Citizen profile, assigned vehicle quota, and digitally signed QR payload
 * @route GET /api/auth/me
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getMe = async (req, res) => {
  try {
    const { vehicleNumber } = req.query;
    const user = await userModel.getUserWithVehicleAndQuota(req.user.userId, vehicleNumber);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate tamper-proof cryptographic QR signature
    let qrSignature = null;
    let qrPayload = null;
    if (user.vehicle_number) {
      const payloadObj = {
        v: user.vehicle_number,
        n: user.nic,
        t: user.vehicle_type,
        f: user.fuel_type,
      };
      qrSignature = signFuelPass(payloadObj);
      qrPayload = JSON.stringify({ ...payloadObj, sig: qrSignature });
    }

    return res.json({
      user: {
        ...user,
        qrSignature,
        qrPayload,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};

/**
 * Completes Citizen vehicle registration
 * @route POST /api/auth/register
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const register = async (req, res) => {
  const { nicOrPassport, personalDetails, vehicleDetails, email: reqEmail } = req.body;
  try {
    const email = reqEmail.trim().toLowerCase();
    const existingUser = await userModel.findUserByEmail(email);

    if (!existingUser) {
      return res.status(400).json({ message: "Email verification required" });
    }

    const { firstName, lastName, address, phoneNumber } = personalDetails;
    const { vehicleNumber, chassisNo, vehicleType, fuelType } = vehicleDetails;

    await userModel.updateUserByEmail({
      nic: nicOrPassport,
      firstName,
      lastName,
      address,
      phoneNumber,
      email,
    });

    await userModel.createVehicle({
      userId: existingUser.id,
      vehicleNumber,
      chassisNo,
      vehicleType,
      fuelType,
    });

    const user = await userModel.findUserByEmail(email);
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: "citizen" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error:", error);
    if (error.code === "ER_DUP_ENTRY") {
      const msg = error.sqlMessage || "";
      if (msg.includes("users.email")) return res.status(400).json({ message: "This email is already registered" });
      if (msg.includes("users.nic")) return res.status(400).json({ message: "This NIC is already registered" });
      return res.status(400).json({ message: "This email or NIC is already registered" });
    }
    return res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};

/**
 * Authenticates Fuel Station Operator with bcrypt password comparison & auto-rehash
 * @route POST /api/auth/station-login
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const stationLogin = async (req, res) => {
  const { stationId, password } = req.body;
  try {
    const station = await stationModel.findStationById(stationId);
    if (!station) {
      return res.status(401).json({ message: "Invalid station credentials" });
    }

    const matchResult = await comparePassword(password, station.password);
    const isMatch = typeof matchResult === "object" ? matchResult.isMatch : Boolean(matchResult);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid station credentials" });
    }

    // Auto-migrate legacy plaintext password to secure bcrypt hash
    if (matchResult.needsRehash || (typeof station.password === "string" && !station.password.startsWith("$2"))) {
      const hashed = await hashPassword(password);
      await stationModel.updateStationPassword(station.station_id, hashed);
    }

    const token = jwt.sign(
      { userId: station.station_id, stationId: station.station_id, role: "station" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Station login successful",
      token,
      stationId: station.station_id,
      mustChangePassword: station.must_change_password === 1 || station.must_change_password === true,
      station,
    });
  } catch (error) {
    console.error("Station login error:", error);
    return res.status(500).json({ message: "Station login failed" });
  }
};

/**
 * Allows Station Operator to change temporary password
 * @route POST /api/auth/change-station-password
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const changeStationPassword = async (req, res) => {
  const stationId = req.user.stationId || req.user.userId;
  const { newPassword, confirmPassword } = req.body;

  if (!stationId) return res.status(401).json({ message: "Unauthorized station access." });
  if (!newPassword || !confirmPassword) return res.status(400).json({ message: "New password and confirm password are required." });
  if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match." });

  const hasLetter = /[a-zA-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-\+=~`\[\]\\\/]/.test(newPassword);

  if (newPassword.length < 6 || !hasLetter || !hasNumber || !hasSpecial) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long and include letters, numbers, and at least one special character (!@#$%^&* etc.).",
    });
  }

  try {
    const hashedPassword = await hashPassword(newPassword);
    const db = require("../config/db");
    await new Promise((resolve, reject) => {
      const query = "UPDATE fuel_stations SET password = ?, must_change_password = 0 WHERE station_id = ?";
      db.query(query, [hashedPassword, stationId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    return res.json({ message: "Password changed successfully! Welcome to FuelPass." });
  } catch (error) {
    console.error("changeStationPassword Error:", error);
    return res.status(500).json({ message: "Failed to update password." });
  }
};

/**
 * Checks if a National Identity Card (NIC) is already registered
 * @route POST /api/auth/check-nic
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const checkNic = async (req, res) => {
  const { nic } = req.body;
  try {
    const user = await userModel.findUserByNic(nic);
    if (user) {
      return res.json({ exists: true, message: "This NIC is already registered", email: user.email });
    }
    return res.json({ exists: false });
  } catch (error) {
    return res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};

/**
 * Fetches all vehicles registered under authenticated citizen NIC (max 3)
 * @route GET /api/auth/vehicles
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const getVehicles = async (req, res) => {
  try {
    const vehicles = await userModel.getVehiclesByUserId(req.user.userId);
    return res.json({ vehicles });
  } catch (error) {
    return res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};

/**
 * Adds an additional vehicle under citizen account (up to 3 vehicles)
 * @route POST /api/auth/vehicles
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const addVehicle = async (req, res) => {
  const { vehicleNumber, chassisNo, vehicleType, fuelType } = req.body;
  try {
    const existingVehicles = await userModel.getVehiclesByUserId(req.user.userId);
    if (existingVehicles && existingVehicles.length >= 3) {
      return res.status(400).json({ message: "Maximum limit reached! You can only register a maximum of 3 vehicles per NIC." });
    }

    await userModel.createVehicle({
      userId: req.user.userId,
      vehicleNumber,
      chassisNo,
      vehicleType,
      fuelType,
    });
    return res.status(201).json({ message: "Vehicle added successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "This vehicle is already registered" });
    }
    return res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};

/**
 * Updates vehicle registration details
 * @route PUT /api/auth/vehicle
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const updateVehicle = async (req, res) => {
  const userId = req.user.userId;
  const { vehicleId, vehicleNumber, chassisNo, vehicleType, fuelType } = req.body;
  try {
    const affected = await userModel.updateVehicleDetails(vehicleId, { vehicleNumber, chassisNo, vehicleType, fuelType });
    if (affected) {
      return res.json({ message: "Vehicle updated successfully" });
    }

    await userModel.createVehicle({ userId, vehicleNumber, chassisNo, vehicleType, fuelType });
    return res.json({ message: "Vehicle details saved successfully" });
  } catch (error) {
    return res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};

/**
 * Sets fuel quota carry-forward reservation
 * @route POST /api/auth/reserve-fuel
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
const reserveFuel = async (req, res) => {
  const { vehicleId, reservedUntil } = req.body;
  try {
    const affected = await userModel.setFuelReservation(vehicleId, reservedUntil);
    if (affected) {
      return res.json({ message: "Fuel reserved successfully" });
    }
    return res.status(404).json({ message: "Vehicle not found" });
  } catch (error) {
    return res.status(500).json({ message: getDatabaseErrorMessage(error) });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getMe,
  register,
  stationLogin,
  changeStationPassword,
  checkNic,
  getVehicles,
  addVehicle,
  updateVehicle,
  reserveFuel,
};
