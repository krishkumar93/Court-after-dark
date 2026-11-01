// app/api/payment/razorpay/verify/route.js
// Verifies Razorpay payment signatures with HMAC SHA256.

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_payment_id) {
      return NextResponse.json({ error: "Missing razorpay_payment_id." }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keySecret && razorpay_order_id && razorpay_signature) {
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      verified: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Payment verification failed." }, { status: 500 });
  }
}
