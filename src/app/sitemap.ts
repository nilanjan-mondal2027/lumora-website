import type { MetadataRoute } from "next";

const BASE = "https://lumora.systems";
const ROUTES = ["", "/solutions", "/systems", "/about", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-07-03");
  return ROUTES.map((r) => ({
    url: `${BASE}${r}`,
    lastModified,
    changeFrequency: "monthly" as const,
    priority: r === "" ? 1 : 0.8,
  }));
}
