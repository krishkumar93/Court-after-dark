// scripts/test-otp.js
// Tests for OTP generation, contact normalization, masking, and verification logic.

import assert from "node:assert/strict";
import { normalizeContact, maskContact, createOtp, verifyOtpCode } from "../lib/otpService.js";

console.log("🧪 Running OTP & Contact Authentication tests...\n");

// 1. Testing Phone Normalization
console.log("1. Testing Phone Normalization...");
const p1 = normalizeContact("9876543210", "phone");
assert.equal(p1.valid, true, "10-digit number must be valid");
assert.equal(p1.normalized, "+919876543210", "Should prepend +91");
assert.equal(p1.rawDigits, "9876543210");

const p2 = normalizeContact("+91 98765 43210", "phone");
assert.equal(p2.valid, true);
assert.equal(p2.normalized, "+919876543210");

const p3 = normalizeContact("12345", "phone");
assert.equal(p3.valid, false, "Too short phone number must be invalid");
console.log("   ✓ Phone normalization tests passed.");

// 2. Testing Email Normalization
console.log("2. Testing Email Normalization...");
const e1 = normalizeContact(" Aarav.Sharma@EXAMPLE.COM ", "email");
assert.equal(e1.valid, true);
assert.equal(e1.normalized, "aarav.sharma@example.com");

const e2 = normalizeContact("not-an-email", "email");
assert.equal(e2.valid, false, "Invalid email must fail");
console.log("   ✓ Email normalization tests passed.");

// 3. Testing Contact Masking for Privacy
console.log("3. Testing Contact Masking...");
const mPhone = maskContact("+919876543210", "phone");
assert(mPhone.includes("+91 98*** **210"), "Phone should mask middle digits");

const mEmail = maskContact("aarav@example.com", "email");
assert.equal(mEmail, "aa***@example.com", "Email should mask user prefix");
console.log("   ✓ Contact masking tests passed.");

// 4. Testing OTP Lifecycle for Phone
console.log("4. Testing OTP Lifecycle for Phone...");
const phoneOtpResult = createOtp("9876511111", "phone", "login");
assert(phoneOtpResult.success, "createOtp should succeed");
assert.equal(phoneOtpResult.devOtp.length, 6, "OTP must be 6 digits");

// Try wrong OTP
const failVerify = verifyOtpCode("9876511111", "phone", "000000");
assert.equal(failVerify.success, false, "Wrong OTP should fail");

// Try correct OTP
const passVerify = verifyOtpCode("9876511111", "phone", phoneOtpResult.devOtp);
assert.equal(passVerify.success, true, "Correct OTP should succeed");
console.log("   ✓ Phone OTP generation and verification passed.");

// 5. Testing OTP Lifecycle for Email
console.log("5. Testing OTP Lifecycle for Email...");
const emailOtpResult = createOtp("priya@example.com", "email", "register");
assert(emailOtpResult.success);
assert.equal(emailOtpResult.devOtp.length, 6);

const passEmailVerify = verifyOtpCode("priya@example.com", "email", emailOtpResult.devOtp);
assert.equal(passEmailVerify.success, true);
console.log("   ✓ Email OTP generation and verification passed.");

console.log("\n🎉 All OTP authentication tests passed successfully!");
