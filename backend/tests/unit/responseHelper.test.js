const assert = require("assert");
const { sendSuccess, sendError, getDatabaseErrorMessage } = require("../../utils/responseHelper");

class MockResponse {
  constructor() {
    this.statusCode = 200;
    this.body = null;
  }
  status(code) {
    this.statusCode = code;
    return this;
  }
  json(data) {
    this.body = data;
    return this;
  }
}

function runTests() {
  console.log("Running Unit Tests: responseHelper.js...");

  // Test 1: sendSuccess with string message
  {
    const res = new MockResponse();
    sendSuccess(res, "Operation successful", 200);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.message, "Operation successful");
    console.log("  ✓ sendSuccess string message handled properly");
  }

  // Test 2: sendSuccess with object payload
  {
    const res = new MockResponse();
    sendSuccess(res, { token: "abc", user: { id: 1 } }, 201);
    assert.strictEqual(res.statusCode, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.token, "abc");
    console.log("  ✓ sendSuccess object payload merged properly");
  }

  // Test 3: sendError formats error response
  {
    const res = new MockResponse();
    sendError(res, "Invalid credentials", 401);
    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.success, false);
    assert.strictEqual(res.body.message, "Invalid credentials");
    console.log("  ✓ sendError sets error status and body");
  }

  // Test 4: getDatabaseErrorMessage handles known errors
  {
    assert.strictEqual(
      getDatabaseErrorMessage({ code: "ER_DUP_ENTRY" }),
      "Duplicate entry detected. Record already exists."
    );
    assert.strictEqual(
      getDatabaseErrorMessage({ code: "ECONNREFUSED" }),
      "Database connection timeout. Please check MySQL service status."
    );
    assert.strictEqual(
      getDatabaseErrorMessage({ code: "ER_ACCESS_DENIED_ERROR" }),
      "Database authentication failed."
    );
    assert.strictEqual(
      getDatabaseErrorMessage(null),
      "Database error. Please try again later."
    );
    assert.strictEqual(
      getDatabaseErrorMessage({ code: "UNKNOWN_ERR" }),
      "Internal database error occurred."
    );
    console.log("  ✓ getDatabaseErrorMessage sanitizes all error codes safely");
  }

  console.log("All responseHelper tests passed!\n");
}

if (require.main === module) {
  runTests();
}

module.exports = runTests;
