// Static, server-rendered fallback poster for the hero constellation — shown on
// mobile / coarse-pointer (no R3F, per CLAUDE.md) and as the first-paint layer
// before the desktop canvas mounts. Pure SVG, deterministic, ~no JS cost.
// (P4.1 replaces this with the animated 2D-canvas story fallback.)

const VOLT = "#3d8bff";

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic wide scatter in a 1000×1000 field, biased to the right half so
// it sits behind the (left-aligned) hero copy without competing with it.
const NODES = (() => {
  const rand = mulberry32(7);
  return Array.from({ length: 46 }, () => {
    const x = 380 + rand() * 620;
    const y = 120 + rand() * 760;
    const r = 1.4 + rand() * 3.2;
    const o = 0.18 + rand() * 0.5;
    return { x, y, r, o };
  });
})();

// Faint links between nearby nodes (sparse, like L0).
const LINKS = (() => {
  const out: { a: number; b: number }[] = [];
  for (let i = 0; i < NODES.length; i++) {
    for (let j = i + 1; j < NODES.length; j++) {
      const d = Math.hypot(NODES[i].x - NODES[j].x, NODES[i].y - NODES[j].y);
      if (d < 150) out.push({ a: i, b: j });
    }
  }
  return out.slice(0, 40);
})();

export function HeroPoster({ className = "" }: { className?: string }) {
  return (
    <div className={className} aria-hidden>
      <svg
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
        style={{ opacity: 0.9 }}
      >
        <g stroke={VOLT} strokeWidth={0.6} strokeOpacity={0.12}>
          {LINKS.map((l, i) => (
            <line key={i} x1={NODES[l.a].x} y1={NODES[l.a].y} x2={NODES[l.b].x} y2={NODES[l.b].y} />
          ))}
        </g>
        <g fill={VOLT}>
          {NODES.map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r={n.r} fillOpacity={n.o} />
          ))}
        </g>
      </svg>
    </div>
  );
}
