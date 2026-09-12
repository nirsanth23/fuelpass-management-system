require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const http = require("http");
const assert = require("assert");
const jwt = require("jsonwebtoken");
const { signFuelPass } = require("../../utils/qrCrypto");

const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || "fuelpass_super_secret_jwt_key_2026";

const post = (path, body, headers = {}) =>
  new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
          ...headers,
        },
      },
      (res) => {
        let resData = "";
        res.on("data", (chunk) => (resData += chunk));
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(resData || "{}"),
              headers: res.headers,
            });
          } catch (e) {
            resolve({ status: res.statusCode, data: null, headers: res.headers });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(data);
    req.end();
  });

const get = (path, headers = {}) =>
  new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: "127.0.0.1",
        port: PORT,
        path,
        method: "GET",
        headers,
      },
      (res) => {
        let resData = "";
        res.on("data", (chunk) => (resData += chunk));
        res.on("end", () => {
          try {
            resolve({
              status: res.statusCode,
              data: JSON.parse(resData || "{}"),
              headers: res.headers,
            });
          } catch (e) {
            resolve({ status: res.statusCode, data: null, headers: res.headers });
          }
        });
      }
    );
    req.on("error", reject);
    req.end();
  });

async function runStationIntegrationTests() {
  console.log("▶ Testing Station Flow Integration (RBAC, QR Validation, Supply Ref)...");

  const stationToken = jwt.sign({ stationId: "ST001", role: "station" }, JWT_SECRET);
  const citizenToken = jwt.sign({ userId: 1, role: "citizen" }, JWT_SECRET);

  // 1. Unauthenticated Station Dashboard Blocked
  const unauthDash = await get("/api/station/dashboard");
  assert.strictEqual(unauthDash.status, 401, "Unauthenticated station dashboard must return 401");

  // 2. Citizen Role Blocked on Station Dashboard
  const citizenDash = await get("/api/station/dashboard", {
    Authorization: `Bearer ${citizenToken}`,
  });
  assert.strictEqual(citizenDash.status, 403, "Citizen role accessing station dashboard must return 403 Forbidden");

  // 3. Station Operator Allowed on Station Dashboard
  const stationDash = await get("/api/station/dashboard", {
    Authorization: `Bearer ${stationToken}`,
  });
  assert.strictEqual(stationDash.status, 200, "Authenticated station dashboard must return 200 OK");
  assert.ok(stationDash.data.stats, "Dashboard response must include stats");

  // 4. Next Supply Reference Number Generation
  const refRes = await get("/api/station/next-supply-ref", {
    Authorization: `Bearer ${stationToken}`,
  });
  assert.strictEqual(refRes.status, 200, "Next supply ref endpoint must return 200 OK");
  assert.ok(refRes.data.referenceNo.startsWith("SUP-ST001-"), "Ref number must follow format SUP-ST001-YYYYMMDD-XXX");

  // 5. QR Code Validation Endpoint - Genuine Cryptographic QR Pass
  const genuinePayload = { v: "CAB-1234", n: "200012345678", t: "Car", f: "Petrol" };
  const sig = signFuelPass(genuinePayload);
  const signedQrString = JSON.stringify({ ...genuinePayload, sig });

  const validateGenuine = await post(
    "/api/station/validate-qr",
    { qrPayload: signedQrString },
    { Authorization: `Bearer ${stationToken}` }
  );
  assert.strictEqual(validateGenuine.status, 200, "Genuine signed QR pass must validate with 200 OK");
  assert.strictEqual(validateGenuine.data.verified, true, "Verified status must be true");

  // 6. QR Code Validation Endpoint - Tampered QR Pass
  const tamperedQrString = JSON.stringify({ ...genuinePayload, v: "FAKE-9999", sig });
  const validateTampered = await post(
    "/api/station/validate-qr",
    { qrPayload: tamperedQrString },
    { Authorization: `Bearer ${stationToken}` }
  );
  assert.strictEqual(validateTampered.status, 400, "Tampered QR pass must return 400 Bad Request");

  console.log("  ✔ All Station Flow Integration Tests Passed (6/6)");
  process.exit(0);
}

runStationIntegrationTests().catch((err) => {
  console.error("❌ Station Flow Tests Failed:", err.message);
  process.exit(1);
});
