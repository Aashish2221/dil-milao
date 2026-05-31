import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/signup", "/login", "/terms", "/privacy"],
        disallow: ["/discover", "/matches", "/chat", "/profile", "/settings", "/notifications", "/liked-you", "/my-likes", "/admin", "/setup", "/premium"],
      },
    ],
    sitemap: "https://dil-milao.vercel.app/sitemap.xml",
  };
}
