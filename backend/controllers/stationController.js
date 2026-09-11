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

const getNextReferenceNo = async (req, res) => {
  const stationId = req.user.stationId;
  try {
    const referenceNo = await stationModel.getNextSupplyReferenceNo(stationId);
    return res.json({ referenceNo });
  } catch (error) {
    console.error("getNextReferenceNo error:", error);
    return res.status(500).json({ message: "Failed to generate reference number" });
  }
};

const addSupply = async (req, res) => {
  const stationId = req.user.stationId;
  const { petrolAmount, dieselAmount, referenceNo, suppliedAt } = req.body;

  if (petrolAmount === undefined || dieselAmount === undefined) {
    return res.status(400).json({ message: "Petrol and diesel amounts are required" });
  }

  try {
    const finalSuppliedAt = suppliedAt && typeof suppliedAt === 'string' && suppliedAt.trim() 
      ? suppliedAt.replace('T', ' ') 
      : new Date();
    const finalRefNo = referenceNo && referenceNo.trim() 
      ? referenceNo.trim() 
      : await stationModel.getNextSupplyReferenceNo(stationId);
      
    await stationModel.addStationSupply(stationId, petrolAmount, dieselAmount, finalRefNo, finalSuppliedAt);
    return res.json({ message: "Fuel supply logged and stock updated successfully", referenceNo: finalRefNo });
  } catch (error) {
    console.error("addSupply error:", error);
    return res.status(500).json({ message: "Failed to add supply" });
  }
};

const validateQrPass = async (req, res) => {
  const { qrPayload, vehicleNumber } = req.body;
  const { verifyFuelPass } = require("../utils/qrCrypto");

  try {
    let targetVehicle = vehicleNumber;

    // Cryptographic signature check
    if (qrPayload) {
      try {
        const parsed = typeof qrPayload === "string" ? JSON.parse(qrPayload) : qrPayload;
        if (parsed && parsed.sig) {
          const { sig, ...data } = parsed;
          const isValid = verifyFuelPass(data, sig);
          if (!isValid) {
            return res.status(400).json({ message: "Security Alert: Cryptographic QR signature verification failed. Pass may be forged or tampered." });
          }
          targetVehicle = data.v;
        }
      } catch (_) {
        targetVehicle = qrPayload;
      }
    }

    if (!targetVehicle) {
      return res.status(400).json({ message: "Vehicle identification is required" });
    }

    return res.json({
      verified: true,
      vehicleNumber: targetVehicle,
      message: "QR Pass cryptographically verified."
    });
  } catch (error) {
    console.error("validateQrPass error:", error);
    return res.status(500).json({ message: "Failed to validate QR Pass" });
  }
};

const dispenseFuel = async (req, res) => {
  const stationId = req.user.stationId;
  const { vehicleNumber, fuelType, amount, qrPayload } = req.body;
  const { verifyFuelPass } = require("../utils/qrCrypto");

  if (!vehicleNumber || !fuelType || !amount || parseFloat(amount) <= 0) {
    return res.status(400).json({ message: "Vehicle number, fuel type, and valid amount (> 0) are required." });
  }

  // Cryptographic Signature verification if QR is passed
  if (qrPayload) {
    try {
      const parsed = typeof qrPayload === "string" ? JSON.parse(qrPayload) : qrPayload;
      if (parsed && parsed.sig) {
        const { sig, ...data } = parsed;
        const isValid = verifyFuelPass(data, sig);
        if (!isValid) {
          return res.status(400).json({ message: "Security Alert: QR signature invalid. Tampering detected." });
        }
      }
    } catch (_) {}
  }

  try {
    const result = await stationModel.dispenseFuel({
      stationId,
      vehicleNumber,
      fuelType,
      amount: parseFloat(amount),
    });

    return res.json({
      message: "Fuel dispensed and quota deducted atomically.",
      ...result
    });
  } catch (error) {
    console.error("dispenseFuel error:", error);
    return res.status(400).json({ message: error.message || "Failed to dispense fuel" });
  }
};

module.exports = {
  getDashboardData,
  getProfile,
  updateProfile,
  addSupply,
  getNextReferenceNo,
  validateQrPass,
  dispenseFuel
};
