const assert = require("assert");
const { signFuelPass, verifyFuelPass } = require("../../utils/qrCrypto");

console.log("▶ Testing QR Cryptographic Signing (HMAC-SHA256)...");

// Test 1: Signature Generation
const payload = { v: "CAB-1234", n: "199812345678", t: "Car", f: "Petrol" };
const signature = signFuelPass(payload);
assert.strictEqual(typeof signature, "string", "Signature must be a string");
assert.strictEqual(signature.length, 64, "SHA-256 HMAC hex digest must be 64 characters");

// Test 2: Valid Signature Verification
const isValid = verifyFuelPass(payload, signature);
assert.strictEqual(isValid, true, "Valid payload and signature must pass verification");

// Test 3: Tampered Payload Detection
const tamperedPayload = { ...payload, v: "CAB-9999" };
const isTamperedValid = verifyFuelPass(tamperedPayload, signature);
assert.strictEqual(isTamperedValid, false, "Tampered payload must fail verification");

// Test 4: Forged Signature Detection
const fakeSignature = "0000000000000000000000000000000000000000000000000000000000000000";
const isFakeValid = verifyFuelPass(payload, fakeSignature);
assert.strictEqual(isFakeValid, false, "Fake signature must fail verification");

console.log("  ✔ All QR Cryptographic Tests Passed (4/4)");
