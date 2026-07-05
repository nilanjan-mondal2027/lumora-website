"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Side anchor nav (story-spec §5): left-edge, mono, alireza-style in-story TOC.
// Six anchors mapped to chapter range starts; active state is a lumen dot; a
// click smooth-scrolls to the range start through Lenis (the sole smoother).
type Anchor = { label: string; start: number };

const ANCHORS: Anchor[] = [
  { label: "Philosophy", start: 0.12 },
  { label: "Approach", start: 0.24 },
  { label: "Method", start: 0.38 },
  { label: "Solutions", start: 0.72 },
  { label: "Proof", start: 0.82 },
  { label: "Begin", start: 0.9 },
];

// Land a little past the fade-in boundary so the target chapter reads as visible
// (chapter overlays fade in over ~0.025 of progress from their start).
const LEAD = 0.03;

export function AnchorNav({
  progressRef,
  activeRef,
  triggerId = "stage",
}: {
  progressRef: { current: number };
  /** True while the pinned stage owns the viewport — the nav hides otherwise. */
  activeRef: { current: boolean };
  triggerId?: string;
}) {
  const lenis = useLenis();
  const navRef = useRef<HTMLElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Reflect the active chapter + nav visibility straight from the shared progress
  // ref each frame (no React state → no re-renders during scroll-scrub).
  useEffect(() => {
    let raf = 0;
    let shown = -1;
    let active = -2;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const nav = navRef.current;
      if (!nav) return;
      const p = progressRef.current;
      // Appear only once the hero has fully faded (≥ .12), not over it — so the
      // rail never collides with the hero copy during its fade-out (P2.4c).
      const vis = activeRef.current && p >= 0.12 ? 1 : 0;
      if (vis !== shown) {
        shown = vis;
        nav.style.opacity = String(vis);
        nav.style.pointerEvents = vis ? "auto" : "none";
      }
      let idx = -1;
      for (let i = 0; i < ANCHORS.length; i++) {
        if (p >= ANCHORS[i].start) idx = i;
      }
      if (idx !== active) {
        active = idx;
        for (let i = 0; i < ANCHORS.length; i++) {
          const on = i === idx;
          const dot = dotRefs.current[i];
          const label = labelRefs.current[i];
          if (dot) {
            dot.style.background = on ? "var(--color-lumen)" : "transparent";
            dot.style.borderColor = on ? "var(--color-lumen)" : "var(--color-mist)";
            dot.style.transform = on ? "scale(1.1)" : "scale(1)";
            dot.style.boxShadow = on ? "0 0 12px -2px var(--color-lumen)" : "none";
          }
          if (label) label.style.color = on ? "var(--color-paper)" : "var(--color-mist)";
        }
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [progressRef, activeRef]);

  const scrollTo = (start: number) => {
    const st = ScrollTrigger.getById(triggerId);
    if (!st) return;
    const target = st.start + Math.min(1, start + LEAD) * (st.end - st.start);
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <nav
      ref={navRef}
      aria-label="Story sections"
      className="pointer-events-none fixed left-[max(1.5rem,3vw)] top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-4 opacity-0 transition-opacity duration-500 md:flex"
    >
      {ANCHORS.map((a, i) => (
        <button
          key={a.label}
          type="button"
          onClick={() => scrollTo(a.start)}
          className="group flex items-center gap-3 text-left"
        >
          <span
            ref={(el) => {
              dotRefs.current[i] = el;
            }}
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full border transition-all duration-300"
            style={{ borderColor: "var(--color-mist)", background: "transparent" }}
          />
          <span
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mist transition-colors duration-300 group-hover:text-paper"
          >
            {a.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
