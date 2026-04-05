require("dotenv").config(); 
const express = require("express");
const cors = require("cors");

const app = express();

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const stationRoutes = require("./routes/stationRoutes");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FuelPass backend running");
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/station", stationRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});