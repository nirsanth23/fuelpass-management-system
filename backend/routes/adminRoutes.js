const express = require("express");
const { 
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
} = require("../controllers/adminController");

const router = express.Router();

// Existing Notifications
router.post("/notifications/forgot-password", submitForgotPassword);
router.get("/notifications", getNotifications);
router.post("/send-station-password", approvePasswordReset);

// Dashboard Stats
router.get("/stats", getDashboardSummary);

// Quota Management
router.get("/quota-rules", getQuotaRules);
router.put("/quota-rules", updateQuotaRules);
router.post("/quota-rules", createQuotaRule);
router.delete("/quota-rules/:vehicleType", removeQuotaRule);

// Station Management
router.get("/stations", getStationsList);
router.post("/stations", createStation);
router.patch("/stations/:stationId/status", updateStationStatus);
router.put("/stations/:stationId", updateStationDetails);
router.get("/stations/:stationId/history", getStationSupplyHistory);

// Delete Station
router.delete("/stations/:stationId", require("../controllers/adminController").deleteStation);

// Analytics
router.get("/analytics", getAnalytics);

module.exports = router;
