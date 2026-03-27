const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp, register, getMe, stationLogin, checkNic, updateVehicle, reserveFuel, getVehicles, addVehicle } = require("../controllers/authController");
const {
  validateSendOtpInput,
  validateVerifyOtpInput,
  validateRegisterInput,
} = require("../middleware/validateAuthInput");
const { requireAuth } = require("../middleware/authToken");

router.post("/send-otp", validateSendOtpInput, sendOtp);
router.post("/verify-otp", validateVerifyOtpInput, verifyOtp);
router.post("/check-nic", checkNic);
router.post("/register", validateRegisterInput, register);
router.post("/station-login", stationLogin);
router.put("/vehicle", requireAuth, updateVehicle);
router.post("/reserve-fuel", requireAuth, reserveFuel);
router.get("/vehicles", requireAuth, getVehicles);
router.post("/vehicles", requireAuth, addVehicle);
router.get("/me", requireAuth, getMe);

module.exports = router;