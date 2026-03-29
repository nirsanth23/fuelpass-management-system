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
    console.log("Vehicles table created/verified.");

    const createFuelStationsTable = `
      CREATE TABLE IF NOT EXISTS fuel_stations (
        station_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100),
        location VARCHAR(100),
        password VARCHAR(255) NOT NULL,
        status ENUM('Active', 'Inactive') DEFAULT 'Active',
        petrol_stock DECIMAL(10, 2) DEFAULT 0,
        diesel_stock DECIMAL(10, 2) DEFAULT 0,
        last_supplied_date DATE,
        last_supplied_petrol DECIMAL(10, 2) DEFAULT 0,
        last_supplied_diesel DECIMAL(10, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await new Promise((resolve, reject) => {
      db.query(createFuelStationsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const addColumnIfNotExists = async (table, column, definition) => {
      const checkQuery = `SHOW COLUMNS FROM ${table} LIKE '${column}'`;
      const result = await new Promise((resolve, reject) => {
        db.query(checkQuery, (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });

      if (result.length === 0) {
        console.log(`Adding column ${column} to ${table}...`);
        await new Promise((resolve, reject) => {
          db.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }
    };

    await addColumnIfNotExists('fuel_stations', 'name', 'VARCHAR(100)');
    await addColumnIfNotExists('fuel_stations', 'location', 'VARCHAR(100)');
    await addColumnIfNotExists('fuel_stations', 'status', "ENUM('Active', 'Inactive') DEFAULT 'Active'");
    await addColumnIfNotExists('fuel_stations', 'petrol_stock', 'DECIMAL(10, 2) DEFAULT 0');
    await addColumnIfNotExists('fuel_stations', 'diesel_stock', 'DECIMAL(10, 2) DEFAULT 0');
    await addColumnIfNotExists('fuel_stations', 'last_supplied_date', 'DATE');
    await addColumnIfNotExists('fuel_stations', 'last_supplied_petrol', 'DECIMAL(10, 2) DEFAULT 0');
    await addColumnIfNotExists('fuel_stations', 'last_supplied_diesel', 'DECIMAL(10, 2) DEFAULT 0');
    console.log("Fuel stations table columns checked/added.");

    const createFuelQuotaRulesTable = `
      CREATE TABLE IF NOT EXISTS fuel_quota_rules (
        vehicle_type VARCHAR(50) PRIMARY KEY,
        weekly_limit DECIMAL(10, 2) NOT NULL,
        carry_forward_limit DECIMAL(10, 2) NOT NULL
      );
    `;

    await new Promise((resolve, reject) => {
      db.query(createFuelQuotaRulesTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Fuel quota rules table created.");

    const seedQuotaRules = async () => {
      const rules = [
        ['Bike', 5, 2],
        ['Car', 20, 5],
        ['Three Wheeler', 8, 2],
        ['Van', 15, 3]
      ];
      for (const [type, weekly, carry] of rules) {
        await new Promise((resolve) => {
          db.query('INSERT IGNORE INTO fuel_quota_rules (vehicle_type, weekly_limit, carry_forward_limit) VALUES (?, ?, ?)', [type, weekly, carry], () => resolve());
        });
      }
    };
    await seedQuotaRules();
    console.log("Quota rules seeded.");

    const createFuelTransactionsTable = `
      CREATE TABLE IF NOT EXISTS fuel_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        vehicle_id INT,
        station_id VARCHAR(50),
        fuel_type VARCHAR(20),
        amount DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (station_id) REFERENCES fuel_stations(station_id) ON DELETE SET NULL
      );
    `;

    await new Promise((resolve, reject) => {
      db.query(createFuelTransactionsTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    await addColumnIfNotExists('fuel_transactions', 'vehicle_id', 'INT');
    await addColumnIfNotExists('fuel_transactions', 'station_id', 'VARCHAR(50)');
    await addColumnIfNotExists('fuel_transactions', 'fuel_type', 'VARCHAR(20)');
    console.log("Fuel transactions table columns checked/added.");

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

    const createSupplyHistoryTable = `
      CREATE TABLE IF NOT EXISTS fuel_supply_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        station_id VARCHAR(50),
        petrol_amount DECIMAL(10, 2) NOT NULL,
        diesel_amount DECIMAL(10, 2) NOT NULL,
        supplied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (station_id) REFERENCES fuel_stations(station_id) ON DELETE CASCADE
      );
    `;
    await new Promise((resolve, reject) => {
      db.query(createSupplyHistoryTable, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log("Fuel supply history table created.");

    const seedFuelStations = async () => {
      // Clear existing stations to ensure we have exactly the set we want
      await new Promise((resolve) => {
        db.query('DELETE FROM fuel_stations', () => resolve());
      });

      // 25 stations, matching the IDs and names from seed_stations.js
      const stations = [
        ['ST001', 'Lanka IOC - Kollupitiya', 'Kollupitiya, Colombo 03'],
        ['ST002', 'Ceypetco - Bambalapitiya', 'Bambalapitiya, Colombo 04'],
        ['ST003', 'Lanka IOC - Borella', 'Borella, Colombo 08'],
        ['ST004', 'Ceypetco - Maradana', 'Maradana, Colombo 10'],
        ['ST005', 'Lanka IOC - Wellawatte', 'Wellawatte, Colombo 06'],
        ['ST006', 'Ceypetco - Dehiwala', 'Dehiwala, Colombo'],
        ['ST007', 'Lanka IOC - Nugegoda', 'Nugegoda, Colombo'],
        ['ST008', 'Ceypetco - Rajagiriya', 'Rajagiriya, Colombo'],
        ['ST009', 'Lanka IOC - Battaramulla', 'Battaramulla, Colombo'],
        ['ST010', 'Ceypetco - Kottawa', 'Kottawa, Colombo'],
        ['ST011', 'Lanka IOC - Maharagama', 'Maharagama, Colombo'],
        ['ST012', 'Ceypetco - Piliyandala', 'Piliyandala, Colombo'],
        ['ST013', 'Lanka IOC - Moratuwa', 'Moratuwa, Colombo'],
        ['ST014', 'Ceypetco - Mount Lavinia', 'Mount Lavinia, Colombo'],
        ['ST015', 'Lanka IOC - Kaduwela', 'Kaduwela, Colombo'],
        ['ST016', 'Ceypetco - Malabe', 'Malabe, Colombo'],
        ['ST017', 'Lanka IOC - Nawala', 'Nawala, Colombo'],
        ['ST018', 'Ceypetco - Kiribathgoda', 'Kiribathgoda, Colombo'],
        ['ST019', 'Lanka IOC - Kelaniya', 'Kelaniya, Colombo'],
        ['ST020', 'Ceypetco - Kadawatha', 'Kadawatha, Colombo'],
        ['ST021', 'Lanka IOC - Athurugiriya', 'Athurugiriya, Colombo'],
        ['ST022', 'Ceypetco - Homagama', 'Homagama, Colombo'],
        ['ST023', 'Lanka IOC - Pannipitiya', 'Pannipitiya, Colombo'],
        ['ST024', 'Ceypetco - Pettah', 'Pettah, Colombo 11'],
        ['ST025', 'Lanka IOC - Fort', 'Fort, Colombo 01']
      ];

      // Give each station some default values for the other columns
      for (let i = 0; i < stations.length; i++) {
        const [id, name, loc] = stations[i];
        const pass = '12345';
        const status = 'Active';
        const p_stock = 3000 + (i * 50); // Just for variety
        const d_stock = 2000 + (i * 40);
        const l_date = `2026-03-2${(i % 9) + 1}`; // Dates 21-29
        const l_petrol = 1000 + (i * 10);
        const l_diesel = 800 + (i * 8);
        await new Promise((resolve) => {
          db.query(`INSERT INTO fuel_stations (station_id, name, location, password, status, petrol_stock, diesel_stock, last_supplied_date, last_supplied_petrol, last_supplied_diesel) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, name, loc, pass, status, p_stock, d_stock, l_date, l_petrol, l_diesel], () => resolve());
        });
      }
    };
    await seedFuelStations();
    console.log("10 Colombo fuel stations seeded.");

    const seedSupplyHistory = async () => {
      // Generate supply history for all 25 stations, 3 records each
      const history = [];
      for (let i = 1; i <= 25; i++) {
        const stationId = `ST${String(i).padStart(3, '0')}`;
        // 3 supply records per station, spaced out in March 2026
        history.push([stationId, 1000 + (i * 10), 800 + (i * 8), `2026-03-05 09:00:00`]);
        history.push([stationId, 1200 + (i * 12), 900 + (i * 7), `2026-03-15 14:30:00`]);
        history.push([stationId, 1100 + (i * 11), 850 + (i * 9), `2026-03-25 11:45:00`]);
      }
      for (const [id, petrol, diesel, date] of history) {
        await new Promise((resolve) => {
          db.query('INSERT IGNORE INTO fuel_supply_history (station_id, petrol_amount, diesel_amount, supplied_at) VALUES (?, ?, ?, ?)', [id, petrol, diesel, date], () => resolve());
        });
      }
    };
    await seedSupplyHistory();
    console.log("Initial supply history seeded.");

    console.log("Migration finished successfully.");
    process.exit(0);

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

migrate();
