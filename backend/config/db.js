const mysql = require("mysql2");

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fuelpass",
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  connectTimeout: 10000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

// Enable SSL if running against cloud databases (e.g. Aiven, TiDB, PlanetScale, AWS RDS)
if (process.env.DB_SSL === "true" || process.env.DB_SSL === "1") {
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
}

const db = mysql.createPool(dbConfig);

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message || err.code || err);
    return;
  }

  connection.release();
  console.log(`MySQL connected successfully to database '${dbConfig.database}' on ${dbConfig.host}:${dbConfig.port}`);
});

module.exports = db;