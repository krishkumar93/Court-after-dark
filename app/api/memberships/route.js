import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Membership from "@/models/Membership";
import MembershipPlan from "@/models/MembershipPlan";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { getSessionUser, isStaff, isAdmin } from "@/lib/auth";
import { recordAuditLog } from "@/lib/bookingRules";

export const dynamic = "force-dynamic";

// GET /api/memberships -> user's memberships (or all if staff)
export async function GET(request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "You must be logged in." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all");

  try {
    await connectDB();
    const query = {};
    if (isStaff(session) && all === "true") {
      // staff can see all
    } else {
      query.userId = session.id;
    }

    const memberships = await Membership.find(query)
      .populate("userId", "name email phone regNo studentCategory hostelBlock")
      .populate("planId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ memberships });
  } catch (err) {
    console.error("GET /api/memberships error:", err);
    return NextResponse.json({ error: "Failed to load memberships." }, { status: 500 });
  }
}

// POST /api/memberships -> apply for a sports membership
export async function POST(request) {
  const session = getSessionUser(request);
  if (!session) {
    return NextResponse.json({ error: "You must be logged in to apply for a membership." }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await request.json();
    const { planId, paymentMethod = "UPI", duration = "session" } = body;

    const plan = await MembershipPlan.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Membership plan not found." }, { status: 404 });
    }

    const user = await User.findById(session.id);
    const studentCategory = user?.studentCategory || session.studentCategory || "Hosteller with EDB";
    const regNo = user?.regNo || session.regNo || "N/A";

    // Calculate applicable fee based on official 2026-27 LPU published rates
    let applicableFee = plan.dayScholarFee;
    if (studentCategory.includes("EDB")) {
      applicableFee = plan.hostellerEdbFee;
    } else if (studentCategory.includes("Hosteller")) {
      applicableFee = plan.hostellerRegularFee;
    }

    // Complimentary check - only if explicitly approved previously
    const isComplimentary = Boolean(user?.isComplimentaryApproved);
    if (isComplimentary) {
      applicableFee = 0;
    }

    // Set validity dates (e.g., academic session ends 31 May 2027)
    const startDate = new Date();
    const endDate = new Date("2027-05-31T23:59:59.000Z");

    const membership = await Membership.create({
      userId: session.id,
      planId: plan._id,
      sportCategory: plan.sportCategory,
      sessionYear: plan.sessionYear || "2026-27",
      studentCategory,
      regNo,
      applicableFee,
      isComplimentary,
      complimentaryApprovedBy: isComplimentary ? user.complimentaryApprovedBy : undefined,
      complimentaryReason: isComplimentary ? "Pre-approved outstanding sportsperson / medalist waiver" : undefined,
      startDate,
      endDate,
      status: "Active",
      paymentStatus: applicableFee === 0 ? "Complimentary" : "Paid",
      paymentReference: `LPU-MEM-${Date.now().toString(36).toUpperCase()}`,
      notes: `Registered for ${plan.sportCategory} (${plan.sessionYear}) under ${studentCategory}`,
    });

    try {
      await Notification.create({
        userId: session.id,
        type: "membership_approved",
        title: "LPU Sports Membership Active! 🏅",
        message: `Your academic session membership for ${plan.sportCategory} (${plan.sessionYear}) is now active. You have full access to ${plan.sportCategory} facilities.`,
        relatedId: membership._id,
        link: `/memberships`,
      });
    } catch (e) {}

    await recordAuditLog({
      action: "MEMBERSHIP_ENROLLED",
      performedBy: session.id,
      performedByName: session.name || session.email,
      entityType: "Membership",
      entityId: membership._id.toString(),
      details: `${session.name} enrolled in ${plan.sportCategory} (${studentCategory}). Fee: ₹${applicableFee}`,
      severity: "info",
    });

    return NextResponse.json(
      {
        message: "Membership activated successfully!",
        membership,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/memberships error:", err);
    return NextResponse.json({ error: err.message || "Failed to create membership." }, { status: 500 });
  }
}

