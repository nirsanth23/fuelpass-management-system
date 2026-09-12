/**
 * @file stationModel.js
 * @description Data access layer and ACID transactional operations for fuel stations, stock management, and dispensing.
 * @module models/stationModel
 */

const db = require("../config/db");

/**
 * Retrieve station record by station unique identifier.
 * @param {string} stationId - Unique station identifier (e.g. ST001).
 * @returns {Promise<object|null>} Station record.
 */
const findStationById = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM fuel_stations WHERE station_id = ?";
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

/**
 * Update the hashed password for a station operator.
 * @param {string} stationId - Station identifier.
 * @param {string} newPassword - Bcrypt hashed password string.
 * @returns {Promise<object>} Query execution results.
 */
const updateStationPassword = (stationId, newPassword) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE fuel_stations SET password = ? WHERE station_id = ?";
    db.query(query, [newPassword, stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Fetch real-time dashboard telemetry stats (stock levels, today's issuances, customer count).
 * @param {string} stationId - Station identifier.
 * @returns {Promise<{petrol_stock: number, diesel_stock: number, petrol_issued_today: number, diesel_issued_today: number, customers_today: number}>}
 */
const getStationDashboardStats = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        s.petrol_stock, 
        s.diesel_stock,
        COALESCE(SUM(CASE WHEN t.fuel_type = 'Petrol' AND DATE(t.created_at) = CURDATE() THEN t.amount ELSE 0 END), 0) as petrol_issued_today,
        COALESCE(SUM(CASE WHEN t.fuel_type = 'Diesel' AND DATE(t.created_at) = CURDATE() THEN t.amount ELSE 0 END), 0) as diesel_issued_today,
        COUNT(CASE WHEN DATE(t.created_at) = CURDATE() THEN t.id ELSE NULL END) as customers_today
      FROM fuel_stations s
      LEFT JOIN fuel_transactions t ON s.station_id = t.station_id
      WHERE s.station_id = ?
      GROUP BY s.station_id
    `;
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || { petrol_stock: 0, diesel_stock: 0, petrol_issued_today: 0, diesel_issued_today: 0, customers_today: 0 });
    });
  });
};

/**
 * Retrieve transaction history for a station on a given date.
 * @param {string} stationId - Station identifier.
 * @param {string} date - Date string in YYYY-MM-DD format.
 * @returns {Promise<Array<object>>} List of transactions.
 */
const getStationTransactions = (stationId, date) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        DATE_FORMAT(t.created_at, '%Y-%m-%d %H:%i') as date,
        v.vehicle_number,
        v.vehicle_type,
        t.fuel_type,
        t.amount as fuel_amount,
        u.email as customer_email
      FROM fuel_transactions t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.station_id = ? AND DATE(t.created_at) = ?
      ORDER BY t.created_at DESC
    `;
    db.query(query, [stationId, date], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Retrieve supply delivery history for a station.
 * @param {string} stationId - Station identifier.
 * @returns {Promise<Array<object>>} List of fuel supply records.
 */
const getStationSupplies = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        id,
        reference_no,
        petrol_amount,
        diesel_amount,
        DATE_FORMAT(supplied_at, '%Y-%m-%d %H:%i') as date
      FROM fuel_supply_history
      WHERE station_id = ?
      ORDER BY supplied_at DESC
    `;
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Atomically records fuel supply delivery batch and increases inventory.
 * @param {string} stationId - Station identifier.
 * @param {number} petrol - Petrol amount in Liters.
 * @param {number} diesel - Diesel amount in Liters.
 * @param {string} referenceNo - Unique delivery reference number.
 * @param {Date|string} suppliedAt - Delivery timestamp.
 * @returns {Promise<object>} Insertion results.
 */
const addStationSupply = (stationId, petrol, diesel, referenceNo, suppliedAt) => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, conn) => {
      if (err) return reject(err);

      conn.beginTransaction((txErr) => {
        if (txErr) {
          conn.release();
          return reject(txErr);
        }

        const q1 = "INSERT INTO fuel_supply_history (station_id, reference_no, petrol_amount, diesel_amount, supplied_at) VALUES (?, ?, ?, ?, ?)";
        conn.query(q1, [stationId, referenceNo, petrol, diesel, suppliedAt], (err1, results) => {
          if (err1) {
            return conn.rollback(() => {
              conn.release();
              reject(err1);
            });
          }

          const q2 = "UPDATE fuel_stations SET petrol_stock = petrol_stock + ?, diesel_stock = diesel_stock + ? WHERE station_id = ?";
          conn.query(q2, [petrol, diesel, stationId], (err2) => {
            if (err2) {
              return conn.rollback(() => {
                conn.release();
                reject(err2);
              });
            }

            conn.commit((err3) => {
              if (err3) {
                return conn.rollback(() => {
                  conn.release();
                  reject(err3);
                });
              }
              conn.release();
              resolve(results);
            });
          });
        });
      });
    });
  });
};

/**
 * Retrieve station profile details (name, location, phone, email).
 * @param {string} stationId - Station identifier.
 * @returns {Promise<object|null>} Station profile details.
 */
const getStationProfile = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT station_id, name, location, phone_number, email FROM fuel_stations WHERE station_id = ?";
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

/**
 * Update station profile details.
 * @param {string} stationId - Station identifier.
 * @param {object} profileData - Profile details object.
 * @returns {Promise<object>} Query execution results.
 */
const updateStationProfile = (stationId, profileData) => {
  return new Promise((resolve, reject) => {
    const { name, location, phone_number, email } = profileData;
    const query = "UPDATE fuel_stations SET name = ?, location = ?, phone_number = ?, email = ? WHERE station_id = ?";
    db.query(query, [name, location, phone_number, email, stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Generate sequential supply reference number for the current date.
 * @param {string} stationId - Station identifier.
 * @returns {Promise<string>} Next reference number (e.g. SUP-ST001-20260912-001).
 */
const getNextSupplyReferenceNo = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT COUNT(*) as count 
      FROM fuel_supply_history 
      WHERE station_id = ? AND DATE(supplied_at) = CURDATE()
    `;
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      const count = (results && results[0]?.count) || 0;
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const dateStr = `${year}${month}${day}`;
      const seq = String(count + 1).padStart(3, "0");
      resolve(`SUP-${stationId}-${dateStr}-${seq}`);
    });
  });
};

