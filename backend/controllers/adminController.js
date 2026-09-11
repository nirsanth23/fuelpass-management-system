const jwt = require("jsonwebtoken");
const adminModel = require("../models/adminModel");
const { sendPasswordEmail, sendPasswordResetRejectionEmail, sendStationCredentialsEmail } = require("../utils/sendEmail");
const { hashPassword } = require("../utils/passwordHelper");

/**
 * Authenticates System Administrator and issues an Admin JWT token
 */
const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  const configuredAdminUser = process.env.ADMIN_USER || "admin";
  const configuredAdminPass = process.env.ADMIN_PASS || "admin123";

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (username.trim() === configuredAdminUser && password.trim() === configuredAdminPass) {
    const token = jwt.sign(
      { userId: "admin", username: configuredAdminUser, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    return res.json({ 
      message: "Admin authentication successful", 
      token,
      user: { username: configuredAdminUser, role: "admin" }
    });
  }

  return res.status(401).json({ message: "Invalid administrator credentials" });
};

const deleteStation = async (req, res) => {
  const { stationId } = req.params;
  try {
    await adminModel.deleteStation(stationId);
    return res.json({ message: "Station deleted successfully." });
  } catch (error) {
    console.error("deleteStation Error:", error);
    return res.status(500).json({ message: "Failed to delete station." });
  }
};

const submitForgotPassword = async (req, res) => {
  const { stationUsername, email, phoneNumber } = req.body;

  if (!stationUsername || !email || !phoneNumber) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await adminModel.createNotification("forgot_password", stationUsername, email, phoneNumber);
    return res.json({ message: "Password reset request sent to Admin successfully." });
  } catch (error) {
    console.error("submitForgotPassword Error:", error);
    return res.status(500).json({ message: "Failed to submit request." });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await adminModel.getAllNotifications();
    return res.json({ notifications });
  } catch (error) {
    console.error("getNotifications Error:", error);
    return res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

const approvePasswordReset = async (req, res) => {
  const { id, email } = req.body;

  if (!id || !email) {
    return res.status(400).json({ message: "Notification ID and Email are required." });
  }

  // Generate 6-digit numeric temporary password
  const newPassword = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const notification = await adminModel.getNotificationById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    const stationId = notification.station_username;

    // Send plaintext password in approved email to the station operator
    await sendPasswordEmail(email, newPassword, stationId, notification.station_name);
    
    // Hash temporary password with bcrypt before updating in database
    const hashedPassword = await hashPassword(newPassword);
    const { updateStationPassword } = require("../models/stationModel");
    await updateStationPassword(stationId, hashedPassword);

    const db = require("../config/db");
    await new Promise((resolve, reject) => {
      db.query("UPDATE fuel_stations SET must_change_password = 1 WHERE station_id = ?", [stationId], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    
    await adminModel.markNotificationResolved(id);

    return res.json({ message: "6-digit temporary password sent and notification approved." });
  } catch (error) {
    console.error("approvePasswordReset Error:", error);
    if (error.code === "EAUTH") {
      return res.status(500).json({ message: "Admin Email Authentication Failed. Please check .env." });
    }
    return res.status(500).json({ message: "Failed to approve password reset." });
  }
};

const rejectPasswordReset = async (req, res) => {
  const { id, email, reason } = req.body;

  if (!id || !email) {
    return res.status(400).json({ message: "Notification ID and Email are required." });
  }

  try {
    const notification = await adminModel.getNotificationById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    const stationId = notification.station_username;

    await sendPasswordResetRejectionEmail(email, stationId, notification.station_name);
    await adminModel.markNotificationRejected(id, reason || "Unauthorized station verification details");

    return res.json({ message: "Password reset request rejected and notification sent." });
  } catch (error) {
    console.error("rejectPasswordReset Error:", error);
    return res.status(500).json({ message: "Failed to reject password reset." });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const summary = await adminModel.getDashboardStats();
    return res.json(summary);
  } catch (error) {
    console.error("getDashboardSummary Error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard summary." });
  }
};

const getQuotaRules = async (req, res) => {
  try {
    const rules = await adminModel.getQuotaRules();
    return res.json(rules);
  } catch (error) {
    console.error("getQuotaRules Error:", error);
    return res.status(500).json({ message: "Failed to fetch quota rules." });
  }
};

const updateQuotaRules = async (req, res) => {
  const { vehicleType, weeklyLimit, carryForwardLimit } = req.body;
  try {
    await adminModel.updateQuotaRule(vehicleType, weeklyLimit, carryForwardLimit);
    return res.json({ message: "Quota rule updated successfully." });
  } catch (error) {
    console.error("updateQuotaRules Error:", error);
    return res.status(500).json({ message: "Failed to update quota rule." });
  }
};

const createQuotaRule = async (req, res) => {
  const { vehicleType, weeklyLimit, carryForwardLimit, category } = req.body;
  try {
    await adminModel.addQuotaRule(vehicleType, weeklyLimit, carryForwardLimit, category);
    return res.json({ message: "Quota rule created successfully." });
  } catch (error) {
    console.error("createQuotaRule Error:", error);
    return res.status(500).json({ message: "Failed to create quota rule." });
  }
};

const removeQuotaRule = async (req, res) => {
  const { vehicleType } = req.params;
  try {
    await adminModel.deleteQuotaRule(vehicleType);
    return res.json({ message: "Quota rule deleted successfully." });
  } catch (error) {
    console.error("removeQuotaRule Error:", error);
    return res.status(500).json({ message: "Failed to delete quota rule." });
  }
};

const getStationsList = async (req, res) => {
  try {
    const stations = await adminModel.getStations();
    return res.json(stations);
  } catch (error) {
    console.error("getStationsList Error:", error);
    return res.status(500).json({ message: "Failed to fetch stations." });
  }
};

const createStation = async (req, res) => {
  const { stationId, name, location, email } = req.body;
  if (!stationId || !name || !location || !email) {
    return res.status(400).json({ message: "Station ID, Name, Location, and Email are required." });
  }

  // Generate 6-digit numeric password
  const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    // Hash with bcrypt before storing in database
    const hashedPassword = await hashPassword(tempPassword);

    await adminModel.addStation({
      ...req.body,
      password: hashedPassword,
      email: email.trim().toLowerCase(),
      must_change_password: 1,
    });

    // Send styled credentials email with the plain temporary password to the station email
    await sendStationCredentialsEmail(email.trim().toLowerCase(), stationId, name, tempPassword);

    return res.json({ 
      message: "Station created and credentials sent to email successfully.",
    });
  } catch (error) {
    console.error("createStation Error:", error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: "Station ID or email already exists." });
    }
    return res.status(500).json({ message: "Failed to create station." });
  }
};

