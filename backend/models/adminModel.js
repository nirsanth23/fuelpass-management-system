/**
 * @file adminModel.js
 * @description Data access layer for administrative operations, station provisioning, fuel quota rule management, notifications, and analytics.
 * @module models/adminModel
 */

const db = require("../config/db");

/**
 * Delete a fuel station record by stationId.
 * @param {string} stationId - Unique station identifier.
 * @returns {Promise<object>} Query execution results.
 */
const deleteStation = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM fuel_stations WHERE station_id = ?";
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Create an admin alert / notification entry.
 * @param {string} type - Notification category (e.g. 'Station Password Reset', 'Low Stock Alert').
 * @param {string} stationUsername - Station ID or username.
 * @param {string} email - Station contact email.
 * @param {string} phoneNumber - Station contact phone number.
 * @returns {Promise<object>} Query execution results.
 */
const createNotification = (type, stationUsername, email, phoneNumber) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO admin_notifications (type, station_username, email, phone_number)
      VALUES (?, ?, ?, ?)
    `;
    db.query(query, [type, stationUsername, email, phoneNumber], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Fetch all admin notifications ordered by timestamp descending.
 * @returns {Promise<Array<object>>} Notification list with joined station names.
 */
const getAllNotifications = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT n.*, s.name as station_name 
      FROM admin_notifications n
      LEFT JOIN fuel_stations s ON n.station_username = s.station_id
      ORDER BY n.created_at DESC
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Mark a notification as resolved.
 * @param {number} id - Notification ID.
 * @returns {Promise<object>} Query execution results.
 */
const markNotificationResolved = (id) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE admin_notifications SET status = 'resolved', resolved_at = CURRENT_TIMESTAMP WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Mark a notification as rejected.
 * @param {number} id - Notification ID.
 * @returns {Promise<object>} Query execution results.
 */
const markNotificationRejected = (id) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE admin_notifications SET status = 'rejected', resolved_at = CURRENT_TIMESTAMP WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Retrieve a specific notification by ID.
 * @param {number} id - Notification ID.
 * @returns {Promise<object|null>} Notification record.
 */
const getNotificationById = (id) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM admin_notifications WHERE id = ?";
    db.query(query, [id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

/**
 * Fetch national summary telemetry metrics (total petrol/diesel stock, active stations, today's issuances).
 * @returns {Promise<{total_petrol_stock: number, total_diesel_stock: number, active_stations: number, total_fuel_issued_today: number}>}
 */
const getDashboardStats = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        (SELECT SUM(petrol_stock) FROM fuel_stations) as total_petrol_stock,
        (SELECT SUM(diesel_stock) FROM fuel_stations) as total_diesel_stock,
        (SELECT COUNT(*) FROM fuel_stations WHERE status = 'Active') as active_stations,
        (SELECT COALESCE(SUM(amount), 0) FROM fuel_transactions WHERE DATE(created_at) = CURDATE()) as total_fuel_issued_today
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results[0]);
    });
  });
};

/**
 * Retrieve all fuel quota rules per vehicle type.
 * @returns {Promise<Array<object>>} List of quota rules.
 */
const getQuotaRules = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM fuel_quota_rules";
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Update weekly and carry-forward quota limits for a vehicle category.
 * @param {string} vehicleType - Vehicle category name.
 * @param {number} weeklyLimit - Weekly fuel limit in Liters.
 * @param {number} carryForwardLimit - Max carry forward limit in Liters.
 * @returns {Promise<object>} Query execution results.
 */
const updateQuotaRule = (vehicleType, weeklyLimit, carryForwardLimit) => {
  return new Promise((resolve, reject) => {
    const query = "UPDATE fuel_quota_rules SET weekly_limit = ?, carry_forward_limit = ? WHERE vehicle_type = ?";
    db.query(query, [weeklyLimit, carryForwardLimit, vehicleType], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Retrieve all fuel station accounts.
 * @returns {Promise<Array<object>>} List of fuel stations.
 */
const getStations = () => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM fuel_stations";
    db.query(query, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Add a new fuel station account.
 * @param {object} stationData - New station registration details.
 * @returns {Promise<object>} Query execution results.
 */
const addStation = (stationData) => {
  return new Promise((resolve, reject) => {
    const { 
      stationId, 
      name, 
      location, 
      email, 
      password, 
      petrol_stock, 
      diesel_stock, 
      last_supplied_date, 
      last_supplied_petrol, 
      last_supplied_diesel, 
      must_change_password 
    } = stationData;
    const query = `
      INSERT INTO fuel_stations 
      (station_id, name, location, email, password, petrol_stock, diesel_stock, last_supplied_date, last_supplied_petrol, last_supplied_diesel, must_change_password) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query, 
      [
        stationId, 
        name, 
        location, 
        email || "station@fuelpass.lk", 
        password, 
        petrol_stock || 0, 
        diesel_stock || 0, 
        last_supplied_date || null, 
        last_supplied_petrol || 0, 
        last_supplied_diesel || 0, 
        must_change_password !== undefined ? must_change_password : 1
      ], 
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });
};

