// app/api/auth/register/route.js
// Secure user registration endpoint with real carrier SMS OTP verification.
// Does NOT activate the account or issue JWT until OTP is verified.

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import {
  normalizeIndianPhone,
  savePendingRegistration,
  sendRealSmsOtp,
} from "@/lib/otpService";
import { isValidEmail, isValidName, evaluatePasswordStrength } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // 1. Validate fields
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: "Full name, email address, mobile phone number, and password are required." },
        { status: 400 }
      );
    }

    if (!isValidName(name)) {
      return NextResponse.json(
        { error: "Name must be between 2 and 50 characters." },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address (e.g. athlete@example.com)." },
        { status: 400 }
      );
    }

    const norm = normalizeIndianPhone(phone);
    if (!norm.valid) {
      return NextResponse.json({ error: norm.error }, { status: 400 });
    }

    const strength = evaluatePasswordStrength(password);
    if (!strength.passed) {
      return NextResponse.json(
        { error: `Password is too weak: ${strength.requirements.join(", ")}.` },
        { status: 400 }
      );
    }

    // 2. Rate limiting by phone number (max 4 attempts per minute)
    const rateCheck = checkRateLimit(`reg:${norm.e164}`, 4, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please wait 1 minute before trying again." },
        { status: 429 }
      );
    }

    // 3. Check for existing active account
    try {
      await connectDB();
      const existingUser = await User.findOne({
        $or: [
          { email: email.toLowerCase() },
          { phone: norm.e164 },
          { phone: norm.rawDigits },
          { phone: norm.formatted },
        ],
      });

      if (existingUser && existingUser.status === "active") {
        return NextResponse.json(
          { error: "An active account with this email or mobile number already exists. Please sign in." },
          { status: 409 }
        );
      }
    } catch (dbErr) {
      console.warn("[Register DB Warning]", dbErr.message);
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Store unactivated pending registration session
    const pendingSessionId = savePendingRegistration({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: norm.e164,
      rawDigits: norm.rawDigits,
      password: hashedPassword,
    });

    // 6. Send real SMS OTP to the physical phone
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

    // 7. Return success without exposing OTP
    return NextResponse.json(
      {
        success: true,
        pendingSessionId,
        maskedPhone: norm.masked,
        phone: norm.e164,
        message: `Verification code sent via SMS to ${norm.masked}.`,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Register Controller Error]", err);
    return NextResponse.json(
      { error: err.message || "Failed to process registration. Please try again." },
      { status: 500 }
    );
  }
}
