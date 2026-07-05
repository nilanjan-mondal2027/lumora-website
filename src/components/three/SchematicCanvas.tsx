"use client";

import { Canvas } from "@react-three/fiber";
import { SchematicPoints } from "./SchematicPoints";
import { GlowBackdrop } from "./GlowBackdrop";

export function SchematicCanvas({
  progressRef,
  className = "",
  rotationSpeed,
  parallax,
  jitter,
}: {
  progressRef: { current: number };
  className?: string;
  rotationSpeed?: number;
  parallax?: number;
  jitter?: number;
}) {
  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 13], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <GlowBackdrop />
        <SchematicPoints
          progressRef={progressRef}
          rotationSpeed={rotationSpeed}
          parallax={parallax}
          jitter={jitter}
        />
      </Canvas>
    </div>
  );
}
