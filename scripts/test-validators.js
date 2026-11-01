// scripts/test-validators.js
// Unit tests for input validation, sanitization, and security rules.

const assert = require("assert");

async function run() {
  console.log("🧪 Running validation & security helper tests...\n");

  const {
    isValidEmail,
    evaluatePasswordStrength,
    isValidName,
    isValidPhone,
    isValidBookingDate,
    sanitizeText,
  } = await import("../lib/validators.js");

  // 1. Email validation
  console.log("1. Testing isValidEmail...");
  assert.strictEqual(isValidEmail("aarav@example.com"), true);
  assert.strictEqual(isValidEmail("admin.sub_user@domain.co.uk"), true);
  assert.strictEqual(isValidEmail("plainaddress"), false);
  assert.strictEqual(isValidEmail("@missingusername.com"), false);
  assert.strictEqual(isValidEmail("user@.com"), false);
  assert.strictEqual(isValidEmail(""), false);
  assert.strictEqual(isValidEmail(null), false);
  console.log("   ✓ isValidEmail passed.");

  // 2. Password strength
  console.log("2. Testing evaluatePasswordStrength...");
  const weak = evaluatePasswordStrength("123");
  assert.strictEqual(weak.passed, false);
  assert.ok(weak.requirements.length > 0);

  const strong = evaluatePasswordStrength("CourtDark#2026");
  assert.strictEqual(strong.passed, true);
  assert.strictEqual(strong.score >= 3, true);
  console.log("   ✓ evaluatePasswordStrength passed.");

  // 3. Name validation
  console.log("3. Testing isValidName...");
  assert.strictEqual(isValidName("A"), false);
  assert.strictEqual(isValidName("Aarav Sharma"), true);
  assert.strictEqual(isValidName(""), false);
  assert.strictEqual(isValidName("a".repeat(51)), false);
  console.log("   ✓ isValidName passed.");

  // 4. Phone validation
  console.log("4. Testing isValidPhone...");
  assert.strictEqual(isValidPhone("+91-9876543210"), true);
  assert.strictEqual(isValidPhone("9876543210"), true);
  assert.strictEqual(isValidPhone("123"), false);
  assert.strictEqual(isValidPhone("phone-number"), false);
  console.log("   ✓ isValidPhone passed.");

  // 5. Booking date boundaries
  console.log("5. Testing isValidBookingDate...");
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const farFuture = new Date(Date.now() + 20 * 86400000).toISOString().split("T")[0];

  assert.strictEqual(isValidBookingDate(today, 14), true);
  assert.strictEqual(isValidBookingDate(tomorrow, 14), true);
  assert.strictEqual(isValidBookingDate(yesterday, 14), false);
  assert.strictEqual(isValidBookingDate(farFuture, 14), false);
  console.log("   ✓ isValidBookingDate passed.");

  // 6. Text sanitization
  console.log("6. Testing sanitizeText...");
  assert.strictEqual(sanitizeText("Hello <script>alert(1)</script> World"), "Hello scriptalert(1)/script World");
  assert.strictEqual(sanitizeText("   Clean court notes   "), "Clean court notes");
  console.log("   ✓ sanitizeText passed.");

  console.log("\n🎉 All 6 validation test suites passed successfully (100% assertions green)!\n");
}

run().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

