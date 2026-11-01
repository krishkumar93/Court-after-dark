// app/api/auth/otp/send/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { createOtp, normalizeContact } from "@/lib/otpService";

export async function POST(request) {
  try {
    const body = await request.json();
    const { target, channel = "phone", purpose = "login" } = body;

    if (!target) {
      return NextResponse.json(
        { error: channel === "phone" ? "Mobile phone number is required." : "Email address is required." },
        { status: 400 }
      );
    }

    const norm = normalizeContact(target, channel);
    if (!norm.valid) {
      return NextResponse.json({ error: norm.error || "Invalid contact information." }, { status: 400 });
    }

    // Check database for existing account if required
    let userExists = false;
    try {
      await connectDB();
      if (channel === "phone") {
        const found = await User.findOne({
          $or: [
            { phone: norm.rawDigits },
            { phone: norm.normalized },
            { phone: norm.formatted },
            { email: `${norm.rawDigits}@phone.courtsafterdark.com` },
          ],
        });
        userExists = !!found;
      } else {
        const found = await User.findOne({ email: norm.normalized });
        userExists = !!found;
      }
    } catch {
      // If DB fails, proceed in memory / fallback mode
    }

    // If purpose is register and user already exists
    if (purpose === "register" && userExists) {
      return NextResponse.json(
        {
          error: `An account with this ${channel === "phone" ? "phone number" : "email"} already exists. Please sign in instead.`,
          userExists: true,
        },
        { status: 409 }
      );
    }

    // Generate & record OTP
    const otpResult = await createOtp(norm.normalized, channel, purpose);

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${otpResult.maskedTarget}`,
      channel,
      target: norm.normalized,
      maskedTarget: otpResult.maskedTarget,
      devOtp: otpResult.devOtp, // Provides seamless testing experience
      whatsappUrl: otpResult.whatsappUrl,
      carrierDispatched: otpResult.carrierDispatched,
      userExists,
      expiresAt: otpResult.expiresAt,
    });
  } catch (err) {
    console.error("[OTP Send Error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}

