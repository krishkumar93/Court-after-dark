// lib/otpService.js
// Production-grade SMS OTP Service with Twilio Verify v2 and Fast2SMS integration.
// Follows strict financial & telecommunication security standards:
// - Never generates OTP on frontend
// - Never exposes OTP in API responses
// - Integrates directly with real carrier SMS gateways
// - Enforces 5-minute expiry, rate limiting, and attempt caps

import crypto from "crypto";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes validity
const MAX_VERIFY_ATTEMPTS = 5;

// Global persistent store for pending OTP sessions & verification attempts across dev server reloads
const internalOtpStore = (globalThis._cadInternalOtpStore = globalThis._cadInternalOtpStore || new Map());
const requestCooldownStore = (globalThis._cadRequestCooldownStore = globalThis._cadRequestCooldownStore || new Map());
const pendingRegistrationsStore = (globalThis._cadPendingRegistrations = globalThis._cadPendingRegistrations || new Map());

/**
 * Creates and stores an unactivated registration session until OTP is verified
 */
export function savePendingRegistration(data) {
  const sessionId = `reg_${crypto.randomBytes(16).toString("hex")}`;
  const record = {
    ...data,
    sessionId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes window
  };
  pendingRegistrationsStore.set(sessionId, record);
  if (data.phone) {
    pendingRegistrationsStore.set(`phone:${data.phone}`, record);
  }
  return sessionId;
}

/**
 * Retrieves unactivated registration session
 */
export function getPendingRegistration(sessionId, phone) {
  let record = null;
  if (sessionId) record = pendingRegistrationsStore.get(sessionId);
  if (!record && phone) record = pendingRegistrationsStore.get(`phone:${phone}`);
  if (!record) return null;
  if (Date.now() > record.expiresAt) {
    if (sessionId) pendingRegistrationsStore.delete(sessionId);
    if (phone) pendingRegistrationsStore.delete(`phone:${phone}`);
    return null;
  }
  return record;
}

/**
 * Removes completed or expired registration session
 */
export function deletePendingRegistration(sessionId, phone) {
  if (sessionId) pendingRegistrationsStore.delete(sessionId);
  if (phone) pendingRegistrationsStore.delete(`phone:${phone}`);
}

/**
 * Normalizes Indian phone numbers to E.164 (+91XXXXXXXXXX) and extracts raw 10 digits
 */
export function normalizeIndianPhone(input) {
  if (!input || typeof input !== "string") {
    return { valid: false, error: "Phone number is required." };
  }

  const raw = input.trim();
  const digitsOnly = raw.replace(/\D/g, "");

  let raw10 = "";
  let e164 = "";

  if (digitsOnly.length === 10) {
    raw10 = digitsOnly;
    e164 = `+91${digitsOnly}`;
  } else if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    raw10 = digitsOnly.slice(2);
    e164 = `+${digitsOnly}`;
  } else if (digitsOnly.length > 10) {
    raw10 = digitsOnly.slice(-10);
    e164 = `+91${raw10}`;
  } else {
    return {
      valid: false,
      error: "Please enter a valid 10-digit Indian mobile number (e.g. 78287 22557).",
    };
  }

  // Validate standard Indian mobile prefix (starts with 6, 7, 8, or 9)
  if (!/^[6-9]\d{9}$/.test(raw10)) {
    return {
      valid: false,
      error: "Indian mobile numbers must start with 6, 7, 8, or 9.",
    };
  }

  const formatted = `+91 ${raw10.slice(0, 5)} ${raw10.slice(5)}`;
  const masked = `+91 ${raw10.slice(0, 2)}*** **${raw10.slice(-3)}`;

  return {
    valid: true,
    e164,
    rawDigits: raw10,
    formatted,
    masked,
  };
}

/**
 * Checks which real SMS provider is configured in environment
 */
export function getSmsProvider() {
  const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  const fast2smsKey = process.env.FAST2SMS_API_KEY;

  if (twilioAccountSid && twilioAuthToken && twilioVerifyServiceSid) {
    return {
      configured: true,
      type: "twilio_verify",
      serviceSid: twilioVerifyServiceSid,
    };
  }

  if (fast2smsKey) {
    return {
      configured: true,
      type: "fast2sms",
    };
  }

  return {
    configured: false,
    type: null,
    requiredVars: [
      "TWILIO_ACCOUNT_SID",
      "TWILIO_AUTH_TOKEN",
      "TWILIO_VERIFY_SERVICE_SID",
    ],
  };
}

/**
 * Sends real SMS OTP to the user's physical phone
 */
