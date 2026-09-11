const jwt = require("jsonwebtoken");

/**
 * Validates any valid JWT Token (User, Station, or Admin)
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication required. No token provided." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired session token." });
  }
};

/**
 * Strict Middleware: Validates that the caller is an authenticated System Administrator
 */
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Administrator authorization token required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Administrator privileges required." });
    }
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired admin session token." });
  }
};

/**
 * Strict Middleware: Validates that the caller is an authenticated Fuel Station Operator
 */
const requireStationAuth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: "Station operator authorization token required." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "station") {
      return res.status(403).json({ message: "Access denied. Station operator privileges required." });
    }
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired station session token." });
  }
};

module.exports = {
  requireAuth,
  requireAdminAuth,
  requireStationAuth,
};
