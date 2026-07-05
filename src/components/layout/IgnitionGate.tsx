"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SCATTER_L0 } from "@/lib/schematicLayouts";

// story-spec §7 — Ignition, 3.0s narrative envelope (P4.3). One GSAP master timeline:
//   0.0–0.6 void · 0.6–1.2 recognition · 1.2–1.8 intervention · 1.8–2.4 mark
//   2.4–2.9 transition · 2.9–3.0 hero live
// First visit per session only. Any pointer/key/scroll/touch skips instantly.
// prefers-reduced-motion never mounts this (pinned stage is stacked-gated + guard below).
// SVG + GSAP only — never R3F, so it never delays the hero constellation's lazy mount.

export const IGNITION_KEY = "lumora_ignited";

/** Single source of truth for whether the ceremony should animate this load. */
export function shouldPlayIgnition(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    if (sessionStorage.getItem(IGNITION_KEY)) return false;
  } catch {
    /* storage/matchMedia unavailable — treat as "play" */
  }
  return true;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const VOLT = "#3d8bff"; // --volt (raw / unengineered)
const LUMEN = "#DEA82F"; // --lumen (engineered)
const NODES = 24;
const LINES = 6;
const GAP_DEG = 55; // gap centred at −45° (upper-right), per halo-icon.svg
const ARC_START = -45 + GAP_DEG / 2; // −17.5°
const ARC_SPAN = 360 - GAP_DEG; // 305° drawn
const RAD = Math.PI / 180;

// Deterministic node pairs for the recognition-phase flicker lines (no Math.random).
const LINE_PAIRS: [number, number][] = [
  [0, 9], [3, 16], [7, 20], [5, 12], [1, 18], [11, 22],
];

type Props = { onComplete?: (played: boolean) => void };

