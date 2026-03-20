const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp, register, getMe, stationLogin, checkNic, updateVehicle } = require("../controllers/authController");
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
router.get("/me", requireAuth, getMe);

module.exports = router;