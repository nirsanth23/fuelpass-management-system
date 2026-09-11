const rateLimit = require("express-rate-limit");

/**
 * Rate limiter for OTP requests (Anti-Spam & SMS/Email cost protection)
 * Max 5 requests per 15 minutes per IP.
 */
const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true, // Return standard RateLimit headers
  legacyHeaders: false, // Disable X-RateLimit headers
  message: {
    message: "Too many OTP requests from this IP. Please try again after 15 minutes.",
  },
});

/**
 * Rate limiter for Station & Admin Login (Anti-Brute Force)
 * Max 10 attempts per 15 minutes per IP.
 */
const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts from this IP. Please wait 15 minutes before trying again.",
  },
});

module.exports = {
  otpRateLimiter,
  loginRateLimiter,
};
