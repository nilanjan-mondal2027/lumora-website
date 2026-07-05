"use client";

import { useEffect, useRef } from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { BreathingHalo } from "@/components/sections/contact/BreathingHalo";
import {
  STORY_COPY,
  METHOD_PHASES,
  SOLUTIONS,
  TESTIMONIALS,
  FEATURED_SOLUTION_INDEXES,
} from "@/lib/data";

// P4.1 — the mobile / reduced-motion homepage story (story-spec §9). No R3F: a
// ~120-particle 2D canvas plays the same temperature beats (scatter → cluster →
// blueprint → lattice → live → halo) as the sections stack and scroll normally,
// each chapter switching the beat via IntersectionObserver. The finale renders the
// real Halo SVG mark. Every chapter's copy is real SSR text (SEO parity with desktop).

const FEATURED = FEATURED_SOLUTION_INDEXES.map((i) => SOLUTIONS[i]);

const N = 120;
const TAU = Math.PI * 2;
const VOLT: [number, number, number] = [61, 139, 255]; // --volt (#3d8bff)
const LUMEN: [number, number, number] = [222, 168, 47]; // --lumen (#DEA82F)
// Temperature per beat 0..5 — mirrors story.ts LAYOUT_UTEMP progression.
const BEAT_TEMP = [0, 0.22, 0.42, 0.62, 0.85, 1];

