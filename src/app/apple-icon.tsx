import { ImageResponse } from "next/og";
import { HaloGlyph } from "@/lib/brandArt";

// Apple touch icon (180×180 PNG) generated from the Halo geometry via next/og.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          background: "#111726",
        }}
      >
        <HaloGlyph px={150} />
      </div>
    ),
    { ...size },
  );
}
