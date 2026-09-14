import type { MetadataRoute } from "next";
import { NAV } from "@/config/site";
import { TOKEN } from "@/config/token";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return NAV.map((n) => ({
    url: `${TOKEN.siteUrl}${n.href}`,
    lastModified: now,
    changeFrequency: n.href === "/" ? "hourly" : "daily",
    priority: n.href === "/" ? 1 : 0.8,
  }));
}
