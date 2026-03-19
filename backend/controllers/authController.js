const { sendOtpEmail } = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");
const {
  deleteOtpsByEmail,
  createOtp,
  findValidOtp,
  deleteOtpById,
} = require("../models/otpModel");
const { 
  findUserByEmail, 
  createUserWithDetails, 
  createVehicle 
} = require("../models/userModel");

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

  if (error.code === "EAUTH") {
    return "Email Authentication Failed. Please check EMAIL_USER and EMAIL_PASS in backend/.env.";
  }

  return "Database error";
};

const sendOtp = async (req, res) => {
  const { email, type } = req.body;

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  const normalizedEmail = email.trim().toLowerCase();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  try {
    if (type === "login") {
      const user = await findUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(404).json({ message: "User not registered. Please register first." });
      }
    } else if (type === "register") {
      const user = await findUserByEmail(normalizedEmail);
      if (user) {
        return res.status(409).json({ message: "User already registered. Please login." });
      }
    }

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
  const { email, otp, type } = req.body;
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const otpRow = await findValidOtp(normalizedEmail, otp);

    if (!otpRow) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    await deleteOtpById(otpRow.id);

    if (type === "register") {
      const registrationToken = jwt.sign(
        { email: normalizedEmail, verified: true },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );
      return res.json({
        message: "OTP verified successfully. Proceed to next step.",
        registrationToken,
      });
    } else {
      const user = await findUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        message: "OTP verified successfully",
        token,
        user,
      });
    }
  } catch (error) {
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const register = async (req, res) => {
  const { registrationToken, personalDetails, vehicleDetails, nicOrPassport } = req.body;

  if (!registrationToken) {
    return res.status(400).json({ message: "Registration token is required" });
  }

  try {
    const decoded = jwt.verify(registrationToken, process.env.JWT_SECRET);
    if (!decoded.verified || !decoded.email) {
      return res.status(400).json({ message: "Invalid registration token" });
    }

    const email = decoded.email;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already registered" });
    }

    const userData = {
      nic: nicOrPassport,
      firstName: personalDetails.firstName,
      lastName: personalDetails.lastName,
      address: personalDetails.address,
      phoneNumber: personalDetails.phoneNumber,
      email: email,
    };

    const userId = await createUserWithDetails(userData);

    const vehicleData = {
      userId: userId,
      vehicleNumber: vehicleDetails.vehicleNumber,
      chassisNo: vehicleDetails.chassisNo,
      vehicleType: vehicleDetails.vehicleType,
      fuelType: vehicleDetails.fuelType,
    };

    await createVehicle(vehicleData);

    const user = await findUserByEmail(email);

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Registration session expired. Please verify OTP again." });
    }
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await findUserByEmail(req.user.email);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: getDbErrorMessage(error) });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  register,
  getMe,
};
