const stationModel = require("../models/stationModel");

const getDashboardData = async (req, res) => {
  const stationId = req.user.stationId; // From JWT payload
  const date = req.query.date || new Date().toISOString().split('T')[0]; // Default to today

  if (!stationId) {
    return res.status(401).json({ message: "Invalid station authentication" });
  }

  try {
    const stats = await stationModel.getStationDashboardStats(stationId);
    const transactions = await stationModel.getStationTransactions(stationId, date);

    return res.json({
      stats,
      transactions
    });
  } catch (error) {
    console.error("getDashboardData error:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
};

const getProfile = async (req, res) => {
  const stationId = req.user.stationId;
  try {
    const profile = await stationModel.getStationProfile(stationId);
    if (!profile) {
      return res.status(404).json({ message: "Station profile not found" });
    }
    return res.json(profile);
  } catch (error) {
    console.error("getProfile error:", error);
    return res.status(500).json({ message: "Failed to fetch profile" });
  }
};

const updateProfile = async (req, res) => {
  const stationId = req.user.stationId;
  const { name, location, phone_number, email } = req.body;

  if (!name || !location) {
    return res.status(400).json({ message: "Name and location are required" });
  }

  try {
    await stationModel.updateStationProfile(stationId, { name, location, phone_number, email });
    return res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
};

module.exports = {
  getDashboardData,
  getProfile,
  updateProfile
};
