const bcrypt = require("bcryptjs");

/**
 * Hashes a plaintext password using bcrypt with a salt factor of 10.
 * @param {string} password - The plaintext password to hash.
 * @returns {Promise<string>} The hashed password.
 */
const hashPassword = async (password) => {
  if (!password) return "";
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password.toString(), salt);
};

/**
 * Compares a plaintext password against a stored password (which can be a bcrypt hash or legacy plaintext).
 * Handles automatic backward compatibility.
 * @param {string} plainPassword - The password entered by the user.
 * @param {string} storedPassword - The password currently in the database.
 * @returns {Promise<{ isMatch: boolean, needsRehash: boolean }>}
 */
const comparePassword = async (plainPassword, storedPassword) => {
  if (!plainPassword || !storedPassword) {
    return { isMatch: false, needsRehash: false };
  }

  const plainStr = plainPassword.toString();
  const storedStr = storedPassword.toString();

  // Check if storedPassword is a valid bcrypt hash format ($2a$, $2b$, or $2y$)
  const isBcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(storedStr);

  if (isBcryptHash) {
    const isMatch = await bcrypt.compare(plainStr, storedStr);
    return { isMatch, needsRehash: false };
  }

  // Backward compatibility: Legacy plaintext password comparison
  const isMatch = plainStr === storedStr;
  return { isMatch, needsRehash: isMatch };
};

module.exports = {
  hashPassword,
  comparePassword,
};
