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
    const supplies = await stationModel.getStationSupplies(stationId);

    return res.json({
      stats,
      transactions,
      supplies
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

const addSupply = async (req, res) => {
  const stationId = req.user.stationId;
  const { petrolAmount, dieselAmount, referenceNo, suppliedAt } = req.body;

  if (petrolAmount === undefined || dieselAmount === undefined) {
    return res.status(400).json({ message: "Petrol and diesel amounts are required" });
  }

  try {
    await stationModel.addStationSupply(stationId, petrolAmount, dieselAmount, referenceNo, suppliedAt);
    return res.json({ message: "Fuel supply logged and stock updated successfully" });
  } catch (error) {
    console.error("addSupply error:", error);
    return res.status(500).json({ message: "Failed to add supply" });
  }
};

module.exports = {
  getDashboardData,
  getProfile,
  updateProfile,
  addSupply
};
