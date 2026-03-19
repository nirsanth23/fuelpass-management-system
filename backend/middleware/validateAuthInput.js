const validateSendOtpInput = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  next();
};

const validateVerifyOtpInput = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  next();
};

const validateRegisterInput = (req, res, next) => {
  const { registrationToken, personalDetails, vehicleDetails, nicOrPassport } = req.body;

  if (!registrationToken || !personalDetails || !vehicleDetails || !nicOrPassport) {
    return res.status(400).json({ message: "Missing required registration details" });
  }

  next();
};

module.exports = {
  validateSendOtpInput,
  validateVerifyOtpInput,
  validateRegisterInput,
};
