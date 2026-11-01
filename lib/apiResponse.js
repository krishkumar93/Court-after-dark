// lib/apiResponse.js
// Standardized JSON response helpers for Next.js route handlers.

import { NextResponse } from "next/server";

export function apiSuccess(data = {}, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function apiCreated(data = {}) {
  return NextResponse.json({ success: true, ...data }, { status: 201 });
}

export function apiError(message = "An error occurred", status = 400, details = null) {
  const payload = { error: message };
  if (details) payload.details = details;
  return NextResponse.json(payload, { status });
}

export function apiUnauthorized(message = "Authentication required. Please sign in.") {
  return apiError(message, 401);
}

export function apiForbidden(message = "Access denied. Insufficient permissions.") {
  return apiError(message, 403);
}

export function apiNotFound(message = "Requested resource not found.") {
  return apiError(message, 404);
}

