// The story engine's shared math (story-spec §3–§5). Deliberately THREE-free so
// the (initial-bundle) ScrollStage can import CHAPTERS without pulling three.js
// in — CameraRig/SchematicPoints (in the lazy canvas chunk) consume the rest.

import { HALO_L6, LAYOUTS, SCATTER_L0 } from "./schematicLayouts";

// Ordered layout states L0..L6 (§2/§3). SCATTER_L0 is the entry state, the
// existing five are L1–L5, and HALO_L6 is the finale convergence.
export const STORY_LAYOUTS: Float32Array[] = [SCATTER_L0, ...LAYOUTS, HALO_L6];

export type Chapter = { key: string; label: string; start: number; end: number };

// §5 chapter map (scroll ranges of the pinned stage).
export const CHAPTERS: Chapter[] = [
  { key: "hero", label: "Hero", start: 0.0, end: 0.12 },
  { key: "philosophy", label: "Philosophy", start: 0.12, end: 0.24 },
  { key: "why", label: "Why Generic Fails", start: 0.24, end: 0.38 },
  { key: "method", label: "Method", start: 0.38, end: 0.72 },
  { key: "solutions", label: "Solutions", start: 0.72, end: 0.82 },
  { key: "proof", label: "Proof", start: 0.82, end: 0.9 },
  { key: "finale", label: "Finale", start: 0.9, end: 1.0 },
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

function piecewise(keys: readonly (readonly [number, number])[], p: number): number {
  const x = clamp01(p);
  for (let i = 0; i < keys.length - 1; i++) {
    const [x0, y0] = keys[i];
    const [x1, y1] = keys[i + 1];
    if (x <= x1) {
      const t = x1 === x0 ? 0 : (x - x0) / (x1 - x0);
      return y0 + (y1 - y0) * t;
    }
  }
  return keys[keys.length - 1][1];
}

// Global progress → layout index over STORY_LAYOUTS (0 = L0 … 5 = L5). Monotonic
// for P2.1: §5's literal "Method L1→L5" would dip L2→L1 at 0.38 (boot Q2) — that
// per-phase stepping is deferred to P2.2's Method chapter; here it reads L0→L5.
const LAYOUT_KEYS = [
  [0.0, 0],
  [0.12, 0],
  [0.24, 1],
  [0.38, 2],
  [0.72, 5],
  [0.9, 5],
  [0.96, 6], // ring fully formed by .96 — so the Halo mark (+ distinct dot) reads
  [1.0, 6], // before the dot hands off to the CTA (morph .97→1.0)
] as const;

export function layoutIndexAt(p: number): number {
  return piecewise(LAYOUT_KEYS, p);
}

// Per-layout temperature (§3): L0..L6. Warmth follows the layout progression.
const LAYOUT_UTEMP = [0, 0.08, 0.2, 0.4, 0.65, 0.85, 1.0];

const smoothstep = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

// Comparison split strength (§6), gated to the Why chapter (0.24–0.38): ramps in,
// holds, ramps out. 0 elsewhere → the constellation only splits during Why.
export function splitAt(p: number): number {
  return Math.min(smoothstep(0.24, 0.285, p), 1 - smoothstep(0.335, 0.38, p));
}

// Finale (§6). Convergence eases the halo to face-on across .88→.98; the dot→CTA
// morph triggers at .97 (per §6 "progress > 0.97"). Both reverse when scrubbed back.
export function convergeAt(p: number): number {
  // Settle by .96 (aligned with the L6 position morph) so the ring is fully formed
  // and sharp before the dot→CTA handoff begins at .97.
  return smoothstep(0.86, 0.96, p);
}
// The crossfade: the canvas dot fades out (uMorph) while the DOM button fades in
// AT the same projected coords across .97→.985 — a zero-jump handoff. The button
// then FLIP-travels to its natural slot over .985→1.00 (see ScrollStage driver).
export function morphAt(p: number): number {
  return smoothstep(0.97, 0.985, p);
}
export function morphTravelAt(p: number): number {
  return smoothstep(0.985, 1.0, p);
}

// Proof chapter (.82–.90) "calm behind the quotes" window (P2.4c): ramps in,
// holds, ramps out. Cools the field (uTemp dip → minimal bloom) and damps node
// motion so the human testimonials read without competition. 0 outside Proof.
export function proofDipAt(p: number): number {
  return Math.min(smoothstep(0.815, 0.84, p), 1 - smoothstep(0.875, 0.9, p));
}

export function uTempAt(p: number): number {
  const li = layoutIndexAt(p);
  const lo = Math.floor(li);
  const hi = Math.min(LAYOUT_UTEMP.length - 1, lo + 1);
  const base = LAYOUT_UTEMP[lo] + (LAYOUT_UTEMP[hi] - LAYOUT_UTEMP[lo]) * (li - lo);
  // Cool to ~0.35 during Proof so bloom is minimal behind the testimonials.
  const dip = proofDipAt(p);
  return base * (1 - dip) + 0.35 * dip;
}

// §4 camera keyframes. lookAt targets are all ≈origin here (cluster centroid and
// ring centre both sit at the origin); refined in P2.2/P2.4.
type Vec3 = readonly [number, number, number];
export const CAMERA_KEYS: { p: number; pos: Vec3; look: Vec3 }[] = [
  { p: 0.0, pos: [0, 0, 14], look: [0, 0, 0] },
  { p: 0.14, pos: [3, 1.2, 10.5], look: [0, 0, 0] },
  // 0.30 sits in the Why chapter: kept frontal (was (-5,2,8) "cross to opposite
  // side") so the §6 comparison split reads left-grid vs right-lattice at a glance.
  { p: 0.3, pos: [0, 0.5, 11.5], look: [0, 0, 0] },
  { p: 0.45, pos: [0, 7, 9], look: [0, 0, 0] },
  { p: 0.62, pos: [6, -1, 7], look: [0, 0, 0] },
  { p: 0.78, pos: [2, 1, 6], look: [0, 0, 0] },
  { p: 0.92, pos: [0, 0, 9], look: [0, 0, 0] },
  { p: 1.0, pos: [0, 0, 7.5], look: [0, 0, 0] },
];

function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

// Catmull-Rom position + lerped lookAt at global progress; writes into plain
// [x,y,z] tuples (no THREE dependency).
export function sampleCamera(
  p: number,
  outPos: [number, number, number],
  outLook: [number, number, number],
): void {
  const k = CAMERA_KEYS;
  const x = clamp01(p);
  let i = 0;
  while (i < k.length - 2 && x > k[i + 1].p) i++;
  const k0 = k[Math.max(0, i - 1)];
  const k1 = k[i];
  const k2 = k[i + 1];
  const k3 = k[Math.min(k.length - 1, i + 2)];
  const span = k2.p - k1.p;
  const u = span <= 0 ? 0 : (x - k1.p) / span;
  for (let a = 0; a < 3; a++) {
    outPos[a] = catmull(k0.pos[a], k1.pos[a], k2.pos[a], k3.pos[a], u);
    outLook[a] = k1.look[a] + (k2.look[a] - k1.look[a]) * u;
  }
}
