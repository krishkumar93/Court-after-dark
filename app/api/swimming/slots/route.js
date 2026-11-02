import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SwimmingSlot from "@/models/SwimmingSlot";
import MembershipPlan from "@/models/MembershipPlan";

export const dynamic = "force-dynamic";

function generateFallbackSlots(dateStr) {
  const publishedSlots = [
    { startTime: "06:00", endTime: "06:50", category: "General", bookedCount: 8 },
    { startTime: "07:00", endTime: "07:50", category: "General", bookedCount: 14 },
    { startTime: "08:00", endTime: "08:50", category: "General", bookedCount: 11 },
    { startTime: "16:00", endTime: "16:50", category: "General", bookedCount: 19 },
    { startTime: "17:00", endTime: "17:50", category: "Girls", bookedCount: 12 },
    { startTime: "18:00", endTime: "18:50", category: "General", bookedCount: 24 },
    { startTime: "19:00", endTime: "19:50", category: "General", bookedCount: 18 },
    { startTime: "20:00", endTime: "20:50", category: "General", bookedCount: 7 },
  ];

  return publishedSlots.map((s, idx) => ({
    _id: `swim_fallback_${dateStr}_${idx}`,
    date: dateStr,
    startTime: s.startTime,
    endTime: s.endTime,
    category: s.category,
    poolName: "Shanti Devi Mittal Olympic Swimming Complex",
    maxCapacity: 30,
    bookedCount: s.bookedCount,
    isActive: true,
  }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
  const category = searchParams.get("category");

  const fallbackPricing = {
    hourlyRateHosteller: 50,
    hourlyRateDayScholar: 100,
    monthlyRateHosteller: 750,
    monthlyRateDayScholar: 1000,
    semesterRateHosteller: 2000,
    semesterRateDayScholar: 3000,
    hostellerRegularFee: 3500,
    dayScholarFee: 5000,
    registrationFee: 200,
    monthlyCoachingFee: 700,
  };

  try {
    await connectDB();
    const query = { isActive: true };

    if (date) query.date = date;
    if (category && category !== "All") query.category = category;

    const slots = await SwimmingSlot.find(query).sort({ date: 1, startTime: 1 });
    const pricingPlan = await MembershipPlan.findOne({ isSwimmingPlan: true });

    if (slots && slots.length > 0) {
      return NextResponse.json({
        slots,
        pricing: pricingPlan || fallbackPricing,
      });
    }
  } catch (err) {
    console.warn("DB offline for swimming slots, falling back to published schedule:", err.message);
  }

  // Fallback
  let fallback = generateFallbackSlots(date);
  if (category && category !== "All") {
    fallback = fallback.filter((s) => s.category === category);
  }

  return NextResponse.json({
    slots: fallback,
    pricing: fallbackPricing,
  });
}
