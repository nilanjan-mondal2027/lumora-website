// The "Living Schematic": one shared set of nodes and relationships that
// reorganizes across five layouts, mirroring the Lumora Method
// (Discover -> Analyze -> Design -> Build -> Optimize). Positions change
// per layout; the edge topology (computed from the resolved layout) stays
// constant, so the same relationships read as chaotic, then clear.

// P2.5: doubled 48→96 for a denser, more sophisticated field of light. Every
// layout below generates deterministically from NODE_COUNT; the two that were
// hard-sized to 48 (gridLayout dims, SPLIT_LAYOUT's left grid) are re-derived.
export const NODE_COUNT = 96;
export const RADIUS = 5.4;

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function scatterLayout(): Float32Array {
  const rand = mulberry32(7);
  const positions = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i++) {
    const r = RADIUS * (0.4 + rand() * 0.75);
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7;
    positions[i * 3 + 2] = r * Math.cos(phi) * 0.7;
  }
  return positions;
}

function clusterLayout(): Float32Array {
  const rand = mulberry32(23);
  const positions = new Float32Array(NODE_COUNT * 3);
  const centers = [
    [-2.6, 1.8, -1],
    [2.8, 1.4, 1.2],
    [-2.2, -2, 1.4],
    [2.4, -1.8, -1.2],
  ];
  for (let i = 0; i < NODE_COUNT; i++) {
    const center = centers[i % centers.length];
    positions[i * 3] = center[0] + (rand() - 0.5) * 2.4;
    positions[i * 3 + 1] = center[1] + (rand() - 0.5) * 2.4;
    positions[i * 3 + 2] = center[2] + (rand() - 0.5) * 2.4;
  }
  return positions;
}

function gridLayout(): Float32Array {
  const positions = new Float32Array(NODE_COUNT * 3);
  const dims = { x: 6, y: 4, z: 4 }; // 96 — orthographic blueprint lattice
  const spacing = 1.55;
  let i = 0;
  for (let z = 0; z < dims.z; z++) {
    for (let y = 0; y < dims.y; y++) {
      for (let x = 0; x < dims.x; x++) {
        positions[i * 3] = (x - (dims.x - 1) / 2) * spacing;
        positions[i * 3 + 1] = (y - (dims.y - 1) / 2) * spacing;
        positions[i * 3 + 2] = (z - (dims.z - 1) / 2) * spacing * 1.1;
        i++;
      }
    }
  }
  return positions;
}

function meshLayout(): Float32Array {
  const rand = mulberry32(41);
  const positions = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i++) {
    const u = (i / NODE_COUNT) * Math.PI * 2 * 3.2;
    const v = (i / NODE_COUNT) * Math.PI * 2;
    const major = 3.6;
    const minor = 1.7;
    positions[i * 3] = (major + minor * Math.cos(v)) * Math.cos(u) * 0.62 + (rand() - 0.5) * 0.4;
    positions[i * 3 + 1] = minor * Math.sin(v) + (rand() - 0.5) * 0.4;
    positions[i * 3 + 2] = (major + minor * Math.cos(v)) * Math.sin(u) * 0.62 + (rand() - 0.5) * 0.4;
  }
  return positions;
}

function resolvedLayout(): Float32Array {
  const positions = new Float32Array(NODE_COUNT * 3);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NODE_COUNT; i++) {
    const y = 1 - (i / (NODE_COUNT - 1)) * 2;
    const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = goldenAngle * i;
    positions[i * 3] = Math.cos(theta) * radiusAtY * RADIUS;
    positions[i * 3 + 1] = y * RADIUS;
    positions[i * 3 + 2] = Math.sin(theta) * radiusAtY * RADIUS;
  }
  return positions;
}

// L0 — the story entry state (story-spec §3): a wider, calmer scatter than the
// L1 "Sample" gather. Composed (P1.2b): density biased toward the upper-right
// third so the field frames the left-anchored hero copy instead of contesting it
// (target ~60/40 right/left of screen centre). Deterministic seed → distinct field.
function scatterWideLayout(): Float32Array {
  const rand = mulberry32(101);
  const positions = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i++) {
    const r = RADIUS * (0.55 + rand() * 1.35);
    const theta = rand() * Math.PI * 2;
    const phi = Math.acos(2 * rand() - 1);
    let x = r * Math.sin(phi) * Math.cos(theta);
    let y = r * Math.sin(phi) * Math.sin(theta) * 0.82;
    const z = r * Math.cos(phi) * 0.72;
    // A wide field that fills the frame (P2.5 — a field of light, not a clump). Lean
    // gently up-and-right; the shader copy-protect (not position) keeps the copy clear.
    if (x < 0) x *= 0.86;
    x += 0.5;
    y += 0.35;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
  return positions;
}

