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
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman) or from allowed list
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation: Access denied for this origin."));
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

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const stationRoutes = require("./routes/stationRoutes");

app.get("/", (req, res) => {
  res.send("FuelPass Enterprise API running securely.");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/station", stationRoutes);

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Enterprise FuelPass Server running securely on port ${PORT}`);
});