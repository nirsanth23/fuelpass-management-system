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

module.exports = {
  submitForgotPassword,
  getNotifications,
  approvePasswordReset,
};
