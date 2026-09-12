/**
 * @file stationController.js
 * @description Controller handling station-specific actions including telemetry dashboards,
 * fuel supply logging, station profile management, cryptographic QR pass validation, and atomic fuel dispensing.
 * @module controllers/stationController
 */

const stationModel = require("../models/stationModel");
const { verifyFuelPass } = require("../utils/qrCrypto");
const { sendSuccess, sendError } = require("../utils/responseHelper");

/**
 * Extracts and verifies vehicle number from QR payload if present.
 * @param {string|object} qrPayload - QR pass payload (JSON or plaintext).
 * @param {string} [fallbackVehicle] - Fallback vehicle number if no QR payload.
 * @returns {{ vehicleNumber: string|null, isValid: boolean, error?: string }}
 */
const extractVerifiedVehicle = (qrPayload, fallbackVehicle) => {
  if (!qrPayload) {
    return { vehicleNumber: fallbackVehicle || null, isValid: true };
  }

  try {
    const parsed = typeof qrPayload === "string" ? JSON.parse(qrPayload) : qrPayload;
    if (parsed && parsed.sig) {
      const { sig, ...data } = parsed;
      const isValid = verifyFuelPass(data, sig);
      if (!isValid) {
        return { 
          vehicleNumber: null, 
          isValid: false, 
          error: "Security Alert: Cryptographic QR signature verification failed. Pass may be forged or tampered." 
        };
      }
      return { vehicleNumber: data.v, isValid: true };
    }
    return { vehicleNumber: typeof qrPayload === "string" ? qrPayload : fallbackVehicle, isValid: true };
  } catch (_) {
    return { vehicleNumber: typeof qrPayload === "string" ? qrPayload : fallbackVehicle, isValid: true };
  }
};

/**
 * Retrieve station telemetry metrics, transactions, and supply history.
 * @route GET /api/station/dashboard
 * @param {import("express").Request} req - Express request object containing user payload.
 * @param {import("express").Response} res - Express response object.
 * @returns {Promise<void>}
 */
const getDashboardData = async (req, res) => {
  const stationId = req.user?.stationId;
  const date = req.query.date || new Date().toISOString().split("T")[0];

  if (!stationId) {
    return sendError(res, "Invalid station authentication", 401);
  }

  try {
    const stats = await stationModel.getStationDashboardStats(stationId);
    const transactions = await stationModel.getStationTransactions(stationId, date);
    const supplies = await stationModel.getStationSupplies(stationId);

    return res.json({ stats, transactions, supplies });
  } catch (error) {
    console.error("getDashboardData error:", error);
    return sendError(res, "Failed to fetch dashboard data", 500);
  }
};

/**
 * Retrieve station profile details.
 * @route GET /api/station/profile
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 */
const getProfile = async (req, res) => {
  const stationId = req.user?.stationId;
  try {
    const profile = await stationModel.getStationProfile(stationId);
    if (!profile) {
      return sendError(res, "Station profile not found", 404);
    }
    return res.json(profile);
  } catch (error) {
    console.error("getProfile error:", error);
    return sendError(res, "Failed to fetch profile", 500);
  }
};

/**
 * Update station profile details (name, location, contact).
 * @route PUT /api/station/profile
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 */
const updateProfile = async (req, res) => {
  const stationId = req.user?.stationId;
  const { name, location, phone_number, email } = req.body;

  if (!name || !location) {
    return sendError(res, "Name and location are required", 400);
  }

  try {
    await stationModel.updateStationProfile(stationId, { name, location, phone_number, email });
    return sendSuccess(res, "Profile updated successfully");
  } catch (error) {
    console.error("updateProfile error:", error);
    return sendError(res, "Failed to update profile", 500);
  }
};

/**
 * Generate next formatted supply reference number for the station.
 * @route GET /api/station/supplies/next-ref
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 */
const getNextReferenceNo = async (req, res) => {
  const stationId = req.user?.stationId;
  try {
    const referenceNo = await stationModel.getNextSupplyReferenceNo(stationId);
    return res.json({ referenceNo });
  } catch (error) {
    console.error("getNextReferenceNo error:", error);
    return sendError(res, "Failed to generate reference number", 500);
  }
};

/**
 * Log new fuel supply batch and atomically increase station inventory.
 * @route POST /api/station/supplies
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 */
const addSupply = async (req, res) => {
  const stationId = req.user?.stationId;
  const { petrolAmount, dieselAmount, referenceNo, suppliedAt } = req.body;

  if (petrolAmount === undefined || dieselAmount === undefined) {
    return sendError(res, "Petrol and diesel amounts are required", 400);
  }

  try {
    const finalSuppliedAt = suppliedAt && typeof suppliedAt === "string" && suppliedAt.trim()
      ? suppliedAt.replace("T", " ")
      : new Date();
    const finalRefNo = referenceNo && referenceNo.trim()
      ? referenceNo.trim()
      : await stationModel.getNextSupplyReferenceNo(stationId);

    await stationModel.addStationSupply(stationId, petrolAmount, dieselAmount, finalRefNo, finalSuppliedAt);
    return res.json({ message: "Fuel supply logged and stock updated successfully", referenceNo: finalRefNo });
  } catch (error) {
    console.error("addSupply error:", error);
    return sendError(res, "Failed to add supply", 500);
  }
};

/**
 * Validates vehicle QR pass signature prior to dispensing.
 * @route POST /api/station/validate-qr
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 */
const validateQrPass = async (req, res) => {
  const { qrPayload, vehicleNumber } = req.body;

  try {
    const verification = extractVerifiedVehicle(qrPayload, vehicleNumber);
    if (!verification.isValid) {
      return sendError(res, verification.error, 400);
    }

    if (!verification.vehicleNumber) {
      return sendError(res, "Vehicle identification is required", 400);
    }

    return res.json({
      verified: true,
      vehicleNumber: verification.vehicleNumber,
      message: "QR Pass cryptographically verified."
    });
  } catch (error) {
    console.error("validateQrPass error:", error);
    return sendError(res, "Failed to validate QR Pass", 500);
  }
};

/**
 * Dispense fuel atomically, checking quota, deducting quota & inventory, and recording audit transaction.
 * @route POST /api/station/dispense
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 */
const dispenseFuel = async (req, res) => {
  const stationId = req.user?.stationId;
  const { vehicleNumber, fuelType, amount, qrPayload } = req.body;

  if (!vehicleNumber || !fuelType || !amount || parseFloat(amount) <= 0) {
    return sendError(res, "Vehicle number, fuel type, and valid amount (> 0) are required.", 400);
  }

  // Cryptographic Signature verification if QR is provided
  if (qrPayload) {
    const verification = extractVerifiedVehicle(qrPayload, vehicleNumber);
    if (!verification.isValid) {
      return sendError(res, verification.error, 400);
    }
  }

  try {
    const result = await stationModel.dispenseFuel({
      stationId,
      vehicleNumber,
      fuelType,
      amount: parseFloat(amount)
    });

    return res.json({
      message: "Fuel dispensed and quota deducted atomically.",
      ...result
    });
  } catch (error) {
    console.error("dispenseFuel error:", error);
    return sendError(res, error.message || "Failed to dispense fuel", 400);
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