const updateStationStatus = async (req, res) => {
  const { stationId } = req.params;
  const { status } = req.body;
  try {
    await adminModel.updateStation(stationId, { status });
    return res.json({ message: "Station status updated successfully." });
  } catch (error) {
    console.error("updateStationStatus Error:", error);
    return res.status(500).json({ message: "Failed to update station status." });
  }
};

const updateStationDetails = async (req, res) => {
  const { stationId } = req.params;
  try {
    const { last_supplied_petrol, last_supplied_diesel } = req.body;
    
    await adminModel.updateStation(stationId, req.body);
    
    if (last_supplied_petrol !== undefined || last_supplied_diesel !== undefined) {
      await adminModel.recordSupplyHistory(
        stationId, 
        last_supplied_petrol || 0, 
        last_supplied_diesel || 0
      );
    }

    return res.json({ message: "Station details updated successfully." });
  } catch (error) {
    console.error("updateStationDetails Error:", error);
    return res.status(500).json({ message: "Failed to update station details." });
  }
};

const getStationSupplyHistory = async (req, res) => {
  const { stationId } = req.params;
  try {
    const history = await adminModel.getStationHistory(stationId);
    return res.json(history);
  } catch (error) {
    console.error("getStationSupplyHistory Error:", error);
    return res.status(500).json({ message: "Failed to fetch supply history." });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const data = await adminModel.getAnalyticsData();
    return res.json(data);
  } catch (error) {
    console.error("getAnalytics Error:", error);
    return res.status(500).json({ message: "Failed to fetch analytics data." });
  }
};

module.exports = {
  adminLogin,
  submitForgotPassword,
  getNotifications,
  approvePasswordReset,
  rejectPasswordReset,
  getDashboardSummary,
  getQuotaRules,
  updateQuotaRules,
  createQuotaRule,
  removeQuotaRule,
  getStationsList,
  createStation,
  updateStationStatus,
  updateStationDetails,
  getStationSupplyHistory,
  getAnalytics,
  deleteStation
};
