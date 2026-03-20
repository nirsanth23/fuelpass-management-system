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
        reserved_until DATE,
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
    // Vehicles table changes
    const alterVehiclesQueries = [
      "ALTER TABLE vehicles ADD COLUMN reserved_until DATE;"
    ];

    for (const query of alterVehiclesQueries) {
      await new Promise((resolve) => {
        db.query(query, () => resolve()); // Ignore errors if column exists
      });
    }

    const createUserOtpsTable = `
      CREATE TABLE IF NOT EXISTS user_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp CHAR(4) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email_created (email, created_at),
        INDEX idx_email_otp (email, otp)
      );
    `;

    await new Promise((resolve, reject) => {
      db.query(createUserOtpsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("User OTPs table created/verified.");

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
    
    // Fuel Stations table
    const createFuelStationsTable = `
      CREATE TABLE IF NOT EXISTS fuel_stations (
        station_id VARCHAR(50) PRIMARY KEY,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await new Promise((resolve, reject) => {
      db.query(createFuelStationsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Fuel stations table created/verified.");

    // Seed fuel stations if empty
    const seedFuelStations = async () => {
      const stations = [
        ['station1', '1234'],
        ['station2', '2345'],
        ['station3', '12345'] // Initial default for station3
      ];
      
      for (const [id, pass] of stations) {
        await new Promise((resolve, reject) => {
          db.query('INSERT IGNORE INTO fuel_stations (station_id, password) VALUES (?, ?)', [id, pass], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    };
    
    await seedFuelStations();
    console.log("Fuel stations seeded.");

    const createFuelTransactionsTable = `
      CREATE TABLE IF NOT EXISTS fuel_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    await new Promise((resolve, reject) => {
      db.query(createFuelTransactionsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Fuel transactions table created/verified.");

    // Seed some test fuel transactions if empty
    const seedFuelTransactions = async () => {
        const checkQuery = "SELECT COUNT(*) as count FROM fuel_transactions";
        const result = await new Promise((resolve, reject) => {
            db.query(checkQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results[0].count);
            });
        });

        if (result === 0) {
            // Find a user to assign transactions to
            const userResult = await new Promise((resolve, reject) => {
                db.query("SELECT id FROM users LIMIT 1", (err, results) => {
                    if (err) reject(err);
                    else resolve(results[0]);
                });
            });

            if (userResult) {
                const userId = userResult.id;
                // Add a 3L transaction for testing (as per user request: "if he already get 3L")
                await new Promise((resolve, reject) => {
                    db.query("INSERT INTO fuel_transactions (user_id, amount) VALUES (?, ?)", [userId, 3.0], (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });
                console.log("Fuel transactions seeded with 3L for test user.");
            }
        }
    };

    await seedFuelTransactions();

    console.log("Migration finished successfully.");
    process.exit(0);

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
