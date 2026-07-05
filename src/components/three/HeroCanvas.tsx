"use client";

import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { SchematicPoints } from "./SchematicPoints";
import { GlowBackdrop } from "./GlowBackdrop";
import { SCATTER_L0 } from "@/lib/schematicLayouts";

// Hero backdrop canvas: L0 Scatter, camera at the story-spec §4 progress-0 keyframe
// (position (0,0,14), FOV 42). Bloom is SELECTIVE to lumen (§3): it only runs when
// uTemp > 0 (i.e. once engineered/warm nodes exist) — so the cold hero (uTemp 0)
// has nothing to bloom, stays cold, and pays no post-processing cost (holds 60fps).
export function HeroCanvas({
  bloom,
  uTemp = 0,
  className = "",
}: {
  bloom: boolean;
  uTemp?: number;
  className?: string;
}) {
  const progressRef = useRef(0); // hero is static L0; kept for the shared API
  const bloomActive = bloom && uTemp > 0.01;

  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 14], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <GlowBackdrop />
        <SchematicPoints
          progressRef={progressRef}
          staticPositions={SCATTER_L0}
          uTemp={uTemp}
          rotationSpeed={0.02}
          parallax={0.105} /* ±6° */
          jitter={0.12}
        />
        {bloomActive && (
          <EffectComposer>
            <Bloom
              mipmapBlur
              luminanceThreshold={1.0}
              luminanceSmoothing={0.2}
              intensity={0.9}
              radius={0.6}
            />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  );
}
