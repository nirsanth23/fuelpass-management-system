/**
 * @file otpModel.js
 * @description Data access layer for one-time passcode (OTP) lifecycle, rate-limiting failed verification attempts, and expiries.
 * @module models/otpModel
 */

const db = require("../config/db");
const QUERY_TIMEOUT_MS = 5000;

/**
 * Delete all existing OTP records associated with an email address.
 * @param {string} email - User email address.
 * @returns {Promise<object>} Query execution results.
 */
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

/**
 * Persist a newly generated OTP with expiry timestamp.
 * @param {string} email - User email address.
 * @param {string} otp - 6-digit OTP passcode string.
 * @param {Date|string} expiresAt - Expiry timestamp.
 * @returns {Promise<object>} Query execution results.
 */
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

/**
 * Retrieve the most recent unexpired OTP record for an email.
 * @param {string} email - User email address.
 * @returns {Promise<object|null>} Latest active OTP record.
 */
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

/**
 * Increment the failed verification attempt counter for an OTP record.
 * @param {number} id - OTP record ID.
 * @returns {Promise<object>} Query execution results.
 */
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

/**
 * Find valid, unexpired OTP with less than 3 failed verification attempts.
 * @param {string} email - User email address.
 * @param {string} otp - Candidate OTP passcode.
 * @returns {Promise<object|null>} Valid OTP record if match found.
 */
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

/**
 * Delete a specific OTP record by ID after successful verification.
 * @param {number} id - OTP record ID.
 * @returns {Promise<object>} Query execution results.
 */
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
