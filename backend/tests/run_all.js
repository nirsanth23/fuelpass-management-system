const { spawnSync } = require("child_process");
const path = require("path");

console.log("\n=======================================================");
console.log("🚦 RUNNING FULL FUELPASS AUTOMATED TEST SUITE");
console.log("=======================================================\n");

const tests = [
  { name: "Unit Tests: QR HMAC-SHA256 Cryptography", file: "unit/qrCrypto.test.js" },
  { name: "Unit Tests: Bcrypt Password Hashing & Rehashing", file: "unit/passwordHelper.test.js" },
  { name: "Unit Tests: RBAC Token Authentication Middleware", file: "unit/authToken.test.js" },
  { name: "Unit Tests: Request Input Validation Middleware", file: "unit/validateAuthInput.test.js" },
  { name: "Unit Tests: Standard HTTP Response & Error Helpers", file: "unit/responseHelper.test.js" },
  { name: "Unit Tests: Data Access Model Interface Contracts", file: "unit/models.test.js" },
  { name: "Integration Tests: API, Health, Helmet, RBAC & OTP Lockout", file: "integration/security_api.test.js" },
  { name: "Integration Tests: Fuel Station Flow & QR Verification", file: "integration/station_flow.test.js" },
];

let totalPassed = 0;
let totalFailed = 0;

for (const test of tests) {
  const filePath = path.join(__dirname, test.file);
  const result = spawnSync("node", [filePath], { stdio: "inherit" });

  if (result.status === 0) {
    totalPassed++;
  } else {
    totalFailed++;
    console.error(`❌ Suite Failed: ${test.name}\n`);
  }
}

console.log("\n=======================================================");
console.log(`📊 TEST RESULTS: ${totalPassed} SUITES PASSED | ${totalFailed} FAILED`);
console.log("=======================================================\n");

if (totalFailed > 0) {
  process.exit(1);
} else {
  console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! (100%)\n");
  process.exit(0);
}
