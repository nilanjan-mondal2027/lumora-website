import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Lumora — AI Business Engineering",
    short_name: "Lumora",
    description:
      "Custom AI-powered business systems, engineered into how your business actually operates.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0e1a",
    theme_color: "#0a0e1a",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-32", type: "image/png", sizes: "32x32" },
      { src: "/apple-icon", type: "image/png", sizes: "180x180" },
      { src: "/icon-512", type: "image/png", sizes: "512x512", purpose: "any" },
    ],
  };
}
