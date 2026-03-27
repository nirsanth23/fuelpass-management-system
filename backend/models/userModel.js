const db = require("../config/db");
const QUERY_TIMEOUT_MS = 5000;

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

const getUserWithVehicleAndQuota = (userId, vehicleNumber = null) =>
  new Promise((resolve, reject) => {
    let query = `
      SELECT u.id, u.email, v.id as vehicle_id, v.vehicle_type, v.fuel_type, v.vehicle_number, v.chassis_no, v.reserved_until,
             (SELECT SUM(amount) FROM fuel_transactions 
              WHERE vehicle_id = v.id AND created_at >= DATE_SUB(NOW(), INTERVAL (DAYOFWEEK(NOW()) + 4) % 7 DAY)) as used_fuel,
             DATE_SUB(NOW(), INTERVAL (DAYOFWEEK(NOW()) + 4) % 7 DAY) as week_start,
             DATE_ADD(DATE_SUB(NOW(), INTERVAL (DAYOFWEEK(NOW()) + 4) % 7 DAY), INTERVAL 6 DAY) as week_end
      FROM users u
      LEFT JOIN vehicles v ON u.id = v.user_id
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