// L0 scatter, used by the hero backdrop (P1.2). The existing five layouts stay
// L1–L5 (the Method engine drives those); L6 (halo) is added in P2.4.
export const SCATTER_L0: Float32Array = scatterWideLayout();

// Comparison-as-visual (story-spec §6): the left half of the nodes snap to a
// uniform, identical grid (generic), the right half forms a bespoke organic
// lattice (a Lumora system). Node halves are split by index via NODE_SIDE.
export const NODE_SIDE: Float32Array = (() => {
  const s = new Float32Array(NODE_COUNT);
  for (let i = 0; i < NODE_COUNT; i++) s[i] = i < NODE_COUNT / 2 ? 0 : 1;
  return s;
})();

export const SPLIT_LAYOUT: Float32Array = (() => {
  const positions = new Float32Array(NODE_COUNT * 3);
  const half = NODE_COUNT / 2;
  // Left — a uniform, identical grid, centred on the left half. Lifeless by
  // construction. Cols/rows derived from `half` so it stays balanced at any count.
  const cols = 6;
  const rows = Math.ceil(half / cols);
  const sx = 0.95;
  const sy = 0.95;
  for (let i = 0; i < half; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions[i * 3] = -4.5 + (col - (cols - 1) / 2) * sx;
    positions[i * 3 + 1] = ((rows - 1) / 2 - row) * sy;
    positions[i * 3 + 2] = 0;
  }
  // Right — a bespoke organic lattice, irregular and alive.
  const rand = mulberry32(303);
  for (let i = half; i < NODE_COUNT; i++) {
    const k = i - half;
    const a = (k / half) * Math.PI * 2 * 1.6;
    const r = 1.1 + (k % 4) * 0.6 + (rand() - 0.5) * 0.6;
    positions[i * 3] = 3.3 + Math.cos(a) * r + (rand() - 0.5) * 0.5;
    positions[i * 3 + 1] = Math.sin(a) * r * 1.15 + (rand() - 0.5) * 0.5;
    positions[i * 3 + 2] = (rand() - 0.5) * 1.3;
  }
  return positions;
})();

// L6 — Halo convergence (story-spec §3/§6). All nodes land on a ring sized to
// frame at the 1.00 camera keyframe (0,0,7.5), with a ~55° gap; one designated
// node sits in the gap as the dot. Proportions mirror public/brand/halo-icon.svg:
// gap centred at world +45° (screen upper-right — SVG "−45°" with y-down), dot on
// the ring in the gap. That dot node becomes the CTA in the finale morph.
export const DOT_NODE = 0;
export const HALO_RADIUS = 2.35;

export const HALO_L6: Float32Array = (() => {
  const positions = new Float32Array(NODE_COUNT * 3);
  const deg = Math.PI / 180;
  const gapCenter = 45;
  const gapHalf = 31; // 62° geometric gap → ~55° visual with round-cap nodes
  // designated dot node — in the gap, on the ring
  positions[DOT_NODE * 3] = HALO_RADIUS * Math.cos(gapCenter * deg);
  positions[DOT_NODE * 3 + 1] = HALO_RADIUS * Math.sin(gapCenter * deg);
  positions[DOT_NODE * 3 + 2] = 0;
  // remaining nodes evenly along the drawn arc (the complement of the gap)
  const arcStart = gapCenter + gapHalf;
  const arcSpan = 360 - 2 * gapHalf;
  let n = 0;
  for (let i = 0; i < NODE_COUNT; i++) {
    if (i === DOT_NODE) continue;
    const ang = (arcStart + arcSpan * (n / (NODE_COUNT - 2))) * deg;
    positions[i * 3] = HALO_RADIUS * Math.cos(ang);
    positions[i * 3 + 1] = HALO_RADIUS * Math.sin(ang);
    positions[i * 3 + 2] = 0;
    n++;
  }
  return positions;
})();

