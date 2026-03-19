require("dotenv").config();
const db = require("./config/db");

async function migrate() {
  try {
    console.log("Starting DB migration...");
    
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nic VARCHAR(20) UNIQUE,
        first_name VARCHAR(50),
        last_name VARCHAR(50),
        address TEXT,
        phone_number VARCHAR(20),
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await new Promise((resolve, reject) => {
      db.query(createUsersTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Users table created/verified.");

    // Add columns to existing users table if they don't exist
    const alterQueries = [
      "ALTER TABLE users ADD COLUMN nic VARCHAR(20) UNIQUE;",
      "ALTER TABLE users ADD COLUMN first_name VARCHAR(50);",
      "ALTER TABLE users ADD COLUMN last_name VARCHAR(50);",
      "ALTER TABLE users ADD COLUMN address TEXT;",
      "ALTER TABLE users ADD COLUMN phone_number VARCHAR(20);"
    ];

    const createVehiclesTable = `
      CREATE TABLE IF NOT EXISTS vehicles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        vehicle_number VARCHAR(20) NOT NULL UNIQUE,
        chassis_no VARCHAR(50) NOT NULL,
        vehicle_type VARCHAR(50) NOT NULL,
        fuel_type VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    
    await new Promise((resolve, reject) => {
      db.query(createVehiclesTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Vehicles table created/verified.");

    const createNotificationsTable = `
      CREATE TABLE IF NOT EXISTS admin_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type VARCHAR(50) NOT NULL,
        station_username VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone_number VARCHAR(20) NOT NULL,
        status ENUM('pending', 'resolved') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await new Promise((resolve, reject) => {
      db.query(createNotificationsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Admin notifications table created/verified.");

    console.log("Migration finished successfully.");
    process.exit(0);

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
