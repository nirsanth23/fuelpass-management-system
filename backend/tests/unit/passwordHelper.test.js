const assert = require("assert");
const { hashPassword, comparePassword } = require("../../utils/passwordHelper");

async function runPasswordTests() {
  console.log("▶ Testing Password Hashing & Legacy Auto-Rehash (bcryptjs)...");

  const plainPass = "StationPass@123";

  // Test 1: Bcrypt Hash Generation
  const hash = await hashPassword(plainPass);
  assert.strictEqual(typeof hash, "string", "Hash must be a string");
  assert.ok(hash.startsWith("$2"), "Hash must be in valid bcrypt format ($2a$ or $2b$)");

  // Test 2: Valid Password Verification
  const matchResult = await comparePassword(plainPass, hash);
  assert.strictEqual(matchResult.isMatch, true, "Correct password must match hash");
  assert.strictEqual(matchResult.needsRehash, false, "Valid bcrypt hash does not need rehashing");

  // Test 3: Wrong Password Rejection
  const wrongResult = await comparePassword("WrongPassword", hash);
  assert.strictEqual(wrongResult.isMatch, false, "Wrong password must not match hash");

  // Test 4: Backward Compatibility for Legacy Plaintext Passwords
  const legacyResult = await comparePassword("legacy123", "legacy123");
  assert.strictEqual(legacyResult.isMatch, true, "Legacy plaintext password must match");
  assert.strictEqual(legacyResult.needsRehash, true, "Legacy plaintext password must trigger rehashing");

  console.log("  ✔ All Password Hashing Tests Passed (4/4)");
}

runPasswordTests().catch((err) => {
  console.error("❌ Password Tests Failed:", err);
  process.exit(1);
});
