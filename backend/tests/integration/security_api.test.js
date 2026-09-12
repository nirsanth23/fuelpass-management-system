const http = require("http");
const assert = require("assert");

const PORT = process.env.PORT || 5050;

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

async function runIntegrationTests() {
  console.log("▶ Testing Security & API Integration (Health, Helmet, RBAC, Lockout)...");

  // Test 1: Health Check Endpoint
  const health = await get("/api/health");
  assert.strictEqual(health.status, 200, "/api/health must return 200 OK");
  assert.strictEqual(health.data.status, "healthy", "System status must be healthy");

  // Test 2: Helmet Security Headers
  const root = await get("/");
  assert.strictEqual(root.headers["x-content-type-options"], "nosniff", "Helmet nosniff header must be present");
  assert.strictEqual(root.headers["x-frame-options"], "SAMEORIGIN", "Helmet SAMEORIGIN header must be present");

  // Test 3: Admin RBAC Protection
  const unauthStats = await get("/api/admin/stats");
  assert.strictEqual(unauthStats.status, 401, "Unauthenticated /api/admin/stats must return 401 Unauthorized");

  // Test 4: Admin Authentication & JWT Generation
  const adminLogin = await post("/api/admin/login", { username: "admin", password: "admin123" });
  assert.strictEqual(adminLogin.status, 200, "Valid Admin login must return 200 OK");
  assert.ok(adminLogin.data.token, "Admin login response must include JWT token");

  // Test 5: Authenticated Admin Access
  const authStats = await get("/api/admin/stats", {
    Authorization: `Bearer ${adminLogin.data.token}`,
  });
  assert.strictEqual(authStats.status, 200, "Authenticated /api/admin/stats must return 200 OK");

  // Test 6: Public Quota Rules Endpoint
  const quotaRules = await get("/api/admin/quota-rules");
  assert.strictEqual(quotaRules.status, 200, "GET /api/admin/quota-rules must be publicly accessible (200 OK)");

  // Test 7: OTP 3-Attempt Lockout Defense
  const testEmail = `test_lockout_${Date.now()}@example.com`;
  await post("/api/auth/send-otp", { email: testEmail, type: "register" });
  const a1 = await post("/api/auth/verify-otp", { email: testEmail, otp: "0000" });
  assert.strictEqual(a1.status, 400, "Attempt 1 wrong OTP must return 400");
  const a2 = await post("/api/auth/verify-otp", { email: testEmail, otp: "0001" });
  assert.strictEqual(a2.status, 400, "Attempt 2 wrong OTP must return 400");
  const a3 = await post("/api/auth/verify-otp", { email: testEmail, otp: "0002" });
  assert.strictEqual(a3.status, 400, "Attempt 3 wrong OTP must return 400 lockout message");
  const a4 = await post("/api/auth/verify-otp", { email: testEmail, otp: "0003" });
  assert.strictEqual(a4.status, 429, "Post-lockout attempts must return 429 Too Many Requests");

  console.log("  ✔ All Security & Integration Tests Passed (7/7)");
  process.exit(0);
}

runIntegrationTests().catch((err) => {
  console.error("❌ Integration Tests Failed:", err.message);
  process.exit(1);
});
