const adminModel = require("../models/adminModel");
const { sendPasswordEmail } = require("../utils/sendEmail");

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
    const notifications = await adminModel.getPendingNotifications();
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

  const newPassword = Math.floor(10000 + Math.random() * 90000).toString();

  try {
    const notification = await adminModel.getNotificationById(id);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    const stationId = notification.station_username;
    await sendPasswordEmail(email, newPassword);
    
    // Update the station's password in the database
    const { updateStationPassword } = require("../models/stationModel");
    await updateStationPassword(stationId, newPassword);
    
    await adminModel.markNotificationResolved(id);

    return res.json({ message: "Password sent and notification resolved.", newPassword });
  } catch (error) {
    console.error("approvePasswordReset Error:", error);
    if (error.code === "EAUTH") {
      return res.status(500).json({ message: "Admin Email Authentication Failed. Please check .env." });
    }
    return res.status(500).json({ message: "Failed to approve request." });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const stats = await adminModel.getDashboardStats();
    return res.json(stats);
  } catch (error) {
    console.error("getDashboardSummary Error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard stats." });
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
  try {
    await adminModel.addStation(req.body);
    return res.json({ message: "Station created successfully." });
  } catch (error) {
    console.error("createStation Error:", error);
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
  submitForgotPassword,
  getNotifications,
  approvePasswordReset,
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
  getAnalytics
};
