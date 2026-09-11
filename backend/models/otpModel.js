const db = require("../config/db");
const QUERY_TIMEOUT_MS = 5000;

const deleteOtpsByEmail = (email) =>
  new Promise((resolve, reject) => {
    db.query(
      { sql: "DELETE FROM user_otps WHERE email = ?", timeout: QUERY_TIMEOUT_MS },
      [email],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });

const createOtp = (email, otp, expiresAt) =>
  new Promise((resolve, reject) => {
    const query = `
      INSERT INTO user_otps (email, otp, expires_at, failed_attempts)
      VALUES (?, ?, ?, 0)
    `;

    db.query(
      { sql: query, timeout: QUERY_TIMEOUT_MS },
      [email, otp, expiresAt],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });

const findLatestActiveOtpByEmail = (email) =>
  new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM user_otps
      WHERE email = ? AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    db.query(
      { sql: query, timeout: QUERY_TIMEOUT_MS },
      [email],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });

const incrementFailedAttempts = (id) =>
  new Promise((resolve, reject) => {
    const query = `
      UPDATE user_otps
      SET failed_attempts = failed_attempts + 1
      WHERE id = ?
    `;

    db.query(
      { sql: query, timeout: QUERY_TIMEOUT_MS },
      [id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });

const findValidOtp = (email, otp) =>
  new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM user_otps
      WHERE email = ? AND otp = ? AND expires_at > NOW() AND failed_attempts < 3
      ORDER BY created_at DESC
      LIMIT 1
    `;

    db.query(
      { sql: query, timeout: QUERY_TIMEOUT_MS },
      [email, otp],
      (err, results) => {
        if (err) return reject(err);
        resolve(results[0] || null);
      }
    );
  });

const deleteOtpById = (id) =>
  new Promise((resolve, reject) => {
    db.query(
      { sql: "DELETE FROM user_otps WHERE id = ?", timeout: QUERY_TIMEOUT_MS },
      [id],
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
  });

module.exports = {
  deleteOtpsByEmail,
  createOtp,
  findLatestActiveOtpByEmail,
  incrementFailedAttempts,
  findValidOtp,
  deleteOtpById,
};
