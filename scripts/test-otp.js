// scripts/test-otp.js
// Unit tests for real carrier SMS OTP service, Indian phone normalization, masking,
// pending registration lifecycle, and secure verification.

process.env.NODE_ENV = "test";

import assert from "node:assert/strict";
import {
  normalizeIndianPhone,
  getSmsProvider,
  savePendingRegistration,
  getPendingRegistration,
  deletePendingRegistration,
  sendRealSmsOtp,
  verifyRealSmsOtp,
} from "../lib/otpService.js";

console.log("🧪 Running Real SMS OTP Service & Phone Authentication tests...\n");

// 1. Indian Phone Number Normalization & Masking
console.log("1. Testing Indian Phone Normalization & Masking...");
const p1 = normalizeIndianPhone("7828722557");
assert.equal(p1.valid, true, "10-digit number starting with 7 must be valid");
assert.equal(p1.e164, "+917828722557", "Must format to E.164");
assert.equal(p1.rawDigits, "7828722557");
assert.equal(p1.formatted, "+91 78287 22557");
assert.equal(p1.masked, "+91 78*** **557");

const p2 = normalizeIndianPhone("+91 98765 43210");
assert.equal(p2.valid, true);
assert.equal(p2.e164, "+919876543210");
assert.equal(p2.rawDigits, "9876543210");

const pInvalid1 = normalizeIndianPhone("12345");
assert.equal(pInvalid1.valid, false, "Short number must be invalid");

const pInvalid2 = normalizeIndianPhone("1828722557");
assert.equal(pInvalid2.valid, false, "Indian numbers starting with 1 must be invalid");
console.log("   ✓ Indian phone normalization and masking tests passed.");

// 2. Pending Registration Store Lifecycle
console.log("2. Testing Pending Registration Store Lifecycle...");
const testRegData = {
  name: "Test Athlete",
  email: "athlete@example.com",
  phone: "7828722557",
  hashedPassword: "hashed_dummy_password",
};

const sessionId = savePendingRegistration(testRegData);
assert(sessionId.startsWith("reg_"), "Session ID must start with reg_");

const retrieved = getPendingRegistration(sessionId, "7828722557");
assert(retrieved !== null, "Should retrieve stored pending registration");
assert.equal(retrieved.name, "Test Athlete");
assert.equal(retrieved.email, "athlete@example.com");

deletePendingRegistration(sessionId, "7828722557");
const retrievedAfterDelete = getPendingRegistration(sessionId, "7828722557");
assert.equal(retrievedAfterDelete, null, "Should return null after deletion");
console.log("   ✓ Pending registration store tests passed.");

// 3. Provider Inspection
console.log("3. Testing SMS Provider Detection...");
const provider = getSmsProvider();
assert(typeof provider === "object", "Provider check must return an object");
console.log(`   ✓ SMS provider status inspected (configured: ${provider.configured}).`);

// 4. Secure SMS OTP Dispatch (Zero OTP Leakage)
console.log("4. Testing Secure SMS OTP Dispatch...");
const dispatchResult = await sendRealSmsOtp("7828722557");
assert.equal(dispatchResult.success, true, "Dispatch in test mode must succeed");
assert.equal(dispatchResult.devOtp, undefined, "CRITICAL: devOtp MUST NEVER be present in dispatch response");
assert.equal(dispatchResult.otp, undefined, "CRITICAL: otp MUST NEVER be leaked in dispatch response");
assert(dispatchResult.maskedPhone.includes("***"), "Masked phone should hide middle digits");
console.log("   ✓ OTP dispatch passed without exposing OTP in response.");

// 5. Rate Limiting / Cooldown
console.log("5. Testing 45s Resend Cooldown...");
const rapidDispatch = await sendRealSmsOtp("7828722557");
assert.equal(rapidDispatch.success, false, "Rapid duplicate request must be blocked by cooldown");
assert(rapidDispatch.error.includes("Please wait"), "Error message should mention wait cooldown");
console.log("   ✓ Resend cooldown protection passed.");

// 6. OTP Verification (Correct vs Wrong Codes)
console.log("6. Testing Real OTP Verification Logic...");
const failVerify = await verifyRealSmsOtp("7828722557", "000000");
assert.equal(failVerify.success, false, "Incorrect OTP must fail verification");

const passVerify = await verifyRealSmsOtp("7828722557", "123456");
assert.equal(passVerify.success, true, "Correct OTP must succeed");
assert.equal(passVerify.verified, true);
assert.equal(passVerify.normalizedPhone, "+917828722557");
console.log("   ✓ OTP verification logic passed.");

console.log("\n🎉 All Real SMS OTP tests passed successfully!");
