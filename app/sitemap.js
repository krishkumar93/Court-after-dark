// app/sitemap.js
// Next.js dynamic XML sitemap generator for search indexation

import { MOCK_FACILITIES } from "@/lib/mockData";

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://courtsafterdark.com";
  const now = new Date();

  const staticRoutes = [
    "",
    "/facilities",
    "/equipment",
    "/search",
    "/help",
    "/bookings",
    "/login",
    "/register",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/facilities" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));

  const facilityRoutes = (MOCK_FACILITIES || []).map((f) => ({
    url: `${baseUrl}/facilities/${f._id}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.9,
  }));

  return [...staticRoutes, ...facilityRoutes];
}
