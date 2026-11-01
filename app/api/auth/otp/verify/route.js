// app/api/auth/otp/verify/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import { verifyOtpCode, normalizeContact } from "@/lib/otpService";

export async function POST(request) {
  try {
    const body = await request.json();
    const { target, channel = "phone", otp, name, role = "player" } = body;

    if (!target || !otp) {
      return NextResponse.json({ error: "Contact target and verification code are required." }, { status: 400 });
    }

    const norm = normalizeContact(target, channel);
    if (!norm.valid) {
      return NextResponse.json({ error: norm.error || "Invalid contact information." }, { status: 400 });
    }

    // Verify OTP
    const verification = verifyOtpCode(norm.normalized, channel, otp);
    if (!verification.success) {
      return NextResponse.json({ error: verification.error || "Invalid or expired OTP." }, { status: 400 });
    }

    let user = null;

    try {
      await connectDB();

      // Find user
      if (channel === "phone") {
        user = await User.findOne({
          $or: [
            { phone: norm.rawDigits },
            { phone: norm.normalized },
            { phone: norm.formatted },
            { email: `${norm.rawDigits}@phone.courtsafterdark.com` },
          ],
        });
      } else {
        user = await User.findOne({ email: norm.normalized });
      }

      // If user does not exist, create new account
      if (!user) {
        const dummyPassword = await bcrypt.hash(`cad_pass_${Date.now()}`, 10);
        const resolvedName =
          name?.trim() ||
          (channel === "phone"
            ? `Athlete ${norm.rawDigits.slice(-4)}`
            : norm.normalized.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));

        const resolvedEmail =
          channel === "email" ? norm.normalized : `${norm.rawDigits}@phone.courtsafterdark.com`;

        const resolvedPhone = channel === "phone" ? norm.formatted : "";

        user = await User.create({
          name: resolvedName,
          email: resolvedEmail,
          phone: resolvedPhone,
          password: dummyPassword,
          role: "player",
          bio: "Passionate athlete active on Courts After Dark.",
          preferredSports: ["Badminton Court", "Football Ground"],
        });
      }
    } catch (dbErr) {
      // In-memory fallback if DB is unreachable
      console.warn("[OTP DB Fallback]", dbErr.message);
      user = {
        _id: `usr_${Date.now()}`,
        name: name?.trim() || (channel === "phone" ? `Athlete ${norm.rawDigits.slice(-4)}` : "Athlete Member"),
        email: channel === "email" ? norm.normalized : `${norm.rawDigits}@phone.courtsafterdark.com`,
        phone: channel === "phone" ? norm.formatted : "",
        role: "player",
      };
    }

    if (user.status === "suspended") {
      return NextResponse.json({ error: "Your athlete account has been suspended by management." }, { status: 403 });
    }

    // Sign JWT Token
    const token = signToken({
      id: user._id.toString(),
      role: user.role || "player",
      name: user.name,
    });

    const response = NextResponse.json({
      message: "Authentication successful! Welcome to Courts After Dark.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role || "player",
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("[OTP Verify Error]", err);
    return NextResponse.json({ error: err.message || "Failed to verify OTP." }, { status: 500 });
  }
}
