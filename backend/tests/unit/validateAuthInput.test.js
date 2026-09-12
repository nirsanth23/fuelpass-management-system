const assert = require("assert");
const {
  validateSendOtpInput,
  validateVerifyOtpInput,
  validateRegisterInput,
} = require("../../middleware/validateAuthInput");

const createMockReqRes = (body = {}) => {
  const req = { body };
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

console.log("▶ Testing Input Validation Middleware (validateAuthInput)...");

// 1. validateSendOtpInput - Missing Email
const m1 = createMockReqRes({});
validateSendOtpInput(m1.req, m1.res, m1.next);
assert.strictEqual(m1.getResult().status, 400, "Missing email in send-otp must return 400");
assert.strictEqual(m1.getResult().nextCalled, false);

// 2. validateSendOtpInput - Valid Email
const m2 = createMockReqRes({ email: "user@example.com" });
validateSendOtpInput(m2.req, m2.res, m2.next);
assert.strictEqual(m2.getResult().nextCalled, true, "Valid email must call next()");

// 3. validateVerifyOtpInput - Missing OTP
const m3 = createMockReqRes({ email: "user@example.com" });
validateVerifyOtpInput(m3.req, m3.res, m3.next);
assert.strictEqual(m3.getResult().status, 400, "Missing OTP must return 400");

// 4. validateVerifyOtpInput - Valid Email & OTP
const m4 = createMockReqRes({ email: "user@example.com", otp: "1234" });
validateVerifyOtpInput(m4.req, m4.res, m4.next);
assert.strictEqual(m4.getResult().nextCalled, true, "Valid email and OTP must call next()");

// 5. validateRegisterInput - Missing Required Fields
const m5 = createMockReqRes({ email: "user@example.com" });
validateRegisterInput(m5.req, m5.res, m5.next);
assert.strictEqual(m5.getResult().status, 400, "Incomplete registration payload must return 400");

// 6. validateRegisterInput - Complete Registration Payload
const m6 = createMockReqRes({
  registrationToken: "token_123",
  personalDetails: { firstName: "John", lastName: "Doe" },
  vehicleDetails: { vehicleNumber: "CAB-1234" },
  nicOrPassport: "200012345678",
  email: "user@example.com",
});
validateRegisterInput(m6.req, m6.res, m6.next);
assert.strictEqual(m6.getResult().nextCalled, true, "Complete registration payload must call next()");

console.log("  ✔ All Input Validation Middleware Tests Passed (6/6)");