export function IgnitionGate({ onComplete }: Props) {
  const [phase, setPhase] = useState<"pending" | "playing" | "done">("pending");
  const overlayRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SVGGElement>(null);
  const linesRef = useRef<SVGGElement>(null);
  const ringRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);
  const finishedRef = useRef(false);

  const finish = useCallback((played: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    try {
      sessionStorage.setItem(IGNITION_KEY, "1");
    } catch {
      /* ignore */
    }
    const cb = onCompleteRef.current;
    setPhase("done"); // unmounts the overlay fully — no lingering fixed layer
    // Fire the host callback on the NEXT frame, OUTSIDE this component's gsap.context.
    // finish() runs inside the ignition timeline's onComplete, where gsap re-activates
    // our context — so a hero-reveal timeline the host creates synchronously here would
    // be captured by it and then reverted by the effect cleanup's ctx.revert() (which
    // now fires on phase→done), leaving the hero hidden. Deferring decouples them.
    if (cb) requestAnimationFrame(() => cb(played));
  }, []);

  // Decide whether to play + arm the skip handlers (SVG not mounted yet here).
  useIsoLayoutEffect(() => {
    if (!shouldPlayIgnition()) {
      finish(false);
      return;
    }
    setPhase("playing");
    const skip = () => finish(true);
    const events = ["pointerdown", "keydown", "wheel", "touchstart", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, skip, { passive: true }));
    return () => events.forEach((e) => window.removeEventListener(e, skip));
  }, [finish]);

  // Build + run the master timeline AFTER the overlay/SVG has mounted (refs valid).
  useIsoLayoutEffect(() => {
    if (phase !== "playing") return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const ctx = gsap.context(() => {
      const nodeEls = nodesRef.current ? (Array.from(nodesRef.current.children) as SVGElement[]) : [];
      const lineEls = linesRef.current ? (Array.from(linesRef.current.children) as SVGLineElement[]) : [];

      // ── geometry (px; SVG has no viewBox → 1 unit = 1 CSS px = viewport px) ──
      const W = window.innerWidth;
      const H = window.innerHeight;
      const cx = W / 2;
      const cy = H / 2;
      const minVP = Math.min(W, H);
      const diskR = 0.4 * minVP;
      const Rring = Math.max(78, Math.min(118, minVP * 0.11));

      const ringPos = Array.from({ length: NODES }, (_, i) => {
        const a = (ARC_START + (ARC_SPAN * i) / (NODES - 1)) * RAD;
        return { x: cx + Rring * Math.cos(a), y: cy + Rring * Math.sin(a) };
      });
      // scatter positions seeded from the first 24 nodes of SCATTER_L0 (world ±~10 → disk)
      const scatterPos = Array.from({ length: NODES }, (_, i) => {
        const nx = SCATTER_L0[i * 3] / 9.7;
        const ny = SCATTER_L0[i * 3 + 1] / 9.7;
        return { x: cx + nx * diskR, y: cy - ny * diskR };
      });

      // ring stroke path over the drawn 305° arc
      const p0 = ringPos[0];
      const p1 = ringPos[NODES - 1];
      ring.setAttribute("d", `M ${p0.x} ${p0.y} A ${Rring} ${Rring} 0 1 1 ${p1.x} ${p1.y}`);
      ring.style.strokeWidth = String(Math.max(5, Rring * 0.075));

      // flicker lines between seeded scatter pairs
      lineEls.forEach((ln, k) => {
        const [a, b] = LINE_PAIRS[k];
        ln.setAttribute("x1", String(scatterPos[a].x));
        ln.setAttribute("y1", String(scatterPos[a].y));
        ln.setAttribute("x2", String(scatterPos[b].x));
        ln.setAttribute("y2", String(scatterPos[b].y));
      });

      // ── initial state ──
      gsap.set(dot, {
        x: cx, y: cy, scale: 0.6, opacity: 0, fill: VOLT, transformOrigin: "50% 50%",
        filter: "drop-shadow(0 0 12px rgba(61,139,255,0.85))",
      });
      gsap.set(nodeEls, {
        x: (i) => scatterPos[i].x, y: (i) => scatterPos[i].y,
        scale: 0, opacity: 0, fill: VOLT, transformOrigin: "50% 50%",
      });
      gsap.set(ring, { opacity: 0, strokeDashoffset: 1 });
      gsap.set(lineEls, { opacity: 0 });
      gsap.set(glowRef.current, { opacity: 0 });

      const tl = gsap.timeline({ onComplete: () => finish(true) });

      // 0.0–0.6 · the void — a single volt point ignites center-frame
      tl.to(dot, { scale: 1, opacity: 0.4, duration: 0.6, ease: "power2.out" }, 0);

      // 0.6–1.2 · the recognition — 24 volt points fade in around it; lines flicker
      tl.to(nodeEls, {
        scale: 1, opacity: 0.5, duration: 0.4, ease: "power2.out",
        stagger: { each: 0.012, from: "random" },
      }, 0.6);
      lineEls.forEach((ln, k) => {
        const t = 0.62 + k * 0.09;
        tl.to(ln, { opacity: 0.15, duration: 0.1, ease: "none" }, t);
        tl.to(ln, { opacity: 0, duration: 0.1, ease: "none" }, t + 0.1);
      });

      // 1.2–1.8 · the intervention — center goes lumen + blooms + pulses; nodes → ring
      tl.set(dot, { filter: "drop-shadow(0 0 18px var(--color-lumen))" }, 1.2);
      tl.to(dot, { fill: LUMEN, opacity: 1, duration: 0.2, ease: "none" }, 1.2);
      tl.to(glowRef.current, { opacity: 0.2, duration: 0.3, ease: "power1.out" }, 1.25);
      tl.to(dot, { scale: 1.4, duration: 0.16, ease: "power2.out" }, 1.24);
      tl.to(dot, { scale: 1.0, duration: 0.2, ease: "power2.inOut" }, 1.4);
      tl.to(nodeEls, {
        x: (i) => ringPos[i].x, y: (i) => ringPos[i].y, fill: LUMEN, opacity: 0.95,
        duration: 0.35, ease: "power2.inOut", stagger: { each: 0.025, from: "start" },
      }, 1.2);

      // 1.8–2.4 · the mark — ring stroke draws around the dot, then rests over a glow
      tl.set(ring, { opacity: 1 }, 1.8);
      tl.to(ring, { strokeDashoffset: 0, duration: 0.4, ease: "power2.inOut" }, 1.8);
      tl.to(glowRef.current, { opacity: 0.25, duration: 0.4, ease: "power1.inOut" }, 1.8);
      // 2.2–2.4 rest (the payoff frame — the timeline simply holds)

      // 2.4–2.9 · the transition — ring fades; nodes scatter back to L0, lumen → volt
      tl.to(ring, { opacity: 0, duration: 0.5, ease: "power1.out" }, 2.4);
      tl.to(nodeEls, {
        x: (i) => scatterPos[i].x, y: (i) => scatterPos[i].y, fill: VOLT, opacity: 0,
        duration: 0.45, ease: "power2.in", stagger: { each: 0.006, from: "start" },
      }, 2.4);
      tl.to(glowRef.current, { opacity: 0, duration: 0.4, ease: "power1.in" }, 2.4);
      tl.to(dot, { opacity: 0, scale: 0.8, duration: 0.4, ease: "power1.in" }, 2.45);
      // 2.45–3.0 · overlay fades → hero live (onComplete fires the SplitText reveal)
      tl.to(overlayRef.current, { opacity: 0, duration: 0.55, ease: "power1.inOut" }, 2.45);

      // QA seek handle (inert unless ?igdbg is present) — lets the capture harness
      // pause + seek the master timeline to exact frame times. No-op in normal use.
      try {
        if (new URLSearchParams(window.location.search).has("igdbg")) {
          (window as unknown as { __ignitionTL?: gsap.core.Timeline }).__ignitionTL = tl;
        }
      } catch {
        /* ignore */
      }
    });

    return () => ctx.revert();
  }, [phase, finish]);

  if (phase !== "playing") return null;

  return (
    <div ref={overlayRef} aria-hidden className="fixed inset-0 z-[100] overflow-hidden bg-ink">
      {/* lumen radial glow behind the mark (blur 40px) */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[26vmin] w-[26vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-lumen) 60%, transparent) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <svg className="absolute inset-0 h-full w-full" style={{ overflow: "visible" }} fill="none">
        <g ref={linesRef} stroke="var(--color-volt)" strokeWidth={1}>
          {Array.from({ length: LINES }).map((_, i) => (
            <line key={i} />
          ))}
        </g>
        <path
          ref={ringRef}
          stroke="var(--color-lumen)"
          strokeLinecap="round"
          fill="none"
          pathLength={1}
          strokeDasharray={1}
          style={{ filter: "drop-shadow(0 0 4px color-mix(in srgb, var(--color-lumen) 55%, transparent))" }}
        />
        <g ref={nodesRef}>
          {Array.from({ length: NODES }).map((_, i) => (
            <circle key={i} cx={0} cy={0} r={4} style={{ fill: VOLT }} />
          ))}
        </g>
        <circle ref={dotRef} cx={0} cy={0} r={9} style={{ fill: LUMEN }} />
      </svg>
    </div>
  );
}