export async function sendRealSmsOtp(phoneNumber) {
  const norm = normalizeIndianPhone(phoneNumber);
  if (!norm.valid) {
    return { success: false, error: norm.error };
  }

  // Check resend cooldown (45 seconds)
  const lastRequested = requestCooldownStore.get(norm.e164);
  const now = Date.now();
  if (lastRequested && now - lastRequested < 45000) {
    const secondsRemaining = Math.ceil((45000 - (now - lastRequested)) / 1000);
    return {
      success: false,
      error: `Please wait ${secondsRemaining}s before requesting a new verification code.`,
      cooldownRemaining: secondsRemaining,
    };
  }

  const provider = getSmsProvider();

  // 1. Twilio Verify v2 (Gold standard carrier verification)
  if (provider.type === "twilio_verify") {
    try {
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const response = await fetch(
        `https://verify.twilio.com/v2/Services/${provider.serviceSid}/Verifications`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: norm.e164,
            Channel: "sms",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.status !== "pending") {
        console.error("[Twilio Verify Error]", data);
        return {
          success: false,
          error:
            data.message ||
            "Failed to send SMS through Twilio Verify. Please check your credentials.",
        };
      }

      requestCooldownStore.set(norm.e164, now);

      return {
        success: true,
        provider: "twilio_verify",
        maskedPhone: norm.masked,
        message: `Verification code sent via SMS to ${norm.masked}.`,
      };
    } catch (err) {
      console.error("[Twilio Request Exception]", err);
      return {
        success: false,
        error: `Could not connect to Twilio SMS gateway: ${err.message}`,
      };
    }
  }

  // 2. Fast2SMS (Indian SMS Route)
  if (provider.type === "fast2sms") {
    try {
      // Generate secure 6-digit code
      const code = crypto.randomInt(100000, 1000000).toString();

      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: code,
          numbers: norm.rawDigits,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.return) {
        console.error("[Fast2SMS Error]", data);
        return {
          success: false,
          error: data.message || "Failed to dispatch SMS via Fast2SMS.",
        };
      }

      // Store hashed OTP for verification
      const salt = crypto.randomBytes(8).toString("hex");
      const hash = crypto
        .createHash("sha256")
        .update(`${salt}:${code}`)
        .digest("hex");

      internalOtpStore.set(norm.e164, {
        hash,
        salt,
        expiresAt: now + OTP_TTL_MS,
        attempts: 0,
      });

      requestCooldownStore.set(norm.e164, now);

      return {
        success: true,
        provider: "fast2sms",
        maskedPhone: norm.masked,
        message: `Verification code sent via SMS to ${norm.masked}.`,
      };
    } catch (err) {
      console.error("[Fast2SMS Exception]", err);
      return {
        success: false,
        error: `Fast2SMS delivery error: ${err.message}`,
      };
    }
  }

  // 3. Automated Test Environment Stub (Only for CI/CD test suite)
  if (process.env.NODE_ENV === "test") {
    const code = "123456";
    const salt = "testsalt";
    const hash = crypto.createHash("sha256").update(`${salt}:${code}`).digest("hex");
    internalOtpStore.set(norm.e164, {
      hash,
      salt,
      expiresAt: now + OTP_TTL_MS,
      attempts: 0,
    });
    requestCooldownStore.set(norm.e164, now);
    return {
      success: true,
      provider: "test",
      maskedPhone: norm.masked,
      message: `Test OTP generated for ${norm.masked}.`,
    };
  }

  // 4. SMS Provider is NOT configured
  // As required: Do NOT pretend SMS delivery works if credentials are missing.
  return {
    success: false,
    configured: false,
    error:
      "SMS Gateway Not Configured: Real SMS OTP delivery requires Twilio Verify credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID) in .env.local.",
    requiresConfiguration: true,
  };
}

/**
 * Verifies real SMS OTP entered by user
 */
export async function verifyRealSmsOtp(phoneNumber, enteredOtp) {
  const norm = normalizeIndianPhone(phoneNumber);
  if (!norm.valid) {
    return { success: false, error: norm.error };
  }

  const cleanOtp = String(enteredOtp || "").trim();
  if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return { success: false, error: "Please enter the valid 6-digit verification code." };
  }

  const provider = getSmsProvider();

  // 1. Verify with Twilio Verify v2
  if (provider.type === "twilio_verify") {
    try {
      const auth = Buffer.from(
        `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
      ).toString("base64");

      const response = await fetch(
        `https://verify.twilio.com/v2/Services/${provider.serviceSid}/VerificationCheck`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            To: norm.e164,
            Code: cleanOtp,
          }),
        }
      );

      const data = await response.json();

      if (data.status === "approved" && data.valid === true) {
        return {
          success: true,
          verified: true,
          normalizedPhone: norm.e164,
          rawDigits: norm.rawDigits,
        };
      }

      return {
        success: false,
        error: "Incorrect verification code. Please check the SMS received on your phone.",
      };
    } catch (err) {
      console.error("[Twilio Verify Check Exception]", err);
      return {
        success: false,
        error: "Error verifying with Twilio. Please try again.",
      };
    }
  }

  // 2. Verify with internal store (Fast2SMS / Test)
  const record = internalOtpStore.get(norm.e164);
  if (!record) {
    return {
      success: false,
      error: "No active verification session found. Please request a new OTP.",
    };
  }

  if (Date.now() > record.expiresAt) {
    internalOtpStore.delete(norm.e164);
    return {
      success: false,
      error: "Verification code has expired. Please request a new code.",
    };
  }

  record.attempts += 1;
  if (record.attempts > MAX_VERIFY_ATTEMPTS) {
    internalOtpStore.delete(norm.e164);
    return {
      success: false,
      error: "Too many incorrect attempts. Please request a new verification code.",
    };
  }

  const checkHash = crypto
    .createHash("sha256")
    .update(`${record.salt}:${cleanOtp}`)
    .digest("hex");

  if (checkHash !== record.hash) {
    return {
      success: false,
      error: `Incorrect code. ${MAX_VERIFY_ATTEMPTS - record.attempts} attempt(s) remaining.`,
    };
  }

  // Verified! Clear the OTP session
  internalOtpStore.delete(norm.e164);

  return {
    success: true,
    verified: true,
    normalizedPhone: norm.e164,
    rawDigits: norm.rawDigits,
  };
}
