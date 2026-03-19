const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp, register, getMe } = require("../controllers/authController");
const {
  validateSendOtpInput,
  validateVerifyOtpInput,
  validateRegisterInput,
} = require("../middleware/validateAuthInput");
const { requireAuth } = require("../middleware/authToken");

router.post("/send-otp", validateSendOtpInput, sendOtp);
router.post("/verify-otp", validateVerifyOtpInput, verifyOtp);
router.post("/register", validateRegisterInput, register);
router.get("/me", requireAuth, getMe);

module.exports = router;