// app/robots.js
// Next.js dynamic robots.txt generator

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://courtsafterdark.com";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/admin/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
