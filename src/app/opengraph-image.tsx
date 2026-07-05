import { ImageResponse } from "next/og";
import { HALO_RING_D, WORDMARK_D } from "@/lib/brandArt";

// Default OG image (1200×630) — story-spec §10 placeholder: ink field, Halo
// lockup left, thin lumen rule. Per-route titles are deferred (need an embedded
// display font); the vector wordmark keeps this font-free.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Lumora — AI Business Engineering";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          background: "#0A0E1A",
          padding: "96px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <svg width="104" height="104" viewBox="0 0 120 120" fill="none">
            <path
              d={HALO_RING_D}
              fill="none"
              stroke="#F7F6F1"
              strokeWidth="12.5"
              strokeLinecap="round"
            />
            <circle cx="86.16" cy="33.84" r="7.2" fill="#DEA82F" />
          </svg>
          <svg height="66" viewBox="0 -74 330 80" fill="none">
            <path d={WORDMARK_D} fill="#F7F6F1" />
          </svg>
        </div>
        <div style={{ display: "flex", height: "2px", width: "100%", background: "#DEA82F" }} />
      </div>
    ),
    { ...size },
  );
}
