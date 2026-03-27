const { sendOtpEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const {
  deleteOtpsByEmail,
  createOtp,
  findValidOtp,
  deleteOtpById,
} = require("../models/otpModel");
const { findOrCreateUserByEmail, getUserWithVehicleAndQuota } = require("../models/userModel");

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

    return res.json({
      message: "OTP verified successfully",
      registrationToken: token, // Frontend expects registrationToken
      token,
      user,
    });
  } catch (error) {
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

    return res.json({ user });
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
    await require("../models/userModel").createVehicle({
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
      if (!station || station.password !== password) {
        return res.status(401).json({ message: "Invalid station credentials" });
      }
      // You may want to generate a token for station login as well
      return res.json({ message: "Station login successful", station });
    } catch (error) {
      return res.status(500).json({ message: "Station login failed" });
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
