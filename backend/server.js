require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

require("./config/db");

// 1. HTTP Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // Allows QR code generation APIs and font resources
  })
);

// 2. Strict Origin Whitelist for Cross-Origin Resource Sharing (CORS)
const customOrigins = (process.env.ALLOWED_ORIGINS || process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...customOrigins]));

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or from allowed list
      if (
        !origin ||
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith(".vercel.app") ||
        origin.endsWith(".netlify.app") ||
        origin.endsWith(".onrender.com")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy violation: Access denied for origin ${origin}`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 3. Strict Payload Body Limits to prevent DoS via huge JSON payloads
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// 4. Cloud Health Check Endpoint for Load Balancers & Monitoring
const db = require("./config/db");
app.get("/api/health", (req, res) => {
  db.query("SELECT 1 AS status", (err) => {
    if (err) {
      return res.status(503).json({
        status: "unhealthy",
        database: "disconnected",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
    return res.json({
      status: "healthy",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });
});

app.get("/", (req, res) => {
  res.send("FuelPass Enterprise API running securely.");
});

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const stationRoutes = require("./routes/stationRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/station", stationRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Enterprise FuelPass Server running securely on port ${PORT}`);
});