import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://lumora.systems/sitemap.xml",
    host: "https://lumora.systems",
  };
}
