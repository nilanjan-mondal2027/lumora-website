"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import type { BloomEffect } from "postprocessing";
import { CameraRig } from "./CameraRig";
import { SchematicPoints } from "./SchematicPoints";
import { GlowBackdrop } from "./GlowBackdrop";
import { STORY_LAYOUTS, convergeAt, layoutIndexAt, morphAt, proofDipAt, splitAt, uTempAt } from "@/lib/story";

// Ring-precision at rest (P2.4b): as the Halo converges, ease bloom intensity
// down ~45% and lift the luminance threshold so only the ring's cores bloom —
// the settled ring reads sharp, not nebulous. Driven in-frame (no React state).
function BloomRig({
  bloomRef,
  progressRef,
}: {
  bloomRef: React.RefObject<BloomEffect | null>;
  progressRef: { current: number };
}) {
  useFrame(() => {
    const b = bloomRef.current;
    if (!b) return;
    const c = convergeAt(progressRef.current);
    // Ease bloom well down at rest (P2.4c: another ~30% on top of P2.4b) and lift the
    // threshold so only the ring/dot cores bloom — the ring reads as a stroke, not bulbs.
    // Also drop it during Proof so bright node blobs don't compete with the quotes.
    const proof = proofDipAt(progressRef.current);
    b.intensity = 0.7 * (1 - 0.62 * c) * (1 - 0.9 * proof);
    b.luminanceMaterial.threshold = 1.35 + 0.55 * c + 1.4 * proof;
  });
  return null;
}

// The single persistent story canvas. Camera driven by the §4 rig; nodes
// interpolate STORY_LAYOUTS (L0→L5) and warm (volt→lumen) per the global
// progress ref. Selective bloom keys off lumen (bright) — near-inert while cold,
// blooming as the story warms. dpr [1,1.75], FOV 42 (§4 progress-0 keyframe).
export function StageCanvas({
  progressRef,
  bloom,
  copyZoneRef,
  dotScreenRef,
  className = "",
}: {
  progressRef: { current: number };
  bloom: boolean;
  copyZoneRef?: { current: { cx: number; cy: number; r: number } | null };
  dotScreenRef?: { current: { x: number; y: number; visible: boolean } };
  className?: string;
}) {
  const bloomRef = useRef<BloomEffect | null>(null);
  return (
    <div className={className} aria-hidden>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 14], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <CameraRig progressRef={progressRef} />
        <GlowBackdrop progressRef={progressRef} mapTemp={uTempAt} />
        <SchematicPoints
          progressRef={progressRef}
          layouts={STORY_LAYOUTS}
          mapIndex={layoutIndexAt}
          mapTemp={uTempAt}
          mapSplit={splitAt}
          mapConverge={convergeAt}
          mapMorph={morphAt}
          dotScreenRef={dotScreenRef}
          copyZoneRef={copyZoneRef}
          rotationSpeed={0.02}
          parallax={0.105}
          jitter={0.1}
        />
        {bloom && (
          <>
            <BloomRig bloomRef={bloomRef} progressRef={progressRef} />
            <EffectComposer>
              <Bloom
                ref={bloomRef}
                mipmapBlur
                luminanceThreshold={1.35}
                luminanceSmoothing={0.2}
                intensity={0.7}
                radius={0.42}
              />
            </EffectComposer>
          </>
        )}
      </Canvas>
    </div>
  );
}
