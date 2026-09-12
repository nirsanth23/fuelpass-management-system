/**
 * @file userModel.js
 * @description Data access layer for user accounts, vehicle registrations, and quota calculations.
 * @module models/userModel
 */

const db = require("../config/db");
const QUERY_TIMEOUT_MS = 5000;

/**
 * Find user record by email address.
 * @param {string} email - Email address of the user.
 * @returns {Promise<{id: number, email: string, nic: string, created_at: string}|null>}
 */
const findUserByEmail = (email) =>
  new Promise((resolve, reject) => {
    db.query(
      {
        sql: "SELECT id, email, nic, created_at FROM users WHERE email = ? LIMIT 1",
        timeout: QUERY_TIMEOUT_MS,
      },
      [email],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });

/**
 * Update user demographic information by email.
 * @param {object} userData - User demographic fields.
 * @param {string} userData.nic - National Identity Card number.
 * @param {string} userData.firstName - User's first name.
 * @param {string} userData.lastName - User's last name.
 * @param {string} userData.address - Residential address.
 * @param {string} userData.phoneNumber - Contact phone number.
 * @param {string} userData.email - User's registered email address.
 * @returns {Promise<number>} Number of affected rows.
 */
const updateUserByEmail = (userData) =>
  new Promise((resolve, reject) => {
    const { nic, firstName, lastName, address, phoneNumber, email } = userData;
    const query = `
      UPDATE users 
      SET nic = ?, first_name = ?, last_name = ?, address = ?, phone_number = ?
      WHERE email = ?
    `;
    db.query(
      { sql: query, timeout: QUERY_TIMEOUT_MS },
      [nic, firstName, lastName, address, phoneNumber, email],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows);
      }
    );
  });

/**
 * Find user record by National Identity Card (NIC).
 * @param {string} nic - User NIC number.
 * @returns {Promise<{id: number, email: string}|null>}
 */
const findUserByNic = (nic) =>
  new Promise((resolve, reject) => {
    db.query(
      {
        sql: "SELECT id, email FROM users WHERE nic = ? LIMIT 1",
        timeout: QUERY_TIMEOUT_MS,
      },
      [nic],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });

/**
 * Create a new user profile with full details.
 * @param {object} userData - Full user registration data.
 * @returns {Promise<number>} Created user ID (insertId).
 */
const createUserWithDetails = (userData) =>
  new Promise((resolve, reject) => {
    const { nic, firstName, lastName, address, phoneNumber, email } = userData;
    const query = `
      INSERT INTO users (nic, first_name, last_name, address, phone_number, email) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(
      { sql: query, timeout: QUERY_TIMEOUT_MS },
      [nic, firstName, lastName, address, phoneNumber, email],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });

/**
 * Register a vehicle linked to a specific user.
 * @param {object} vehicleData - Vehicle registration parameters.
 * @param {number} vehicleData.userId - Owning user ID.
 * @param {string} vehicleData.vehicleNumber - Vehicle license plate number.
 * @param {string} vehicleData.chassisNo - Chassis / VIN number.
 * @param {string} vehicleData.vehicleType - Vehicle category (e.g. Car, Van, Bike).
 * @param {string} vehicleData.fuelType - Fuel type (Petrol / Diesel).
 * @returns {Promise<number>} Created vehicle ID (insertId).
 */
const createVehicle = (vehicleData) =>
  new Promise((resolve, reject) => {
    const {
      userId,
      vehicleNumber,
      chassisNo,
      vehicleType,
      fuelType,
    } = vehicleData;
    const query = `
      INSERT INTO vehicles (user_id, vehicle_number, chassis_no, vehicle_type, fuel_type)
      VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
      { sql: query, timeout: QUERY_TIMEOUT_MS },
      [userId, vehicleNumber, chassisNo, vehicleType, fuelType],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      }
    );
  });

/**
 * Look up existing user by email or create a placeholder user account.
 * @param {string} email - Email address.
 * @returns {Promise<{id: number, email: string}>}
 */
const findOrCreateUserByEmail = (email) =>
  new Promise((resolve, reject) => {
    db.query(
      {
        sql: "SELECT id, email FROM users WHERE email = ? LIMIT 1",
        timeout: QUERY_TIMEOUT_MS,
      },
      [email],
      async (err, results) => {
        if (err) return reject(err);
        if (results[0]) {
          return resolve(results[0]);
        }
        try {
          const insertId = await createUserWithDetails({
            email,
            nic: null,
            firstName: null,
            lastName: null,
            address: null,
            phoneNumber: null,
          });
          resolve({ id: insertId, email });
        } catch (createErr) {
          reject(createErr);
        }
      }
    );
  });

