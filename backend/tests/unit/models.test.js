const assert = require("assert");
const userModel = require("../../models/userModel");
const stationModel = require("../../models/stationModel");
const adminModel = require("../../models/adminModel");
const otpModel = require("../../models/otpModel");

function runTests() {
  console.log("Running Unit Tests: Models Layer Interface Contract Tests...");

  // Test 1: userModel interface methods
  {
    const requiredMethods = [
      "findUserByEmail",
      "createUserWithDetails",
      "createVehicle",
      "findOrCreateUserByEmail",
      "getUserWithVehicleAndQuota",
      "getVehiclesByUserId",
      "findUserByNic",
      "updateUserByEmail",
      "updateVehicleDetails",
      "setFuelReservation"
    ];
    requiredMethods.forEach(method => {
      assert.strictEqual(typeof userModel[method], "function", `userModel.${method} must be a function`);
    });
    console.log("  ✓ userModel provides all 10 required data access methods");
  }

  // Test 2: stationModel interface methods
  {
    const requiredMethods = [
      "findStationById",
      "updateStationPassword",
      "getStationDashboardStats",
      "getStationTransactions",
      "getStationSupplies",
      "addStationSupply",
      "getStationProfile",
      "updateStationProfile",
      "getNextSupplyReferenceNo",
      "dispenseFuel"
    ];
    requiredMethods.forEach(method => {
      assert.strictEqual(typeof stationModel[method], "function", `stationModel.${method} must be a function`);
    });
    console.log("  ✓ stationModel provides all 10 required transactional methods");
  }

  // Test 3: adminModel interface methods
  {
    const requiredMethods = [
      "createNotification",
      "getAllNotifications",
      "markNotificationResolved",
      "markNotificationRejected",
      "getNotificationById",
      "getDashboardStats",
      "getQuotaRules",
      "updateQuotaRule",
      "addQuotaRule",
      "deleteQuotaRule",
      "getStations",
      "addStation",
      "updateStation",
      "getAnalyticsData",
      "recordSupplyHistory",
      "getStationHistory",
      "deleteStation"
    ];
    requiredMethods.forEach(method => {
      assert.strictEqual(typeof adminModel[method], "function", `adminModel.${method} must be a function`);
    });
    console.log("  ✓ adminModel provides all 17 required analytics & admin management methods");
  }

  // Test 4: otpModel interface methods
  {
    const requiredMethods = [
      "deleteOtpsByEmail",
      "createOtp",
      "findLatestActiveOtpByEmail",
      "incrementFailedAttempts",
      "findValidOtp",
      "deleteOtpById"
    ];
    requiredMethods.forEach(method => {
      assert.strictEqual(typeof otpModel[method], "function", `otpModel.${method} must be a function`);
    });
    console.log("  ✓ otpModel provides all 6 required verification & security methods");
  }

  console.log("All Model interface tests passed!\n");
}

if (require.main === module) {
  runTests();
  process.exit(0);
}

module.exports = runTests;
