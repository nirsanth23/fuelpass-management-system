const express = require("express");
const router = express.Router();
const { 
  getDashboardData, 
  getProfile, 
  updateProfile, 
  addSupply, 
  getNextReferenceNo,
  validateQrPass,
  dispenseFuel
} = require("../controllers/stationController");
const { requireStationAuth } = require("../middleware/authToken");

router.get("/dashboard", requireStationAuth, getDashboardData);
router.get("/profile", requireStationAuth, getProfile);
router.put("/profile", requireStationAuth, updateProfile);
router.post("/supplies", requireStationAuth, addSupply);
router.get("/next-supply-ref", requireStationAuth, getNextReferenceNo);
router.post("/validate-qr", requireStationAuth, validateQrPass);
router.post("/dispense", requireStationAuth, dispenseFuel);

module.exports = router;
