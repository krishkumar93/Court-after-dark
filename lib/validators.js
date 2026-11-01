// lib/validators.js
// Client and server validation helpers for forms, input security, and booking constraints.

export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  // RFC 5322 compliant simplified email regex
  const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  return re.test(email.trim());
}

export function evaluatePasswordStrength(password) {
  if (!password || typeof password !== "string") {
    return { score: 0, label: "Too short", passed: false, requirements: ["At least 6 characters"] };
  }

  const requirements = [];
  let score = 0;

  if (password.length >= 6) {
    score += 1;
  } else {
    requirements.push("At least 6 characters");
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one uppercase letter");
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one number");
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    requirements.push("At least one special character");
  }

  const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
  return {
    score,
    label: labels[score] || "Weak",
    passed: score >= 2,
    requirements,
  };
}

export function isValidName(name) {
  if (!name || typeof name !== "string") return false;
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 50;
}

export function isValidPhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, "");
  return cleaned.length >= 7 && cleaned.length <= 15 && /^\d+$/.test(cleaned);
}

export function isValidBookingDate(dateString, maxAdvanceDays = 14) {
  if (!dateString || typeof dateString !== "string") return false;
  const target = new Date(dateString + "T00:00:00");
  if (isNaN(target.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxAdvanceDays);

  return target >= today && target <= maxDate;
}

export function sanitizeText(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[<>]/g, "").trim();
}
