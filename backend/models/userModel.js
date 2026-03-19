const db = require("../config/db");
const QUERY_TIMEOUT_MS = 5000;

const findUserByEmail = (email) =>
  new Promise((resolve, reject) => {
    db.query(
      {
        sql: "SELECT id, email, created_at FROM users WHERE email = ? LIMIT 1",
        timeout: QUERY_TIMEOUT_MS,
      },
      [email],
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

module.exports = {
  findUserByEmail,
  createUserWithDetails,
  createVehicle,
};
