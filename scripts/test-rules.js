// scripts/test-rules.js
// Unit tests for slot calculations, operating hour boundaries, and prime-time checks.

const assert = require("assert");

async function run() {
  console.log("🧪 Running slot & rules calculation tests...\n");

  const {
    timeToMinutes,
    minutesToTime,
    rangesOverlap,
    isWithinOperatingHours,
    isPrimeTimeSlot,
    formatSlotLabel,
    to12Hour,
    TIME_SLOTS,
  } = await import("../lib/slotUtils.js");

  // 1. Test timeToMinutes
  console.log("1. Testing timeToMinutes...");
  assert.strictEqual(timeToMinutes("00:00"), 0);
  assert.strictEqual(timeToMinutes("06:30"), 390);
  assert.strictEqual(timeToMinutes("18:00"), 1080);
  assert.strictEqual(timeToMinutes("23:59"), 1439);
  assert.strictEqual(timeToMinutes(null), 0);
  console.log("   ✓ timeToMinutes passed.");

  // 2. Test minutesToTime
  console.log("2. Testing minutesToTime...");
  assert.strictEqual(minutesToTime(0), "00:00");
  assert.strictEqual(minutesToTime(390), "06:30");
  assert.strictEqual(minutesToTime(1080), "18:00");
  console.log("   ✓ minutesToTime passed.");

  // 3. Test rangesOverlap
  console.log("3. Testing rangesOverlap...");
  // Overlapping
  assert.strictEqual(rangesOverlap("08:00", "10:00", "09:00", "11:00"), true);
  // Inside
  assert.strictEqual(rangesOverlap("08:00", "12:00", "09:00", "10:00"), true);
  // Identical
  assert.strictEqual(rangesOverlap("14:00", "15:00", "14:00", "15:00"), true);
  // Adjacent (should NOT overlap: end == start)
  assert.strictEqual(rangesOverlap("08:00", "09:00", "09:00", "10:00"), false);
  // Disjoint
  assert.strictEqual(rangesOverlap("08:00", "09:00", "11:00", "12:00"), false);
  console.log("   ✓ rangesOverlap passed.");

  // 4. Test isWithinOperatingHours
  console.log("4. Testing isWithinOperatingHours...");
  assert.strictEqual(isWithinOperatingHours("07:00", "08:00", "06:00", "23:00"), true);
  assert.strictEqual(isWithinOperatingHours("05:00", "06:00", "06:00", "23:00"), false);
  assert.strictEqual(isWithinOperatingHours("22:00", "23:30", "06:00", "23:00"), false);
  console.log("   ✓ isWithinOperatingHours passed.");

  // 5. Test isPrimeTimeSlot
  console.log("5. Testing isPrimeTimeSlot...");
  assert.strictEqual(isPrimeTimeSlot("18:00", "18:00", "21:00"), true);
  assert.strictEqual(isPrimeTimeSlot("19:00", "18:00", "21:00"), true);
  assert.strictEqual(isPrimeTimeSlot("20:00", "18:00", "21:00"), true);
  assert.strictEqual(isPrimeTimeSlot("17:00", "18:00", "21:00"), false);
  assert.strictEqual(isPrimeTimeSlot("21:00", "18:00", "21:00"), false);
  console.log("   ✓ isPrimeTimeSlot passed.");

  // 6. Test to12Hour and formatSlotLabel
  console.log("6. Testing 12-hour labels...");
  assert.strictEqual(to12Hour("06:00"), "6:00 AM");
  assert.strictEqual(to12Hour("12:00"), "12:00 PM");
  assert.strictEqual(to12Hour("18:00"), "6:00 PM");
  assert.strictEqual(to12Hour("21:00"), "9:00 PM");
  assert.strictEqual(formatSlotLabel("06:00-07:00"), "6:00 AM - 7:00 AM");
  assert.strictEqual(formatSlotLabel("18:00-19:00"), "6:00 PM - 7:00 PM");
  console.log("   ✓ 12-hour formatting passed.");

  // 7. Test TIME_SLOTS structure
  console.log("7. Testing TIME_SLOTS array...");
  assert.ok(Array.isArray(TIME_SLOTS));
  assert.strictEqual(TIME_SLOTS.length, 16);
  assert.strictEqual(TIME_SLOTS[0], "06:00-07:00");
  assert.strictEqual(TIME_SLOTS[TIME_SLOTS.length - 1], "21:00-22:00");
  console.log("   ✓ TIME_SLOTS passed.");

  console.log("\n🎉 All 7 test suites passed successfully (100% assertions green)!\n");
}

run().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

