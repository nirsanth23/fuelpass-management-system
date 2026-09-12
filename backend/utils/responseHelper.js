/**
 * Standard HTTP Success Response
 * @param {import('express').Response} res
 * @param {Object} data - Payload data or message
 * @param {number} statusCode - HTTP status (default: 200)
 */
const sendSuccess = (res, data = {}, statusCode = 200) => {
  if (typeof data === "string") {
    return res.status(statusCode).json({ success: true, message: data });
  }
  return res.status(statusCode).json({ success: true, ...data });
};

/**
 * Standard HTTP Error Response
 * @param {import('express').Response} res
 * @param {string} message - Error explanation
 * @param {number} statusCode - HTTP status (default: 400)
 */
const sendError = (res, message = "An error occurred", statusCode = 400) => {
  return res.status(statusCode).json({ success: false, message });
};

/**
 * Maps database driver errors to secure, user-friendly error messages without leaking internals
 * @param {Error} error - Database error instance
 * @returns {string} Safe error message
 */
const getDatabaseErrorMessage = (error) => {
  if (!error || !error.code) {
    return "Database error. Please try again later.";
  }

  switch (error.code) {
    case "ER_DUP_ENTRY":
      return "Duplicate entry detected. Record already exists.";
    case "ER_ACCESS_DENIED_ERROR":
      return "Database authentication failed.";
    case "ER_BAD_DB_ERROR":
      return "Configured database does not exist.";
    case "PROTOCOL_CONNECTION_LOST":
    case "ETIMEDOUT":
    case "ECONNREFUSED":
      return "Database connection timeout. Please check MySQL service status.";
    default:
      return "Internal database error occurred.";
  }
};

module.exports = {
  sendSuccess,
  sendError,
  getDatabaseErrorMessage,
};
