import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";

export async function POST(request) {
  try {
    let role = "student";
    try {
      const body = await request.json();
      if (body?.role) {
        role = body.role;
      }
    } catch {
      // default to student
    }

    const DEMO_EMAILS = {
      super_admin: "superadmin@lpu.co.in",
      sports_admin: "admin@courtsafterdark.com",
      admin: "admin@courtsafterdark.com",
      coach: "coach.sandeep@lpu.co.in",
      equipment_manager: "store.gurpreet@lpu.co.in",
      student: "aarav@example.com",
      player: "aarav@example.com",
      student_medalist: "rohan@example.com",
      student_day: "priya@example.com",
    };

    const targetEmail = DEMO_EMAILS[role] || "aarav@example.com";

    let user = null;
    try {
      await connectDB();
      user = await User.findOne({ email: targetEmail });
      if (!user) {
        // Fallback find by role
        user = await User.findOne({ role: role === "player" ? "student" : role });
      }
    } catch (dbErr) {
      console.warn("DB offline during demo login:", dbErr.message);
    }

    if (!user) {
      // Fallback in-memory mock if database isn't connected
      const mockRoles = {
        super_admin: { name: "Dr. Balraj Singh", email: "superadmin@lpu.co.in", role: "super_admin", studentCategory: "Faculty" },
        sports_admin: { name: "LPU Sports Admin", email: "admin@courtsafterdark.com", role: "sports_admin", studentCategory: "Admin" },
        admin: { name: "LPU Sports Admin", email: "admin@courtsafterdark.com", role: "sports_admin", studentCategory: "Admin" },
        coach: { name: "Coach Sandeep Kumar", email: "coach.sandeep@lpu.co.in", role: "coach", studentCategory: "Coach" },
        equipment_manager: { name: "Gurpreet Singh (Sports Store)", email: "store.gurpreet@lpu.co.in", role: "equipment_manager", studentCategory: "Staff" },
        student_medalist: { name: "Rohan Verma (National Gold)", email: "rohan@example.com", role: "student", studentCategory: "Hosteller with EDB", regNo: "12117540", isComplimentaryApproved: true },
        student_day: { name: "Priya Patel", email: "priya@example.com", role: "student", studentCategory: "Day Scholar", regNo: "12209314" },
        student: { name: "Aarav Sharma", email: "aarav@example.com", role: "student", studentCategory: "Hosteller with EDB", regNo: "12104822" },
      };
      const def = mockRoles[role] || mockRoles.student;
      user = {
        _id: "demo_" + role,
        name: def.name,
        email: def.email,
        role: def.role,
        studentCategory: def.studentCategory,
        regNo: def.regNo || "12100000",
      };
    }

    if (user.status === "suspended") {
      return NextResponse.json({ error: "Demo account is currently suspended." }, { status: 403 });
    }

    const token = signToken({
      id: user._id.toString(),
      role: user.role,
      name: user.name,
      email: user.email,
      studentCategory: user.studentCategory,
      regNo: user.regNo,
    });

    const isStaffRole = ["admin", "super_admin", "sports_admin", "coach", "equipment_manager"].includes(user.role);

    const response = NextResponse.json({
      message: `Signed in as Demo ${user.name} (${user.role}).`,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        studentCategory: user.studentCategory,
        regNo: user.regNo,
        isComplimentaryApproved: user.isComplimentaryApproved,
        isDemo: true,
        isStaff: isStaffRole,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Demo login error:", err);
    return NextResponse.json({ error: "Failed to initialize demo session." }, { status: 500 });
  }
}
