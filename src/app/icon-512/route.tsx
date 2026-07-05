import { ImageResponse } from "next/og";
import { HaloGlyph } from "@/lib/brandArt";

// 512×512 PNG (PWA / manifest large icon).
export function GET() {
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
        <HaloGlyph px={430} />
      </div>
    ),
    { width: 512, height: 512 },
  );
}
