// lib/rateLimit.js
// In-memory sliding-window rate limiter for sensitive authentication & booking endpoints.

const rateLimitMap = new Map();

/**
 * Check whether a client request violates rate limits.
 * @param {string} identifier - Client IP or user ID
 * @param {number} maxRequests - Max requests allowed in window
 * @param {number} windowMs - Window duration in milliseconds (default 60s)
 * @returns {{ allowed: boolean, remaining: number, resetTime: number }}
 */
export function checkRateLimit(identifier, maxRequests = 20, windowMs = 60000) {
  const now = Date.now();
  const clientData = rateLimitMap.get(identifier) || { count: 0, resetTime: now + windowMs };

  // If window expired, reset counter
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + windowMs;
    rateLimitMap.set(identifier, clientData);
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: clientData.resetTime,
    };
  }

  // Increment within window
  clientData.count += 1;
  rateLimitMap.set(identifier, clientData);

  if (clientData.count > maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: clientData.resetTime,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - clientData.count),
    resetTime: clientData.resetTime,
  };
}

// Periodic cleanup of stale rate limits every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }, 300000);
}
