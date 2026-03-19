const express = require("express");
const { submitForgotPassword, getNotifications, approvePasswordReset } = require("../controllers/adminController");

const router = express.Router();

router.post("/notifications/forgot-password", submitForgotPassword);
router.get("/notifications", getNotifications);
router.post("/send-station-password", approvePasswordReset);

module.exports = router;
