// lib/paymentConfig.js
// Central payment configuration for Courts After Dark (UPI, INR Currency & Gateway settings)

export const MERCHANT_CONFIG = {
  name: process.env.NEXT_PUBLIC_MERCHANT_NAME || "Courts After Dark",
  upiId: process.env.NEXT_PUBLIC_MERCHANT_UPI_ID || "7828722557@ptyes",
  currency: "INR",
  currencySymbol: "₹",
};

/**
 * Builds standard Indian UPI Intent URI
 * e.g. upi://pay?pa=7828722557@ptyes&pn=Courts%20After%20Dark&am=450.00&cu=INR&tn=CAD-MatchPass
 */
export function buildUpiIntentUri({
  upiId = MERCHANT_CONFIG.upiId,
  merchantName = MERCHANT_CONFIG.name,
  amount = 0,
  transactionNote = "Courts After Dark Booking",
  refId,
}) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    am: Number(amount).toFixed(2),
    cu: "INR",
    tn: transactionNote.slice(0, 50),
  });

  if (refId) {
    params.append("tr", refId);
  }

  return `upi://pay?${params.toString()}`;
}

/**
 * Generates dynamic QR code image URL for a given UPI Payment URI
 */
export function buildUpiQrCodeUrl(upiUri, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(
    upiUri
  )}`;
}
