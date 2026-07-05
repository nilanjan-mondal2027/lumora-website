"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  DOT_NODE,
  EDGES,
  HALO_RADIUS,
  LAYOUTS,
  NODE_COUNT,
  NODE_IS_DOT,
  NODE_ORDER,
  NODE_SIDE,
  NODE_SIZES,
  SPLIT_LAYOUT,
} from "@/lib/schematicLayouts";
import { proofDipAt } from "@/lib/story";

// Temperature system (story-spec §3). volt = raw/machine, lumen = engineered.
// Colours live in globals.css as tokens; WebGL needs the literal values, so the
// three/ layer is the sanctioned place to mirror them (temperature rule).
const VOLT = "#3d8bff";
const LUMEN = "#dea82f";

// Screen-space "protect the type" falloff (P1.2b): fade nodes/lines inside the
// hero copy zone so the field frames the words instead of contesting them. Both
// shaders pass NDC to the fragment and reuse this snippet.
const COPY_FALLOFF = /* glsl */ `
  float copyProtect(vec2 ndc, vec2 center, float radius, float strength) {
    float cd = distance(ndc, center);
    return mix(1.0, smoothstep(radius * 0.35, radius, cd), strength);
  }
`;

const POINT_VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aOrder;
  attribute float aSide;
  attribute float aIsDot;
  attribute float aTwinkle;
  uniform float uPixelRatio;
  uniform float uConverge;
  uniform float uProof;
  uniform float uTime;
  varying float vAlpha;
  varying float vOrder;
  varying float vSide;
  varying float vIsDot;
  varying float vTwinkle;
  varying float vFogDepth;
  varying vec2 vNdc;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vFogDepth = -mvPosition.z;
    // Per-node scintillation (P2.5): 8% brightness twinkle at a per-node phase +
    // speed so the field never reads static during the slow camera keyframes.
    vTwinkle = 1.0 + 0.08 * sin(uTime * (1.2 + aTwinkle) + aTwinkle * 6.2831);
    // At rest the ring UNIFORMISES to one small node size — subtle highlights that
    // ride the continuous Halo stroke; the dot node stays 1.6× larger, a distinct
    // light source in the gap (halo-icon.svg / §6). Shrunk further during Proof so
    // the field sits quiet behind the quotes (P2.4d).
    float ringRest = 0.62;
    float restSize = mix(ringRest, ringRest * 1.6, aIsDot);
    float sz = mix(aSize, restSize, uConverge) * (1.0 - 0.5 * uProof);
    // Clamp max sprite size so nodes near the close-orbit camera (keyframe 0.78) stay
    // bounded points of light, not giant cotton blobs (P2.5 — sharp points, not blobs).
    gl_PointSize = min(sz * uPixelRatio * (240.0 / -mvPosition.z), 130.0);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = clamp(1.0 - (-mvPosition.z / 26.0), 0.25, 1.0);
    vOrder = aOrder;
    vSide = aSide;
    vIsDot = aIsDot;
    vNdc = gl_Position.xy / gl_Position.w;
  }
