const { sendOtpEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const {
  deleteOtpsByEmail,
  createOtp,
  findLatestActiveOtpByEmail,
  incrementFailedAttempts,
  deleteOtpById,
} = require("../models/otpModel");
const { findOrCreateUserByEmail, getUserWithVehicleAndQuota } = require("../models/userModel");
const { hashPassword, comparePassword } = require("../utils/passwordHelper");
const { signFuelPass } = require("../utils/qrCrypto");

const getDbErrorMessage = (error) => {
  if (!error || !error.code) {
    return "Database error";
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

  return "Database error";
};

const sendOtp = async (req, res) => {
  const { email, type } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  try {
    const userModel = require("../models/userModel");
    
    // Check if the email is already in use for registration
    if (type === "register") {
      const existingUser = await userModel.findUserByEmail(normalizedEmail);
      // Only block if they are FULLY registered (have a NIC)
      if (existingUser && existingUser.nic) {
        return res.status(400).json({ message: "This email is already registered" });
      }
    }

    // Check if the email is registered for login
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
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const activeOtp = await findLatestActiveOtpByEmail(normalizedEmail);

    if (!activeOtp) {
      return res.status(400).json({ message: "Invalid or expired OTP. Please request a new OTP." });
    }

    // Security Defense: 3-Attempt Lockout
    if (activeOtp.failed_attempts >= 3) {
      return res.status(429).json({
        message: "Too many incorrect attempts. This OTP has been locked for security. Please request a new OTP.",
      });
    }

    // Check if OTP matches
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

    // Correct OTP: delete to prevent reuse
    await deleteOtpById(activeOtp.id);
    const user = await findOrCreateUserByEmail(normalizedEmail);

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: "citizen" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "OTP verified successfully",
      registrationToken: token, // Frontend expects registrationToken
      token,
      user,
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const getMe = async (req, res) => {
  try {
    const { vehicleNumber } = req.query;
    const user = await getUserWithVehicleAndQuota(req.user.userId, vehicleNumber);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate cryptographic QR signature if vehicle exists
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
      } 
    });
  } catch (error) {
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const getVehicles = async (req, res) => {
  try {
    const vehicles = await require("../models/userModel").getVehiclesByUserId(req.user.userId);
    return res.json({ vehicles });
  } catch (error) {
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const addVehicle = async (req, res) => {
  const { vehicleNumber, chassisNo, vehicleType, fuelType } = req.body;
  try {
    const userModel = require("../models/userModel");
    const existingVehicles = await userModel.getVehiclesByUserId(req.user.userId);
    
    if (existingVehicles && existingVehicles.length >= 3) {
      return res.status(400).json({
        message: "Maximum limit reached! You can only register a maximum of 3 vehicles per NIC."
      });
    }

    await userModel.createVehicle({
      userId: req.user.userId,
      vehicleNumber,
      chassisNo,
      vehicleType,
      fuelType
    });
    return res.status(201).json({ message: "Vehicle added successfully" });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "This vehicle is already registered" });
    }
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getMe,
  getVehicles,
  addVehicle,
  // New handlers below
  register: async (req, res) => {
    const { nicOrPassport, personalDetails, vehicleDetails, email: reqEmail } = req.body;
    try {
      const email = reqEmail.trim().toLowerCase();
      const userModel = require("../models/userModel");

      // Find the existing user created by verifyOtp
      const existingUser = await userModel.findUserByEmail(email);
      if (!existingUser) {
        return res.status(400).json({ message: "Email verification required" });
      }

      // Destructure nested objects from frontend
      const { firstName, lastName, address, phoneNumber } = personalDetails;
      const { vehicleNumber, chassisNo, vehicleType, fuelType } = vehicleDetails;
      
      // Update existing user record instead of inserting a new one
      await userModel.updateUserByEmail({ 
        nic: nicOrPassport, 
        firstName, 
        lastName, 
        address, 
        phoneNumber, 
        email 
      });

      // Create vehicle linked to the existing user ID
      await userModel.createVehicle({ 
        userId: existingUser.id, 
        vehicleNumber, 
        chassisNo, 
        vehicleType, 
        fuelType 
      });

      // Fetch the full updated user record for auto-login
      const user = await userModel.findUserByEmail(email);

      // Generate JWT token for auto-login
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.status(201).json({ 
        message: "User registered successfully",
        token,
        user
      });
    } catch (error) {
      console.error("Register error:", error);
      if (error.code === 'ER_DUP_ENTRY') {
        const msg = error.sqlMessage || "";
        if (msg.includes('users.email')) {
          return res.status(400).json({ message: "This email is already registered" });
        }
        if (msg.includes('users.nic')) {
          return res.status(400).json({ message: "This NIC is already registered" });
        }
        return res.status(400).json({ message: "This email or NIC is already registered" });
      }
      return res.status(500).json({ message: getDbErrorMessage(error) });
    }
  },

  stationLogin: async (req, res) => {
    const { stationId, password } = req.body;
    try {
      const station = await require("../models/stationModel").findStationById(stationId);
      if (!station) {
        return res.status(401).json({ message: "Invalid station credentials" });
      }

      const matchResult = await comparePassword(password, station.password);
      const isMatch = typeof matchResult === "object" ? matchResult.isMatch : Boolean(matchResult);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid station credentials" });
      }

      // Auto-migrate legacy plaintext password to secure bcrypt hash in DB
      if (matchResult.needsRehash || (typeof station.password === "string" && !station.password.startsWith("$2"))) {
        const hashed = await hashPassword(password);
        await require("../models/stationModel").updateStationPassword(station.station_id, hashed);
      }
      
      const token = jwt.sign(
        { userId: station.station_id, stationId: station.station_id, role: 'station' },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({ 
        message: "Station login successful", 
        token, 
        stationId: station.station_id,
        mustChangePassword: station.must_change_password === 1 || station.must_change_password === true,
        station 
      });
    } catch (error) {
      console.error("Station login error:", error);
      return res.status(500).json({ message: "Station login failed" });
    }
  },

  changeStationPassword: async (req, res) => {
    const stationId = req.user.stationId || req.user.userId;
    const { newPassword, confirmPassword } = req.body;

    if (!stationId) {
      return res.status(401).json({ message: "Unauthorized station access." });
    }

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password are required." });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // Password validation rule: must have letter, number, and special character
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
  },

  checkNic: async (req, res) => {
    const { nic } = req.body;
    try {
      const user = await require("../models/userModel").findUserByNic(nic);
      if (user) {
        return res.json({ 
          exists: true, 
          message: "This NIC is already registered",
          email: user.email 
        });
      }
      return res.json({ exists: false });
    } catch (error) {
      return res.status(500).json({ message: getDbErrorMessage(error) });
    }
  },

  updateVehicle: async (req, res) => {
    const userId = req.user.userId;
    const { vehicleId, vehicleNumber, chassisNo, vehicleType, fuelType } = req.body;
    try {
      const affected = await require("../models/userModel").updateVehicleDetails(vehicleId, { vehicleNumber, chassisNo, vehicleType, fuelType });
      if (affected) {
        return res.json({ message: "Vehicle updated successfully" });
      }
      
      // If no rows were updated, it means the vehicle record doesn't exist yet for this user.
      // Let's create it now to handle users setting up for the first time.
      await require("../models/userModel").createVehicle({ userId, vehicleNumber, chassisNo, vehicleType, fuelType });
      return res.json({ message: "Vehicle details saved successfully" });
    } catch (error) {
      return res.status(500).json({ message: getDbErrorMessage(error) });
    }
  },

  reserveFuel: async (req, res) => {
    const { vehicleId, reservedUntil } = req.body;
    try {
      const affected = await require("../models/userModel").setFuelReservation(vehicleId, reservedUntil);
      if (affected) {
        return res.json({ message: "Fuel reserved successfully" });
      }
      return res.status(404).json({ message: "Vehicle not found" });
    } catch (error) {
      return res.status(500).json({ message: getDbErrorMessage(error) });
    }
  },
};
