const assert = require("assert");
const jwt = require("jsonwebtoken");
const {
  requireAuth,
  requireAdminAuth,
  requireStationAuth,
} = require("../../middleware/authToken");

const JWT_SECRET = process.env.JWT_SECRET || "fuelpass_super_secret_jwt_key_2026";
process.env.JWT_SECRET = JWT_SECRET;

const createMockReqRes = (authHeader = "") => {
  const req = {
    headers: { authorization: authHeader },
  };
  let responseData = null;
  let responseStatus = 200;
  let isNextCalled = false;

  const res = {
    status: (code) => {
      responseStatus = code;
      return {
        json: (data) => {
          responseData = data;
        },
      };
    },
  };

  const next = () => {
    isNextCalled = true;
  };

  return { req, res, next, getResult: () => ({ status: responseStatus, data: responseData, nextCalled: isNextCalled }) };
};

console.log("▶ Testing RBAC Token Authentication Middleware (requireAuth, Admin, Station)...");

// 1. requireAuth - Missing Token
const mock1 = createMockReqRes("");
requireAuth(mock1.req, mock1.res, mock1.next);
assert.strictEqual(mock1.getResult().status, 401, "Missing token must return 401");
assert.strictEqual(mock1.getResult().nextCalled, false, "next() must not be called on missing token");

// 2. requireAuth - Valid Citizen Token
const citizenToken = jwt.sign({ userId: 1, email: "user@test.com", role: "citizen" }, JWT_SECRET);
const mock2 = createMockReqRes(`Bearer ${citizenToken}`);
requireAuth(mock2.req, mock2.res, mock2.next);
assert.strictEqual(mock2.getResult().nextCalled, true, "Valid token must call next()");
assert.strictEqual(mock2.req.user.role, "citizen", "User role must be populated in req.user");

// 3. requireAdminAuth - Citizen Token Blocked
const mock3 = createMockReqRes(`Bearer ${citizenToken}`);
requireAdminAuth(mock3.req, mock3.res, mock3.next);
assert.strictEqual(mock3.getResult().status, 403, "Citizen role must be rejected with 403 on admin routes");
assert.strictEqual(mock3.getResult().nextCalled, false, "next() must not be called when role is not admin");

// 4. requireAdminAuth - Admin Token Allowed
const adminToken = jwt.sign({ userId: "admin", role: "admin" }, JWT_SECRET);
const mock4 = createMockReqRes(`Bearer ${adminToken}`);
requireAdminAuth(mock4.req, mock4.res, mock4.next);
assert.strictEqual(mock4.getResult().nextCalled, true, "Admin token must pass requireAdminAuth");

// 5. requireStationAuth - Citizen/Admin Token Blocked
const mock5 = createMockReqRes(`Bearer ${citizenToken}`);
requireStationAuth(mock5.req, mock5.res, mock5.next);
assert.strictEqual(mock5.getResult().status, 403, "Non-station role must be rejected on station routes");

// 6. requireStationAuth - Station Token Allowed
const stationToken = jwt.sign({ stationId: "ST001", role: "station" }, JWT_SECRET);
const mock6 = createMockReqRes(`Bearer ${stationToken}`);
requireStationAuth(mock6.req, mock6.res, mock6.next);
assert.strictEqual(mock6.getResult().nextCalled, true, "Station token must pass requireStationAuth");

// 7. Expired / Forged Token Rejection
const forgedMock = createMockReqRes("Bearer invalid_forged_token_123");
requireAuth(forgedMock.req, forgedMock.res, forgedMock.next);
assert.strictEqual(forgedMock.getResult().status, 401, "Forged token must return 401 Invalid token");

console.log("  ✔ All RBAC Token Middleware Tests Passed (7/7)");
