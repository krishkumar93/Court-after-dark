// app/api/auth/otp/verify/route.js
// Verifies real SMS OTP entered by user, activates account, and creates JWT session.

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { signToken, AUTH_COOKIE_NAME } from "@/lib/auth";
import {
  normalizeIndianPhone,
  verifyRealSmsOtp,
  getPendingRegistration,
  deletePendingRegistration,
} from "@/lib/otpService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, target, otp, pendingSessionId } = body;

    const phoneInput = phone || target;
    if (!phoneInput || !otp) {
      return NextResponse.json(
        { error: "Registered mobile phone number and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const norm = normalizeIndianPhone(phoneInput);
    if (!norm.valid) {
      return NextResponse.json({ error: norm.error }, { status: 400 });
    }

    // Rate limit verification attempts (max 10 attempts per minute per phone)
    const rateCheck = checkRateLimit(`otp_verify:${norm.e164}`, 10, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait 1 minute." },
        { status: 429 }
      );
    }

    // 1. Verify OTP with real carrier provider
    const verifyResult = await verifyRealSmsOtp(norm.e164, otp);
    if (!verifyResult.success) {
      return NextResponse.json(
        { error: verifyResult.error || "Incorrect verification code. Please check your SMS." },
        { status: 400 }
      );
    }

    // 2. Verified! Complete registration or login
    let user = null;
    await connectDB().catch(() => {});

    // Check if this was a pending registration
    const pending = getPendingRegistration(pendingSessionId, norm.e164);

    if (pending) {
      try {
        // Create active user in database
        user = await User.create({
          name: pending.name,
          email: pending.email,
          phone: norm.e164,
          password: pending.password,
          role: "player",
          phoneVerified: true,
          status: "active",
          bio: "Verified athlete on Courts After Dark.",
          preferredSports: ["Badminton Court", "Football Ground"],
        });
      } catch (dbErr) {
        // If email or phone already registered
        const existing = await User.findOne({
          $or: [{ email: pending.email }, { phone: norm.e164 }],
        });

        if (existing) {
          existing.phoneVerified = true;
          existing.status = "active";
          await existing.save();
          user = existing;
        } else {
          user = {
            _id: `usr_${Date.now()}`,
            name: pending.name,
            email: pending.email,
            phone: norm.e164,
            role: "player",
          };
        }
      }

      deletePendingRegistration(pendingSessionId, norm.e164);
    } else {
      // Login verification: find existing user
      try {
        user = await User.findOne({
          $or: [
            { phone: norm.e164 },
            { phone: norm.rawDigits },
            { phone: norm.formatted },
          ],
        });

        if (user) {
          user.phoneVerified = true;
          user.status = "active";
          await user.save();
        }
      } catch (dbErr) {
        console.warn("[User Lookup Warning]", dbErr.message);
      }

      // Fallback if DB offline in demo
      if (!user) {
        user = {
          _id: `usr_${Date.now()}`,
          name: `Athlete ${norm.rawDigits.slice(-4)}`,
          email: `${norm.rawDigits}@phone.courtsafterdark.com`,
          phone: norm.e164,
          role: "player",
        };
      }
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        { error: "Your athlete account has been suspended by administration." },
        { status: 403 }
      );
    }

    // 3. Issue signed JWT session token in httpOnly cookie
    const token = signToken({
      id: user._id.toString(),
      role: user.role || "player",
      name: user.name,
    });

    const response = NextResponse.json({
      success: true,
      message: "Mobile phone verified successfully! Welcome to Courts After Dark.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || norm.e164,
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
    console.error("[OTP Verify Controller Error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to complete verification." },
      { status: 500 }
    );
  }
}