`;

// warmth crosses each node as uTemp passes its aOrder (story-spec §3, corrected):
// mix(volt, lumen, smoothstep(aOrder-0.12, aOrder+0.12, uTemp)). aOrder∈[0.12,0.88]
// → fully volt at uTemp 0, fully lumen at 1.
const POINT_FRAGMENT = /* glsl */ `
  uniform vec3 uVolt;
  uniform vec3 uLumen;
  uniform float uTemp;
  uniform float uSplit;
  uniform float uMorph;
  uniform float uConverge;
  uniform float uProof;
  uniform float uFogDensity;
  uniform vec2 uCopyCenter;
  uniform float uCopyRadius;
  uniform float uCopyStrength;
  varying float vAlpha;
  varying float vOrder;
  varying float vSide;
  varying float vIsDot;
  varying float vTwinkle;
  varying float vFogDepth;
  varying vec2 vNdc;
  ${COPY_FALLOFF}
  void main() {
    vec2 uv = gl_PointCoord.xy - 0.5;
    float dist = length(uv);
    // Bright, tight core + a small soft halo — distant stars, not soft cotton
    // (P2.5). Cold nodes get no bloom (it's lumen-gated), so the core carries the
    // punch. At rest the halo widens slightly so ring highlights still bridge.
    float core = smoothstep(0.13 - 0.03 * uConverge, 0.0, dist);
    float halo = smoothstep(0.42 + 0.06 * uConverge, 0.0, dist) * 0.42 * (1.0 - 0.12 * uConverge);
    float alpha = (core + halo) * vAlpha;
    alpha *= copyProtect(vNdc, uCopyCenter, uCopyRadius, uCopyStrength);
    // fade the designated dot node as it hands off to the DOM button (§6 morph)
    alpha *= 1.0 - vIsDot * uMorph;
    if (alpha < 0.01) discard;
    float warmth = smoothstep(vOrder - 0.12, vOrder + 0.12, uTemp);
    // Comparison split (§6): left half (vSide 0) stays cold volt, right half warms.
    warmth = mix(warmth, vSide * 0.62, uSplit);
    // Bright white-hot core-add (points of light); dimmed at rest so ring highlights
    // don't fight the continuous stroke (P2.5 / P2.4d). A small lift on cold nodes so
    // the volt starfield reads without bloom.
    // Cold stars get the full white-hot core (no bloom to help them); warm nodes get
    // less core-add since bloom already glows them — keeps warm points sharp, not cotton.
    vec3 color = mix(uVolt, uLumen, warmth) + vec3(core * 1.5 * (1.0 - 0.55 * uConverge) * (1.0 - 0.38 * warmth));
    color *= 1.0 + warmth * 0.9 + (1.0 - warmth) * 0.35;
    color *= vTwinkle; // per-node scintillation
    // The dot node reads brighter than the ring — a distinct light source in the
    // gap. Gated by (1 - uMorph) so it dims as it hands off to the CTA. fix 1b.
    color *= 1.0 + vIsDot * uConverge * (1.0 - uMorph) * 1.4;
    // Dim + fade the field during Proof so it recedes behind the quotes (P2.4d).
    color *= 1.0 - 0.5 * uProof;
    alpha *= 1.0 - 0.4 * uProof;
    // FogExp2 depth cue (P2.5): nodes at the back fade into the ink — genuine depth.
    // Applied in-shader (additive custom ShaderMaterials don't receive scene fog).
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * vFogDepth * vFogDepth);
    alpha *= 1.0 - fog * 0.5;
    gl_FragColor = vec4(color, alpha);
  }
`;

const LINE_VERTEX = /* glsl */ `
  varying vec2 vNdc;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    vNdc = gl_Position.xy / gl_Position.w;
  }
`;

const LINE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform vec2 uCopyCenter;
  uniform float uCopyRadius;
  uniform float uCopyStrength;
  varying vec2 vNdc;
  ${COPY_FALLOFF}
  void main() {
    float a = uOpacity * copyProtect(vNdc, uCopyCenter, uCopyRadius, uCopyStrength);
    gl_FragColor = vec4(uColor, a);
  }
`;

// L5 "Live system" signal pulses that travel along edges (story-spec §3). A small
// set of bright lumen points, positions lerped along assigned edges each frame,
// faded in only within the L5 range so pulses appear ONLY in the live state.
const PULSE_COUNT = 14;
const PULSE_VERTEX = /* glsl */ `
  uniform float uPixelRatio;
  varying float vAlpha;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 5.5 * uPixelRatio * (240.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
    vAlpha = clamp(1.0 - (-mvPosition.z / 26.0), 0.3, 1.0);
  }
`;
const PULSE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uStrength;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord.xy - 0.5);
    float core = smoothstep(0.5, 0.0, d);
    float a = core * vAlpha * uStrength;
    if (a < 0.01) discard;
    gl_FragColor = vec4(uColor + vec3(core * 0.6), a);
  }