// 1 for the designated dot node, 0 otherwise — lets the shader fade the canvas
// dot as it hands off to the DOM button (§6 morph).
export const NODE_IS_DOT: Float32Array = (() => {
  const a = new Float32Array(NODE_COUNT);
  a[DOT_NODE] = 1;
  return a;
})();

export const LAYOUTS = [scatterLayout(), clusterLayout(), gridLayout(), meshLayout(), resolvedLayout()];

export type Edge = [number, number];

function buildEdges(reference: Float32Array, neighborsPerNode: number): Edge[] {
  const seen = new Set<string>();
  const edges: Edge[] = [];

  for (let i = 0; i < NODE_COUNT; i++) {
    const distances: { j: number; d: number }[] = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      const dx = reference[i * 3] - reference[j * 3];
      const dy = reference[i * 3 + 1] - reference[j * 3 + 1];
      const dz = reference[i * 3 + 2] - reference[j * 3 + 2];
      distances.push({ j, d: dx * dx + dy * dy + dz * dz });
    }
    distances.sort((a, b) => a.d - b.d);
    for (let k = 0; k < neighborsPerNode; k++) {
      const j = distances[k].j;
      const key = i < j ? `${i}-${j}` : `${j}-${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  }
  return edges;
}

// kNN edges off the resolved layout, then drop the longest ~15% (P1.2b) so the
// mesh reads quieter than the nodes — points of light, not wireframe.
export const EDGES: Edge[] = (() => {
  const ref = LAYOUTS[4];
  const scored = buildEdges(ref, 2)
    .map((e) => {
      const dx = ref[e[0] * 3] - ref[e[1] * 3];
      const dy = ref[e[0] * 3 + 1] - ref[e[1] * 3 + 1];
      const dz = ref[e[0] * 3 + 2] - ref[e[1] * 3 + 2];
      return { e, d: dx * dx + dy * dy + dz * dz };
    })
    .sort((a, b) => a.d - b.d);
  return scored.slice(0, Math.floor(scored.length * 0.85)).map((s) => s.e);
})();

// A handful of higher-degree "hub" nodes render slightly larger and brighter.
export const NODE_SIZES: Float32Array = (() => {
  const degree = new Array(NODE_COUNT).fill(0);
  for (const [a, b] of EDGES) {
    degree[a]++;
    degree[b]++;
  }
  const sizes = new Float32Array(NODE_COUNT);
  for (let i = 0; i < NODE_COUNT; i++) {
    sizes[i] = 1 + Math.min(degree[i], 4) * 0.22;
  }
  return sizes;
})();

// Per-node warmth order (story-spec §3, `aOrder`). Assigned BY CLUSTER — nodes in
// the same clusterLayout domain share a base order, and clusters are ranked by
// centroid x — so as uTemp rises the warmth sweeps cluster-by-cluster through the
// structure rather than uniformly. A small stable hash jitter softens the bands.
export const NODE_ORDER: Float32Array = (() => {
  const centers = [
    [-2.6, 1.8, -1],
    [2.8, 1.4, 1.2],
    [-2.2, -2, 1.4],
    [2.4, -1.8, -1.2],
  ];
  const rankByCluster = centers
    .map((c, i) => ({ i, x: c[0] }))
    .sort((a, b) => a.x - b.x)
    .reduce<Record<number, number>>((acc, c, rank) => ((acc[c.i] = rank), acc), {});
  // Distributed within [0.12, 0.88] so the ±0.12 temperature band (story-spec §3)
  // stays inside [0,1]: fully volt at uTemp 0, fully lumen at uTemp 1.
  const order = new Float32Array(NODE_COUNT);
  for (let i = 0; i < NODE_COUNT; i++) {
    const cluster = i % centers.length;
    const base = 0.12 + 0.76 * (rankByCluster[cluster] / (centers.length - 1));
    const h = Math.sin(i * 91.3458) * 43758.5453;
    const jitter = ((h - Math.floor(h)) - 0.5) * 0.12;
    order[i] = Math.min(0.88, Math.max(0.12, base + jitter));
  }
  return order;
})();
