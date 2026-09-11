const crypto = require("crypto");

const SECRET_KEY = process.env.QR_SECRET || process.env.JWT_SECRET || "fuelpass_default_secret_key_2026";

/**
 * Signs a vehicle fuel pass payload using HMAC-SHA256.
 * @param {Object|string} payload - Vehicle/NIC identifier data
 * @returns {string} Hexadecimal HMAC signature
 */
const signFuelPass = (payload) => {
  const dataString = typeof payload === "object" ? JSON.stringify(payload) : String(payload);
  return crypto.createHmac("sha256", SECRET_KEY).update(dataString).digest("hex");
};

/**
 * Validates whether a given FuelPass payload matches its HMAC signature.
 * Prevents timing attacks with timingSafeEqual.
 * @param {Object|string} payload
 * @param {string} signature
 * @returns {boolean}
 */
const verifyFuelPass = (payload, signature) => {
  if (!payload || !signature) return false;
  try {
    const expectedSignature = signFuelPass(payload);
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const givenBuffer = Buffer.from(signature, "hex");

    if (expectedBuffer.length !== givenBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(expectedBuffer, givenBuffer);
  } catch (err) {
    return false;
  }
};

module.exports = {
  signFuelPass,
  verifyFuelPass,
};