`;

// P2.4d — the L6 Halo as a CONTINUOUS stroke (not a string of beads). A soft
// warm ring line fades in with converge so the settled ring reads as one object
// matching halo-icon.svg's stroke; the nodes ride it as subtle highlights. The
// 62° gap (centred +45°) is cut by the geometry arc + softened into round caps.
const HALO_STROKE_VERTEX = /* glsl */ `
  varying vec2 vLocal;
  void main() {
    vLocal = position.xy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const HALO_STROKE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uConverge;
  uniform float uRadius;
  uniform float uHalf;
  varying vec2 vLocal;
  void main() {
    float r = length(vLocal);
    float stroke = smoothstep(uHalf, 0.0, abs(r - uRadius)); // soft-edged ring line
    // round-ish caps: fade near the 62° gap edges (gap centred at 45°, half 31°).
    float ang = degrees(atan(vLocal.y, vLocal.x));
    float dGap = abs(mod(ang - 45.0 + 540.0, 360.0) - 180.0);
    float cap = smoothstep(31.0, 41.0, dGap);
    float a = stroke * cap * uConverge;
    if (a < 0.002) discard;
    gl_FragColor = vec4(uColor * (0.8 + stroke * 0.3), a * 0.78);
  }
`;

type CopyZone = { cx: number; cy: number; r: number } | null;

type SchematicPointsProps = {
  progressRef: { current: number };
  /** Layout set to interpolate (default the five LAYOUTS). Stage passes STORY_LAYOUTS. */
  layouts?: Float32Array[];
  /** progress → layout index into `layouts`. Default: use progress as the index directly. */
  mapIndex?: (p: number) => number;
  /** progress → uTemp (0..1). Default: the static `uTemp` prop. */
  mapTemp?: (p: number) => number;
  /** progress → comparison split strength (0..1). When set, nodes split into a
   *  generic grid (left) vs bespoke lattice (right) — story-spec §6. */
  mapSplit?: (p: number) => number;
  /** progress → convergence (0..1): eases the halo face-on + fades the mesh (§6). */
  mapConverge?: (p: number) => number;
  /** progress → dot→CTA morph (0..1): fades the canvas dot as the button takes over. */
  mapMorph?: (p: number) => number;
  /** Written each frame with the dot node's projected screen coords (for the morph). */
  dotScreenRef?: { current: { x: number; y: number; visible: boolean } };
  /** Lock to one layout (+ idle drift) — the P1.2 static hero used this. */
  staticPositions?: Float32Array;
  /** Static temperature when mapTemp is absent. */
  uTemp?: number;
  /** Screen-space copy zone (NDC) to protect; falloff is gated to the hero range. */
  copyZoneRef?: { current: CopyZone };
  jitter?: number;
  rotationSpeed?: number;
  parallax?: number;
};

export function SchematicPoints({
  progressRef,
  layouts,
  mapIndex,
  mapTemp,
  mapSplit,
  mapConverge,
  mapMorph,
  dotScreenRef,
  staticPositions,
  uTemp = 0,
  copyZoneRef,
  jitter = 0.09,
  rotationSpeed = 0.02,
  parallax = 0.12,
}: SchematicPointsProps) {
  const groupRef = useRef<THREE.Group>(null);
  const current = useMemo(() => new Float32Array(NODE_COUNT * 3), []);
  const colors = useMemo(() => ({ volt: new THREE.Color(VOLT), lumen: new THREE.Color(LUMEN) }), []);
  const dotWorld = useMemo(() => new THREE.Vector3(), []);
  const phases = useMemo(
    () =>
      Array.from({ length: NODE_COUNT }, (_, i) => {
        const x = Math.sin(i * 12.9898) * 43758.5453;
        return (x - Math.floor(x)) * Math.PI * 2;
      }),
    [],
  );
  // Per-node scintillation phase (P2.5), deterministic [0,1).
  const twinkle = useMemo(() => {
    const a = new Float32Array(NODE_COUNT);
    for (let i = 0; i < NODE_COUNT; i++) {
      const x = Math.sin(i * 78.233) * 43758.5453;
      a[i] = x - Math.floor(x);
    }
    return a;
  }, []);

  const pointsGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(current.slice(), 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(NODE_SIZES.slice(), 1));
    geometry.setAttribute("aOrder", new THREE.BufferAttribute(NODE_ORDER.slice(), 1));
    geometry.setAttribute("aSide", new THREE.BufferAttribute(NODE_SIDE.slice(), 1));
    geometry.setAttribute("aIsDot", new THREE.BufferAttribute(NODE_IS_DOT.slice(), 1));
    geometry.setAttribute("aTwinkle", new THREE.BufferAttribute(twinkle.slice(), 1));
    return geometry;
  }, [current, twinkle]);

  const lineGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(EDGES.length * 2 * 3);
    geometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    return geometry;
  }, []);

  const copyUniforms = useMemo(
    () => ({
      uCopyCenter: { value: new THREE.Vector2(-2, 0) },
      uCopyRadius: { value: 0.8 },
      uCopyStrength: { value: 0 },
    }),
    [],
  );

  const pointsMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: POINT_VERTEX,
        fragmentShader: POINT_FRAGMENT,
        uniforms: {
          uVolt: { value: new THREE.Color(VOLT) },
          uLumen: { value: new THREE.Color(LUMEN) },
          uTemp: { value: uTemp },
          uSplit: { value: 0 },
          uMorph: { value: 0 },
          uConverge: { value: 0 },
          uProof: { value: 0 },
          uTime: { value: 0 },
          uFogDensity: { value: 0.028 },
          uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1 },
          ...copyUniforms,
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const lineMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: LINE_VERTEX,
        fragmentShader: LINE_FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Color(VOLT) },
          uOpacity: { value: 0.11 },
          ...copyUniforms,
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const pulseData = useMemo(
    () =>
      Array.from({ length: PULSE_COUNT }, (_, k) => ({
        edge: EDGES[Math.floor((k / PULSE_COUNT) * EDGES.length) % EDGES.length],
        speed: 0.22 + (k % 5) * 0.05,
        phase: k / PULSE_COUNT,
      })),
    [],
  );
  const pulsePositions = useMemo(() => new Float32Array(PULSE_COUNT * 3), []);
  const pulseGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pulsePositions.slice(), 3));
    return g;
  }, [pulsePositions]);
  const pulseMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: PULSE_VERTEX,
        fragmentShader: PULSE_FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Color(LUMEN) },
          uStrength: { value: 0 },
          uPixelRatio: { value: typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 2) : 1 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  // The continuous Halo stroke (P2.4d). RingGeometry arc cut to the 62° gap (drawn
  // 76°→374°, i.e. gap 14°–76° centred at +45°); the shader soft-fades it to a thin
  // warm line with round-ish caps, opacity driven by converge.
  const haloStrokeGeometry = useMemo(
    () => new THREE.RingGeometry(HALO_RADIUS - 0.6, HALO_RADIUS + 0.6, 190, 1, (76 * Math.PI) / 180, (298 * Math.PI) / 180),
    [],
  );
  const haloStrokeMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: HALO_STROKE_VERTEX,
        fragmentShader: HALO_STROKE_FRAGMENT,
        uniforms: {
          uColor: { value: new THREE.Color(LUMEN) },
          uConverge: { value: 0 },
          uRadius: { value: HALO_RADIUS },
          uHalf: { value: 0.19 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [],
  );

  useFrame((state, delta) => {
    const layoutSet = layouts ?? LAYOUTS;
    const progress = progressRef.current;
    const temp = mapTemp ? mapTemp(progress) : uTemp;
    (pointsMaterial.uniforms.uTemp.value as number) = temp;
    const split = mapSplit ? mapSplit(progress) : 0;
    const converge = mapConverge ? mapConverge(progress) : 0;
    const morph = mapMorph ? mapMorph(progress) : 0;
    // Calm the field during Proof so it sits quiet behind the quotes (motion,
    // size, and brightness all damped by the same window). P2.4c/P2.4d.
    const proof = proofDipAt(progress);
    const proofCalm = 1 - 0.4 * proof;
    (pointsMaterial.uniforms.uSplit.value as number) = split;
    (pointsMaterial.uniforms.uMorph.value as number) = morph;
    (pointsMaterial.uniforms.uConverge.value as number) = converge;
    (pointsMaterial.uniforms.uProof.value as number) = proof;
    (haloStrokeMaterial.uniforms.uConverge.value as number) = converge;
    (lineMaterial.uniforms.uColor.value as THREE.Color).copy(colors.volt).lerp(colors.lumen, Math.max(0, Math.min(1, temp)));
    // P2.5: the connective mesh is near-killed (~0.05) so the FIELD OF LIGHT is the
    // subject, not a wireframe; quieter still during the split and gone at converge.
    (lineMaterial.uniforms.uOpacity.value as number) = 0.05 * (1 - split * 0.7) * (1 - converge);

    // Copy-zone protection — only over the hero range, and only if a zone is set.
    const zone = copyZoneRef?.current ?? null;
    let strength = 0;
    if (zone) {
      strength = 1 - (progress <= 0.04 ? 0 : progress >= 0.12 ? 1 : (progress - 0.04) / 0.08);
      (copyUniforms.uCopyCenter.value as THREE.Vector2).set(zone.cx, zone.cy);
      (copyUniforms.uCopyRadius.value as number) = zone.r;
    }
    (copyUniforms.uCopyStrength.value as number) = strength;

    const time = state.clock.elapsedTime;
    (pointsMaterial.uniforms.uTime.value as number) = time;
    // L0 hero motion (P2.5): a slow spiralling gather-vortex, blended out as the
    // story begins (~0.11). The field looks like a system starting to organise.
    const heroWeight = progress >= 0.11 ? 0 : progress <= 0.02 ? 1 : 1 - (progress - 0.02) / 0.09;
    const vortexRot = 0.3 * time; // ~0.3 rad/s continuous
    const vortexPull = heroWeight > 0.001 ? Math.sin(((time % 12) / 12) * Math.PI) * 0.45 : 0; // gather→release, restart 12s
    const rawIdx = mapIndex ? mapIndex(progress) : progress;
    const pIdx = Math.max(0, Math.min(layoutSet.length - 1, rawIdx));
    const lowerIndex = Math.floor(pIdx);
    const upperIndex = Math.min(layoutSet.length - 1, lowerIndex + 1);
    const t = pIdx - lowerIndex;
    const lower = layoutSet[lowerIndex];
    const upper = layoutSet[upperIndex];

    const mech = Math.sin(time * 3.2) * 0.028; // synchronized, lifeless twitch for the generic grid
    for (let i = 0; i < NODE_COUNT; i++) {
      const ix = i * 3;
      let baseX: number, baseY: number, baseZ: number;
      if (staticPositions) {
        baseX = staticPositions[ix];
        baseY = staticPositions[ix + 1];
        baseZ = staticPositions[ix + 2];
      } else {
        baseX = lower[ix] + (upper[ix] - lower[ix]) * t;
        baseY = lower[ix + 1] + (upper[ix + 1] - lower[ix + 1]) * t;
        baseZ = lower[ix + 2] + (upper[ix + 2] - lower[ix + 2]) * t;
      }
      if (split > 0) {
        baseX += (SPLIT_LAYOUT[ix] - baseX) * split;
        baseY += (SPLIT_LAYOUT[ix + 1] - baseY) * split;
        baseZ += (SPLIT_LAYOUT[ix + 2] - baseZ) * split;
      }
      if (heroWeight > 0.001) {
        // Spiral about the frame centre: rotate the node + pull it inward, blended
        // by heroWeight so it only shapes the hero and never fights the scroll morph.
        const ang = Math.atan2(baseY, baseX) + vortexRot;
        const rad = Math.hypot(baseX, baseY) * (1 - vortexPull);
        baseX += (Math.cos(ang) * rad - baseX) * heroWeight;
        baseY += (Math.sin(ang) * rad - baseY) * heroWeight;
      }
      const phase = phases[i];
      let jx = Math.sin(time * 0.35 + phase) * jitter;
      let jy = Math.cos(time * 0.3 + phase * 1.3) * jitter;
      let jz = Math.sin(time * 0.25 + phase * 0.7) * jitter;
      if (split > 0 && NODE_SIDE[i] < 0.5) {
        // generic (left) half: swap organic drift for a synchronized mechanical twitch
        jx = jx * (1 - split) + mech * split;
        jy = jy * (1 - split) + mech * 0.7 * split;
        jz = jz * (1 - split);
      }
      // Fade all drift to zero as the Halo converges so nodes land exactly on
      // HALO_L6 (zero jitter at rest) — a clean ring, not a soft cluster on a path.
      // Also damped during Proof (proofCalm) so the field is quiet behind the quotes.
      const settle = (1 - converge) * proofCalm;
      current[ix] = baseX + jx * settle;
      current[ix + 1] = baseY + jy * settle;
      current[ix + 2] = baseZ + jz * settle;
    }

    const posAttr = pointsGeometry.getAttribute("position") as THREE.BufferAttribute;
    (posAttr.array as Float32Array).set(current);
    posAttr.needsUpdate = true;

    const lineAttr = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
    const lineArray = lineAttr.array as Float32Array;
    for (let e = 0; e < EDGES.length; e++) {
      const [a, b] = EDGES[e];
      const ai = a * 3;
      const bi = b * 3;
      const base = e * 6;
      lineArray[base] = current[ai];
      lineArray[base + 1] = current[ai + 1];
      lineArray[base + 2] = current[ai + 2];
      lineArray[base + 3] = current[bi];
      lineArray[base + 4] = current[bi + 1];
      lineArray[base + 5] = current[bi + 2];
    }
    lineAttr.needsUpdate = true;

    // L5 signal pulses — active only within the live-system range (≈0.72–0.90).
    const s1 = Math.max(0, Math.min(1, (progress - 0.64) / 0.08));
    // Fade pulses out by ~.91 (before the ring forms at .96) so the settling Halo
    // reads as a clean stroke, not lit by lingering signal pulses (P2.4c).
    const s2 = Math.max(0, Math.min(1, (progress - 0.86) / 0.05));
    const pulseStrength = s1 * (1 - s2);
    (pulseMaterial.uniforms.uStrength.value as number) = pulseStrength;
    if (pulseStrength > 0.001) {
      for (let k = 0; k < PULSE_COUNT; k++) {
        const { edge, speed, phase } = pulseData[k];
        const tt = (time * speed + phase) % 1;
        const ai = edge[0] * 3;
        const bi = edge[1] * 3;
        pulsePositions[k * 3] = current[ai] + (current[bi] - current[ai]) * tt;
        pulsePositions[k * 3 + 1] = current[ai + 1] + (current[bi + 1] - current[ai + 1]) * tt;
        pulsePositions[k * 3 + 2] = current[ai + 2] + (current[bi + 2] - current[ai + 2]) * tt;
      }
      const pulseAttr = pulseGeometry.getAttribute("position") as THREE.BufferAttribute;
      (pulseAttr.array as Float32Array).set(pulsePositions);
      pulseAttr.needsUpdate = true;
    }

    if (groupRef.current) {
      const g = groupRef.current;
      // The split AND the finale convergence both want the field face-on and steady.
      const steady = Math.max(split, converge);
      if (steady > 0.001) {
        const faceOn = Math.round(g.rotation.y / (Math.PI * 2)) * Math.PI * 2;
        g.rotation.y += (faceOn - g.rotation.y) * 0.06 * steady + delta * rotationSpeed * (1 - steady);
      } else {
        g.rotation.y += delta * rotationSpeed;
      }
      // L5 "structure breathes" — a subtle scale pulse, only while the live system is active.
      g.scale.setScalar(1 + Math.sin(time * 0.6) * 0.015 * pulseStrength);
      const pl = parallax * (1 - steady * 0.85);
      const targetX = -state.pointer.y * pl;
      const targetY = state.pointer.x * pl;
      g.rotation.x += (targetX - g.rotation.x) * 0.04;
      g.rotation.z += (targetY - g.rotation.z) * 0.04;

      // Project the dot node to screen space for the §6 dot→CTA morph handoff.
      if (dotScreenRef && converge > 0.001) {
        g.updateWorldMatrix(true, false);
        dotWorld.set(current[DOT_NODE * 3], current[DOT_NODE * 3 + 1], current[DOT_NODE * 3 + 2]);
        dotWorld.applyMatrix4(g.matrixWorld).project(state.camera);
        dotScreenRef.current.x = (dotWorld.x * 0.5 + 0.5) * state.size.width;
        dotScreenRef.current.y = (-dotWorld.y * 0.5 + 0.5) * state.size.height;
        dotScreenRef.current.visible = dotWorld.z < 1 && dotWorld.z > -1;
      }
    }
  });
  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeometry} material={lineMaterial} />
      <mesh geometry={haloStrokeGeometry} material={haloStrokeMaterial} />
      <points geometry={pointsGeometry} material={pointsMaterial} />
      <points geometry={pulseGeometry} material={pulseMaterial} />
    </group>
  );
}
