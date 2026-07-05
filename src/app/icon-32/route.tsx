import { ImageResponse } from "next/og";
import { HaloGlyph } from "@/lib/brandArt";

// 32×32 PNG favicon (legacy / manifest). SVG favicon lives at app/icon.svg.
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
        <HaloGlyph px={30} />
      </div>
    ),
    { width: 32, height: 32 },
  );
}