function mulberry32(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Deterministic target positions for all 6 beats in normalized [-1,1] space.
// Returns Float32Array laid out [beat*N*2 + i*2 + {0:x,1:y}].
function buildTargets(): Float32Array {
  const r = mulberry32(11);
  const t = new Float32Array(6 * N * 2);
  const set = (beat: number, i: number, x: number, y: number) => {
    t[beat * N * 2 + i * 2] = x;
    t[beat * N * 2 + i * 2 + 1] = y;
  };
  // Pre-roll a stable jitter per particle so every beat shares the same identity.
  const jx = Array.from({ length: N }, () => (r() - 0.5) * 2);
  const jy = Array.from({ length: N }, () => (r() - 0.5) * 2);
  for (let i = 0; i < N; i++) {
    // 0 scatter — wide cold noise
    set(0, i, jx[i] * 0.95, jy[i] * 0.95);
    // 1 cluster — pulled loosely toward centre
    set(1, i, jx[i] * 0.5, jy[i] * 0.5);
    // 2 blueprint — split: left rigid grid vs right organic lattice (§6)
    if (i < N / 2) {
      const c = i % 6, rw = Math.floor(i / 6);
      set(2, i, -0.85 + c * 0.12, -0.6 + rw * 0.13);
    } else {
      set(2, i, 0.28 + (jx[i] * 0.5 + 0.5) * 0.6, jy[i] * 0.75);
    }
    // 3 lattice — connected grid across the frame
    {
      const cols = 15;
      const c = i % cols, rw = Math.floor(i / cols);
      set(3, i, -0.85 + (c / (cols - 1)) * 1.7, -0.62 + rw * 0.17 + jy[i] * 0.02);
    }
    // 4 live — dense warm swarm near centre
    set(4, i, jx[i] * 0.42, jy[i] * 0.42);
    // 5 halo — ring with the upper-right gap; a few ride the dot position
    {
      // gap between ~20° and ~80° (upper-right) to echo the finale mark
      const span = TAU - 1.05; // remove ~60° of arc
      const a = 1.35 + (i / (N - 4)) * span; // start past the gap
      if (i >= N - 3) {
        set(5, i, 0.44, -0.44); // the distinct dot cluster (upper-right)
      } else {
        set(5, i, Math.cos(a) * 0.62, Math.sin(a) * 0.62);
      }
    }
  }
  return t;
}

export function MobileStory() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const beatRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = buildTargets();
    const cur = new Float32Array(N * 2);
    // Seed current positions at the scatter beat so the first frame is coherent.
    for (let i = 0; i < N * 2; i++) cur[i] = targets[i];
    let temp = 0;

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const draw = () => {
      const cx = w / 2;
      const cy = h / 2;
      const scale = Math.min(w, h) * 0.46;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const cr = Math.round(lerp(VOLT[0], LUMEN[0], temp));
      const cg = Math.round(lerp(VOLT[1], LUMEN[1], temp));
      const cb = Math.round(lerp(VOLT[2], LUMEN[2], temp));
      const halo = `rgba(${cr},${cg},${cb},`;
      // core biased toward white so nodes read as bright points, not blobs
      const kr = Math.round(lerp(cr, 255, 0.45));
      const kg = Math.round(lerp(cg, 255, 0.45));
      const kb = Math.round(lerp(cb, 255, 0.45));
      const core = `rgba(${kr},${kg},${kb},`;
      for (let i = 0; i < N; i++) {
        const x = cx + cur[i * 2] * scale;
        const y = cy + cur[i * 2 + 1] * scale;
        ctx.fillStyle = `${halo}0.16)`;
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, TAU);
        ctx.fill();
        ctx.fillStyle = `${core}0.9)`;
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, TAU);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    if (reduced) {
      // Static composition — snap to a warm 'live' field, draw once, no loop.
      const b = 4;
      for (let i = 0; i < N; i++) {
        cur[i * 2] = targets[b * N * 2 + i * 2];
        cur[i * 2 + 1] = targets[b * N * 2 + i * 2 + 1];
      }
      temp = BEAT_TEMP[b];
      draw();
      window.addEventListener("resize", () => {
        resize();
        draw();
      });
      return;
    }

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const b = beatRef.current;
      const base = b * N * 2;
      for (let i = 0; i < N; i++) {
        const tx = targets[base + i * 2];
        const ty = targets[base + i * 2 + 1];
        cur[i * 2] += (tx - cur[i * 2]) * 0.055;
        cur[i * 2 + 1] += (ty - cur[i * 2 + 1]) * 0.055;
      }
      temp += (BEAT_TEMP[b] - temp) * 0.055;
      draw();
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);

    // IntersectionObserver drives the beat: the section crossing the viewport's
    // middle band owns the field.
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const b = Number((e.target as HTMLElement).dataset.beat);
            if (!Number.isNaN(b)) beatRef.current = b;
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    document.querySelectorAll<HTMLElement>("[data-beat]").forEach((el) => io.observe(el));

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      io.disconnect();
    };
  }, []);

  return (
    <div className="relative bg-ink">
      {/* Sticky viewport particle field — stays behind the beats, releases at story end */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden" aria-hidden>
        <canvas ref={canvasRef} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink" />
      </div>

      {/* Beats overlay the sticky field; each is real, readable, SSR'd copy */}
      <div className="relative -mt-[100svh]">
        {/* 01 — Hero (scatter) */}
        <section data-beat={0} className="flex min-h-[100svh] items-center">
          <Container>
            <div className="max-w-xl">
              <p className="eyebrow mb-6">{STORY_COPY.hero.eyebrow}</p>
              <h1 className="display-hero text-paper">
                {STORY_COPY.hero.headlineLines[0]}
                <br />
                {STORY_COPY.hero.headlineLines[1]}
              </h1>
              <p className="mt-8 max-w-md text-lg leading-relaxed text-mist">{STORY_COPY.hero.sub}</p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <Button href="/contact">{STORY_COPY.finale.cta}</Button>
                <Button href="/systems" variant="secondary">
                  {STORY_COPY.finale.ctaSecondary}
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* 02 — Philosophy (cluster) */}
        <section data-beat={1} className="flex min-h-[90svh] items-center">
          <Container>
            <div className="max-w-2xl">
              <SectionLabel>{STORY_COPY.philosophy.eyebrow}</SectionLabel>
              <p className="pull-quote mt-8">{STORY_COPY.philosophy.pullQuote}</p>
            </div>
          </Container>
        </section>

        {/* 03 — Why generic fails (blueprint / split) */}
        <section data-beat={2} className="flex min-h-[90svh] items-center">
          <Container>
            <div className="max-w-2xl">
              <SectionLabel>{STORY_COPY.why.eyebrow}</SectionLabel>
              <p className="mt-6 text-2xl leading-snug text-paper">{STORY_COPY.why.headline}</p>
            </div>
          </Container>
        </section>

        {/* 04 — Method (lattice) */}
        <section data-beat={3} className="min-h-[100svh] py-24">
          <Container>
            <SectionLabel>{STORY_COPY.method.eyebrow}</SectionLabel>
            <p className="display-chapter mt-6 max-w-md text-paper">{STORY_COPY.method.headline}</p>
            <ol className="mt-12 flex flex-col gap-8">
              {METHOD_PHASES.map((phase) => (
                <li key={phase.name} className="border-t border-line pt-5">
                  <span className="eyebrow text-lumen">Phase {phase.index}</span>
                  <h2 className="mt-3 font-display text-xl font-medium text-paper">{phase.name}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{phase.description}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* 05 — Solutions (live) */}
        <section data-beat={4} className="flex min-h-[90svh] items-center">
          <Container>
            <div className="max-w-2xl">
              <SectionLabel>{STORY_COPY.solutions.eyebrow}</SectionLabel>
              <p className="display-chapter mt-6 text-paper">{STORY_COPY.solutions.headline}</p>
              <ul className="mt-8 flex flex-col">
                {FEATURED.map((s, i) => (
                  <li key={s.name} className="border-t border-line py-4 last:border-b">
                    <span className="mr-4 font-mono text-xs text-lumen">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg font-medium text-paper">{s.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>

        {/* 06 — Proof (live, cooled) */}
        <section data-beat={4} className="flex min-h-[90svh] items-center py-16">
          <Container>
            <div className="grid gap-10">
              {TESTIMONIALS.slice(0, 2).map((t) => (
                <figure key={t.name}>
                  <blockquote className="pull-quote text-[clamp(1.2rem,5vw,1.6rem)]">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-5 border-t border-line pt-4">
                    <p className="text-sm font-medium text-paper">{t.name}</p>
                    <p className="text-xs text-mist">{t.role}</p>
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>

        {/* 07 — Finale (halo): the real Halo mark + dot above the CTA (§9) */}
        <section data-beat={5} className="flex min-h-[100svh] items-center">
          <Container className="text-center">
            <BreathingHalo className="mx-auto h-24 w-24" />
            <p className="display-chapter mx-auto mt-10 max-w-md text-paper">{STORY_COPY.finale.line}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact">{STORY_COPY.finale.cta}</Button>
              <Button href="/systems" variant="secondary">
                {STORY_COPY.finale.ctaSecondary}
              </Button>
            </div>
          </Container>
        </section>
      </div>
    </div>
  );
}
