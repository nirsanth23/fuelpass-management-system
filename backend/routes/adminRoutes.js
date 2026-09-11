const express = require("express");
const { 
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
} = require("../controllers/adminController");
const { requireAdminAuth } = require("../middleware/authToken");
const { loginRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

// Admin Authentication (Protected with Login Rate Limiter)
router.post("/login", loginRateLimiter, adminLogin);

// Public / Station Notifications
router.post("/notifications/forgot-password", submitForgotPassword);
router.get("/notifications", requireAdminAuth, getNotifications);
router.post("/send-station-password", requireAdminAuth, approvePasswordReset);
router.post("/reject-station-password", requireAdminAuth, rejectPasswordReset);

// Dashboard Stats (Admin Only)
router.get("/stats", requireAdminAuth, getDashboardSummary);

// Quota Management: GET /quota-rules is public for landing page display, mutations are Admin-only
router.get("/quota-rules", getQuotaRules);
router.put("/quota-rules", requireAdminAuth, updateQuotaRules);
router.post("/quota-rules", requireAdminAuth, createQuotaRule);
router.delete("/quota-rules/:vehicleType", requireAdminAuth, removeQuotaRule);

// Station Management (Admin Only)
router.get("/stations", requireAdminAuth, getStationsList);
router.post("/stations", requireAdminAuth, createStation);
router.patch("/stations/:stationId/status", requireAdminAuth, updateStationStatus);
router.put("/stations/:stationId", requireAdminAuth, updateStationDetails);
router.get("/stations/:stationId/history", requireAdminAuth, getStationSupplyHistory);
router.delete("/stations/:stationId", requireAdminAuth, deleteStation);

// Analytics (Admin Only)
router.get("/analytics", requireAdminAuth, getAnalytics);

module.exports = router;
