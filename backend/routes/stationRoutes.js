const express = require("express");
const router = express.Router();
const { getDashboardData, getProfile, updateProfile, addSupply } = require("../controllers/stationController");
const { requireAuth } = require("../middleware/authToken");

router.get("/dashboard", requireAuth, getDashboardData);
router.get("/profile", requireAuth, getProfile);
router.put("/profile", requireAuth, updateProfile);
router.post("/supplies", requireAuth, addSupply);

module.exports = router;