/**
 * Atomically dispenses fuel with row locking (FOR UPDATE) across station stock,
 * verifies remaining weekly quota for the vehicle, deducts inventory, and records transaction.
 * @param {object} params - Dispense parameters.
 * @param {string} params.stationId - Station identifier.
 * @param {string} params.vehicleNumber - Vehicle license plate number.
 * @param {string} params.fuelType - Petrol or Diesel.
 * @param {number} params.amount - Amount in liters.
 * @returns {Promise<{transactionId: number, dispensedAmount: number, remainingQuota: number, remainingStock: number}>}
 */
const dispenseFuel = ({ stationId, vehicleNumber, fuelType, amount }) => {
  return new Promise((resolve, reject) => {
    db.getConnection((err, conn) => {
      if (err) return reject(err);

      conn.beginTransaction((txErr) => {
        if (txErr) {
          conn.release();
          return reject(txErr);
        }

        // 1. Lock station stock row for update to prevent concurrent race condition deductions
        const stockCol = fuelType.toLowerCase() === "petrol" ? "petrol_stock" : "diesel_stock";
        const lockStationQuery = `SELECT ${stockCol} AS available_stock FROM fuel_stations WHERE station_id = ? FOR UPDATE`;

        conn.query(lockStationQuery, [stationId], (errStation, stationRows) => {
          if (errStation || !stationRows || stationRows.length === 0) {
            return conn.rollback(() => {
              conn.release();
              reject(errStation || new Error("Station not found"));
            });
          }

          const currentStock = parseFloat(stationRows[0].available_stock) || 0;
          if (currentStock < amount) {
            return conn.rollback(() => {
              conn.release();
              reject(new Error(`Insufficient fuel stock at station. Available: ${currentStock}L, Requested: ${amount}L`));
            });
          }

          // 2. Lock vehicle record and check weekly quota usage
          const quotaQuery = `
            SELECT v.id AS vehicle_id, v.user_id,
                   COALESCE(fqr.weekly_limit, 20.00) AS weekly_limit,
                   COALESCE((
                     SELECT SUM(amount) FROM fuel_transactions 
                     WHERE vehicle_id = v.id AND created_at >= DATE_SUB(NOW(), INTERVAL (DAYOFWEEK(NOW()) + 4) % 7 DAY)
                   ), 0) AS used_quota
            FROM vehicles v
            LEFT JOIN fuel_quota_rules fqr ON LOWER(REPLACE(fqr.vehicle_type, ' ', '')) = LOWER(REPLACE(v.vehicle_type, ' ', ''))
            WHERE v.vehicle_number = ?
            FOR UPDATE
          `;

          conn.query(quotaQuery, [vehicleNumber], (errQuota, quotaRows) => {
            if (errQuota || !quotaRows || quotaRows.length === 0) {
              return conn.rollback(() => {
                conn.release();
                reject(errQuota || new Error("Vehicle not registered in the system"));
              });
            }

            const vehicleInfo = quotaRows[0];
            const remainingQuota = parseFloat(vehicleInfo.weekly_limit) - parseFloat(vehicleInfo.used_quota);

            if (amount > remainingQuota) {
              return conn.rollback(() => {
                conn.release();
                reject(new Error(`Requested amount (${amount}L) exceeds remaining weekly quota (${remainingQuota.toFixed(2)}L)`));
              });
            }

            // 3. Atomically deduct station stock
            const updateStockQuery = `UPDATE fuel_stations SET ${stockCol} = ${stockCol} - ? WHERE station_id = ?`;
            conn.query(updateStockQuery, [amount, stationId], (errUpdate) => {
              if (errUpdate) {
                return conn.rollback(() => {
                  conn.release();
                  reject(errUpdate);
                });
              }

              // 4. Record transaction entry
              const insertTxQuery = `
                INSERT INTO fuel_transactions (station_id, vehicle_id, user_id, fuel_type, amount)
                VALUES (?, ?, ?, ?, ?)
              `;
              conn.query(insertTxQuery, [stationId, vehicleInfo.vehicle_id, vehicleInfo.user_id, fuelType, amount], (errTx, txResult) => {
                if (errTx) {
                  return conn.rollback(() => {
                    conn.release();
                    reject(errTx);
                  });
                }

                // 5. Commit atomic transaction
                conn.commit((commitErr) => {
                  if (commitErr) {
                    return conn.rollback(() => {
                      conn.release();
                      reject(commitErr);
                    });
                  }
                  conn.release();
                  resolve({
                    transactionId: txResult.insertId,
                    dispensedAmount: amount,
                    remainingQuota: remainingQuota - amount,
                    remainingStock: currentStock - amount
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

module.exports = {
  findStationById,
  updateStationPassword,
  getStationDashboardStats,
  getStationTransactions,
  getStationSupplies,
  addStationSupply,
  getStationProfile,
  updateStationProfile,
  getNextSupplyReferenceNo,
  dispenseFuel
};