/**
 * Retrieve all vehicles associated with a user ID.
 * @param {number} userId - User ID.
 * @returns {Promise<Array<object>>} List of vehicles.
 */
const getVehiclesByUserId = (userId) =>
  new Promise((resolve, reject) => {
    db.query(
      {
        sql: "SELECT id, vehicle_number, vehicle_type, fuel_type, chassis_no FROM vehicles WHERE user_id = ?",
        timeout: QUERY_TIMEOUT_MS,
      },
      [userId],
      (err, results) => {
        if (err) return reject(err);
        resolve(results);
      }
    );
  });

/**
 * Retrieve user details, vehicle specs, and active weekly quota calculations.
 * @param {number} userId - User ID.
 * @param {string} [vehicleNumber] - Specific vehicle number filter (optional).
 * @returns {Promise<object|null>} Complete user quota profile.
 */
const getUserWithVehicleAndQuota = (userId, vehicleNumber = null) =>
  new Promise((resolve, reject) => {
    let query = `
      SELECT u.id, u.email, u.nic, u.first_name, u.last_name, u.address, u.phone_number,
             v.id as vehicle_id, v.vehicle_type, v.fuel_type, v.vehicle_number, v.chassis_no, v.reserved_until,
             COALESCE(fqr.weekly_limit, 20.00) as weekly_limit,
             COALESCE(fqr.carry_forward_limit, 5.00) as carry_forward_limit,
             (SELECT SUM(amount) FROM fuel_transactions 
              WHERE vehicle_id = v.id AND created_at >= DATE_SUB(NOW(), INTERVAL (DAYOFWEEK(NOW()) + 4) % 7 DAY)) as used_fuel,
             DATE_SUB(NOW(), INTERVAL (DAYOFWEEK(NOW()) + 4) % 7 DAY) as week_start,
             DATE_ADD(DATE_SUB(NOW(), INTERVAL (DAYOFWEEK(NOW()) + 4) % 7 DAY), INTERVAL 6 DAY) as week_end
      FROM users u
      LEFT JOIN vehicles v ON u.id = v.user_id
      LEFT JOIN fuel_quota_rules fqr ON LOWER(REPLACE(fqr.vehicle_type, ' ', '')) = LOWER(REPLACE(v.vehicle_type, ' ', ''))
      WHERE u.id = ?
    `;

    const params = [userId];
    if (vehicleNumber) {
      query += " AND v.vehicle_number = ?";
      params.push(vehicleNumber);
    }
    query += " LIMIT 1";

    db.query({ sql: query, timeout: QUERY_TIMEOUT_MS }, params, (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });

/**
 * Update vehicle details by vehicle ID.
 * @param {number} vehicleId - Target vehicle ID.
 * @param {object} vehicleData - Updated vehicle properties.
 * @returns {Promise<number>} Affected rows count.
 */
const updateVehicleDetails = (vehicleId, vehicleData) =>
  new Promise((resolve, reject) => {
    const { vehicleNumber, chassisNo, vehicleType, fuelType } = vehicleData;
    const query = `
      UPDATE vehicles 
      SET vehicle_number = ?, chassis_no = ?, vehicle_type = ?, fuel_type = ?
      WHERE id = ?
    `;
    db.query(
      { sql: query, timeout: QUERY_TIMEOUT_MS },
      [vehicleNumber, chassisNo, vehicleType, fuelType, vehicleId],
      (err, result) => {
        if (err) return reject(err);
        resolve(result.affectedRows);
      }
    );
  });

/**
 * Sets fuel reservation expiry on a vehicle.
 * @param {number} vehicleId - Target vehicle ID.
 * @param {string|Date} reservedUntil - Reservation expiry timestamp.
 * @returns {Promise<number>} Affected rows count.
 */
const setFuelReservation = (vehicleId, reservedUntil) =>
  new Promise((resolve, reject) => {
    const query = "UPDATE vehicles SET reserved_until = ? WHERE id = ?";
    db.query({ sql: query, timeout: QUERY_TIMEOUT_MS }, [reservedUntil, vehicleId], (err, result) => {
      if (err) return reject(err);
      resolve(result.affectedRows);
    });
  });

module.exports = {
  findUserByEmail,
  createUserWithDetails,
  createVehicle,
  findOrCreateUserByEmail,
  getUserWithVehicleAndQuota,
  getVehiclesByUserId,
  findUserByNic,
  updateUserByEmail,
  updateVehicleDetails,
  setFuelReservation,
};
