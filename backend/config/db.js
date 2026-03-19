const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 5000,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err.message);
    return;
  }

  connection.release();
  console.log("MySQL connected");
});

module.exports = db;