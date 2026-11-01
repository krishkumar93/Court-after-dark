// app/api/auth/otp/send/route.js
// Dispatches real carrier SMS OTP to registered mobile numbers.
// Never exposes OTP codes in responses.

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { normalizeIndianPhone, sendRealSmsOtp } from "@/lib/otpService";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const body = await request.json();
    const { phone, target, purpose = "login" } = body;

    const phoneInput = phone || target;
    if (!phoneInput) {
      return NextResponse.json(
        { error: "Mobile phone number is required." },
        { status: 400 }
      );
    }

    const norm = normalizeIndianPhone(phoneInput);
    if (!norm.valid) {
      return NextResponse.json({ error: norm.error }, { status: 400 });
    }

    // Rate limit: max 3 requests per 60 seconds per phone number
    const rateCheck = checkRateLimit(`otp_send:${norm.e164}`, 3, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many verification requests. Please wait 1 minute before trying again." },
        { status: 429 }
      );
    }

    // For login purpose, ensure an account exists with this phone
    if (purpose === "login") {
      try {
        await connectDB();
        const existingUser = await User.findOne({
          $or: [
            { phone: norm.e164 },
            { phone: norm.rawDigits },
            { phone: norm.formatted },
          ],
        });

        if (!existingUser) {
          return NextResponse.json(
            { error: "No account found with this mobile number. Please sign up first." },
            { status: 404 }
          );
        }

        if (existingUser.status === "suspended") {
          return NextResponse.json(
            { error: "This athlete account has been suspended by administration." },
            { status: 403 }
          );
        }
      } catch (dbErr) {
        console.warn("[OTP Send DB Check Warning]", dbErr.message);
      }
    }

    // Dispatch real SMS OTP
    const sendResult = await sendRealSmsOtp(norm.e164);

    if (!sendResult.success) {
      return NextResponse.json(
        {
          error: sendResult.error,
          configured: sendResult.configured !== false,
          requiresConfiguration: !!sendResult.requiresConfiguration,
        },
        { status: sendResult.requiresConfiguration ? 503 : 400 }
      );
    }

    // Return success without exposing OTP
    return NextResponse.json(
      {
        success: true,
        maskedPhone: norm.masked,
        phone: norm.e164,
        message: `Verification code sent via SMS to ${norm.masked}.`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[OTP Send Error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to dispatch verification code." },
      { status: 500 }
    );
  }
}
