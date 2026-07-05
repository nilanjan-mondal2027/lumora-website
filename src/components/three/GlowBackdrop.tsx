"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// Temperature-driven ambient (story-spec §3 / CLAUDE.md temperature rule). volt
// while the field is raw, then — as uTemp climbs through the finale — the volt
// fades to ink and a soft lumen radial blooms behind the converging Halo, so the
// destination reads "deep ink field with a warm Halo", never "blue slab".
const VOLT = "#3d8bff";
const LUMEN = "#dea82f";

const GLOW_VERTEX = /* glsl */ `
  varying vec2 vNdc;
  void main() {
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vNdc = clip.xy / clip.w;
    gl_Position = clip;
  }
`;

// The radial is measured in screen space (NDC) from uCenter — the projected ring
// optical centre — with an aspect correction so the glow is a true circle centred
// on the mark, not the screen. Amounts premultiplied into rgb (alpha 1, additive)
// so volt and lumen cross-fade independently on the uTemp curve; at uTemp 1.0 the
// volt is gone (pure ink) and only the tight lumen radial rides.
const GLOW_FRAGMENT = /* glsl */ `
  uniform vec3 uVolt;
  uniform vec3 uLumen;
  uniform float uTemp;
  uniform vec2 uCenter;
  uniform float uAspect;
  varying vec2 vNdc;
  void main() {
    vec2 d = vNdc - uCenter;
    d.x *= uAspect;
    float dist = length(d) * 0.5;
    // Raw volt ambient — full while cold, gone by the finale.
    float voltAmt = smoothstep(1.15, 0.0, dist) * 0.16 * (1.0 - smoothstep(0.65, 1.0, uTemp));
    // Warm lumen halo — tight, hugging the ring, so the outer field stays deep ink.
    float lumenAmt = smoothstep(0.5, 0.0, dist) * 0.13 * smoothstep(0.8, 1.0, uTemp);
    vec3 color = uVolt * voltAmt + uLumen * lumenAmt;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export function GlowBackdrop({
  progressRef,
  mapTemp,
}: {
  progressRef?: { current: number };
  mapTemp?: (p: number) => number;
}) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: GLOW_VERTEX,
        fragmentShader: GLOW_FRAGMENT,
        uniforms: {
          uVolt: { value: new THREE.Color(VOLT) },
          uLumen: { value: new THREE.Color(LUMEN) },
          uTemp: { value: 0 },
          uCenter: { value: new THREE.Vector2(0, 0) },
          uAspect: { value: 1.6 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  // Ring optical centre = the HALO_L6 centre (world origin, invariant under the
  // group's face-on rotation). Project it each frame so the warm glow stays locked
  // on the mark, and feed the viewport aspect so the radial reads circular.
  const center = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    if (progressRef && mapTemp) {
      (material.uniforms.uTemp.value as number) = mapTemp(progressRef.current);
    }
    center.set(0, 0, 0).project(state.camera);
    (material.uniforms.uCenter.value as THREE.Vector2).set(center.x, center.y);
    (material.uniforms.uAspect.value as number) = state.size.width / Math.max(1, state.size.height);
  });

  return (
    <mesh position={[0, 0, -9]} material={material}>
      <planeGeometry args={[60, 60]} />
    </mesh>
  );
}