/**
 * Update existing station details dynamically.
 * @param {string} stationId - Target station identifier.
 * @param {object} updateData - Key-value pair of fields to update.
 * @returns {Promise<object>} Query execution results.
 */
const updateStation = (stationId, updateData) => {
  return new Promise((resolve, reject) => {
    const fields = Object.keys(updateData).map((key) => `${key} = ?`).join(", ");
    const values = [...Object.values(updateData), stationId];
    const query = `UPDATE fuel_stations SET ${fields} WHERE station_id = ?`;
    db.query(query, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Aggregate national analytics data (daily trends, fuel breakdown, top stations, low stock warnings).
 * @returns {Promise<{dailyUsage: Array, fuelTypeUsage: Array, activeStations: Array, lowStockStations: Array}>}
 */
const getAnalyticsData = () => {
  return new Promise((resolve, reject) => {
    const queries = {
      dailyUsage: `
        SELECT d.date,
          COALESCE(SUM(CASE WHEN t.fuel_type = 'Petrol' THEN t.amount ELSE 0 END), 0) as petrol,
          COALESCE(SUM(CASE WHEN t.fuel_type = 'Diesel' THEN t.amount ELSE 0 END), 0) as diesel
        FROM (
          SELECT CURDATE() as date
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 1 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 2 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 3 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 4 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 5 DAY)
          UNION ALL SELECT DATE_SUB(CURDATE(), INTERVAL 6 DAY)
        ) d
        LEFT JOIN fuel_transactions t ON DATE(t.created_at) = d.date
        GROUP BY d.date
        ORDER BY d.date ASC
      `,
      fuelTypeUsage: "SELECT fuel_type, SUM(amount) as total FROM fuel_transactions GROUP BY fuel_type",
      activeStations: `SELECT s.name, SUM(t.amount) as total_fuel
        FROM fuel_transactions t
        JOIN fuel_stations s ON t.station_id = s.station_id
        WHERE t.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        GROUP BY s.station_id
        ORDER BY total_fuel DESC
        LIMIT 5`,
      lowStockStations: "SELECT station_id, name as station_name, location, petrol_stock, diesel_stock, status FROM fuel_stations WHERE petrol_stock <= 1000 OR diesel_stock <= 1000 ORDER BY LEAST(petrol_stock, diesel_stock) ASC LIMIT 15"
    };

    const results = {};
    const keys = Object.keys(queries);
    let completed = 0;

    keys.forEach((key) => {
      db.query(queries[key], (err, data) => {
        if (err) return reject(err);
        results[key] = data;
        completed++;
        if (completed === keys.length) resolve(results);
      });
    });
  });
};

/**
 * Record a supply log batch entry.
 * @param {string} stationId - Station identifier.
 * @param {number} petrol - Petrol amount in Liters.
 * @param {number} diesel - Diesel amount in Liters.
 * @returns {Promise<object>} Query execution results.
 */
const recordSupplyHistory = (stationId, petrol, diesel) => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO fuel_supply_history (station_id, petrol_amount, diesel_amount) VALUES (?, ?, ?)";
    db.query(query, [stationId, petrol, diesel], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Retrieve supply delivery history for a station.
 * @param {string} stationId - Station identifier.
 * @returns {Promise<Array<object>>} Supply history list.
 */
const getStationHistory = (stationId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM fuel_supply_history WHERE station_id = ? ORDER BY supplied_at DESC";
    db.query(query, [stationId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Add a new vehicle category quota rule.
 * @param {string} vehicleType - Vehicle category name.
 * @param {number} weeklyLimit - Weekly fuel quota.
 * @param {number} carryForwardLimit - Carry forward quota.
 * @param {string} [category] - Vehicle category grouping.
 * @returns {Promise<object>} Query execution results.
 */
const addQuotaRule = (vehicleType, weeklyLimit, carryForwardLimit, category = "Heavy & Special Vehicles") => {
  return new Promise((resolve, reject) => {
    const query = "INSERT INTO fuel_quota_rules (vehicle_type, weekly_limit, carry_forward_limit, category) VALUES (?, ?, ?, ?)";
    db.query(query, [vehicleType, weeklyLimit, carryForwardLimit, category], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

/**
 * Delete a fuel quota rule by vehicle category.
 * @param {string} vehicleType - Vehicle category name.
 * @returns {Promise<object>} Query execution results.
 */
const deleteQuotaRule = (vehicleType) => {
  return new Promise((resolve, reject) => {
    const query = "DELETE FROM fuel_quota_rules WHERE vehicle_type = ?";
    db.query(query, [vehicleType], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

module.exports = {
  createNotification,
  getAllNotifications,
  markNotificationResolved,
  markNotificationRejected,
  getNotificationById,
  getDashboardStats,
  getSummary: getDashboardStats,
  getQuotaRules,
  updateQuotaRule,
  addQuotaRule,
  deleteQuotaRule,
  getStations,
  addStation,
  updateStation,
  getAnalyticsData,
  recordSupplyHistory,
  getStationHistory,
  deleteStation
};
