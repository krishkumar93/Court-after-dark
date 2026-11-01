// scripts/test-payments.js
// Tests for UPI URI generation and payment configuration helpers

import assert from "node:assert/strict";
import { MERCHANT_CONFIG, buildUpiIntentUri, buildUpiQrCodeUrl } from "../lib/paymentConfig.js";

console.log("🧪 Running Payment & UPI helper tests...\n");

// 1. Verify default merchant config
console.log("1. Testing default merchant configuration...");
assert.equal(MERCHANT_CONFIG.upiId, "7828722557@ptyes", "Default UPI ID must be 7828722557@ptyes");
assert.equal(MERCHANT_CONFIG.currency, "INR", "Currency must be INR");
assert.equal(MERCHANT_CONFIG.currencySymbol, "₹", "Currency symbol must be ₹");
console.log("   ✓ Default merchant configuration verified.");

// 2. Test UPI Intent URI generation
console.log("2. Testing UPI Intent URI generation...");
const testUri = buildUpiIntentUri({
  upiId: "7828722557@ptyes",
  merchantName: "Courts After Dark",
  amount: 450,
  transactionNote: "Court Booking",
  refId: "CAD-TEST-1234",
});

assert(testUri.startsWith("upi://pay?"), "Must start with upi://pay?");
assert(testUri.includes("pa=7828722557%40ptyes"), "Must contain encoded UPI ID");
assert(testUri.includes("pn=Courts+After+Dark"), "Must contain merchant name");
assert(testUri.includes("am=450.00"), "Must format amount as 2 decimal places");
assert(testUri.includes("cu=INR"), "Must specify currency INR");
assert(testUri.includes("tr=CAD-TEST-1234"), "Must include ref transaction ID");
console.log("   ✓ UPI Intent URI generated successfully:", testUri);

// 3. Test dynamic QR code URL generation
console.log("3. Testing QR Code generator URL...");
const qrUrl = buildUpiQrCodeUrl(testUri, 200);
assert(qrUrl.startsWith("https://api.qrserver.com/v1/create-qr-code/?"), "Must use dynamic QR API");
assert(qrUrl.includes("size=200x200"), "Must set size");
assert(qrUrl.includes(encodeURIComponent(testUri)), "Must embed encoded UPI URI");
console.log("   ✓ Dynamic QR URL generated successfully.");

console.log("\n🎉 All payment configuration tests passed successfully!");

