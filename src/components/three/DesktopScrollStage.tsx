"use client";

/* eslint-disable react-hooks/refs, react-hooks/immutability -- GSAP owns these pinned-stage DOM refs imperatively. */
import { createRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { IgnitionGate, shouldPlayIgnition } from "@/components/layout/IgnitionGate";
import { AnchorNav } from "@/components/layout/AnchorNav";
import { StageBackdrop } from "./StageBackdrop";
import { MobileStory } from "./MobileStory";
import { CHAPTERS, type Chapter } from "@/lib/story";
import {
  STORY_COPY,
  METHOD_PHASES,
  SOLUTIONS,
  TESTIMONIALS,
  FEATURED_SOLUTION_INDEXES,
  WHY_COMPARISON,
} from "@/lib/data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Stacked mode = mobile/coarse/narrow OR reduced-motion. The pinned R3F stage is
// desktop-fine-pointer-motion only (mirrors StageBackdrop caps + §9 + the CLAUDE.md
// reduced-motion rule). Evaluated on the client. SSR defaults to STACKED (below): the
// stacked tree carries the full copy (SEO-complete) and, unlike the pinned tree, does
// no GSAP DOM surgery — so mobile never mounts a GSAP tree it would have to unmount
// (which throws removeChild), and desktop upgrades stacked→pinned cleanly before paint.
function detectStacked(): boolean {
  if (typeof window === "undefined") return false;
  const fine = window.matchMedia("(pointer: fine)").matches;
  const wide = window.innerWidth >= 768;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return !(fine && wide) || reduced;
}

const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Overlay opacity as a pure function of global progress (deterministic — no GSAP
// interpolation state), fading in at the chapter start and out near its end.
function chapterOpacity(p: number, ch: Chapter, isFirst: boolean, isLast: boolean): number {
  const fade = 0.025;
  const fadeIn = isFirst ? 1 : smoothstep(ch.start, ch.start + fade, p);
  const fadeOut = isLast ? 1 : 1 - smoothstep(ch.end - fade, ch.end, p);
  return Math.min(fadeIn, fadeOut);
}

// The Method chapter steps its five phase blocks through equal sub-ranges.
const METHOD = CHAPTERS[3];
const PHASE_SPAN = (METHOD.end - METHOD.start) / METHOD_PHASES.length;

function methodPhaseState(p: number, i: number): { opacity: number; y: number } {
  const s = METHOD.start + i * PHASE_SPAN;
  const e = s + PHASE_SPAN;
  const fade = PHASE_SPAN * 0.3;
  const fadeIn = smoothstep(s, s + fade, p);
  const fadeOut = 1 - smoothstep(e - fade, e, p);
  const o = Math.min(fadeIn, fadeOut);
  return { opacity: o, y: (1 - o) * 20 }; // Reveal language: rise + fade
}

const FEATURED = FEATURED_SOLUTION_INDEXES.map((i) => SOLUTIONS[i]);

// Shared footprint for the finale CTA: the in-flow placeholder (reserves layout +
// is the measured landing target) and the fixed morph button use the same base so
// the button lands pixel-aligned with the composition.
const MORPH_BTN_BASE =
  "group inline-flex items-center gap-2.5 rounded-md bg-lumen px-6 py-3.5 text-sm font-medium text-ink";

// Shared left inset for the left-anchored chapter overlays (P2.4c). Keeps chapter
// copy clear of the fixed AnchorNav rail so nothing intrudes under ~200px from the
// left at ≥1024w. One token, applied via the overlay wrapper — not per-chapter.
const OVERLAY_INSET = "md:pl-24 lg:pl-40";

function MorphArrow() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      aria-hidden
    >
      <path
        d="M3 11L11 3M11 3H4.5M11 3V9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DesktopScrollStage() {
  const progressRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRefs = useMemo(() => CHAPTERS.map(() => createRef<HTMLDivElement>()), []);
  const phaseRefs = useMemo(() => METHOD_PHASES.map(() => createRef<HTMLDivElement>()), []);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const revealsRef = useRef<Element[]>([]);
  const copyBlockRef = useRef<HTMLDivElement>(null);
  const copyZoneRef = useRef<{ cx: number; cy: number; r: number } | null>(null);
  // §6 dot→CTA morph: the canvas writes the designated dot node's projected screen
  // coords here each frame; the fixed morph button tracks + FLIP-travels from them.
  const dotScreenRef = useRef({ x: 0, y: 0, visible: false });
  const stageActiveRef = useRef(false);
  const morphBtnRef = useRef<HTMLAnchorElement>(null);
  const ctaAnchorRef = useRef<HTMLSpanElement>(null);
  const [mode, setMode] = useState<"pinned" | "stacked">("stacked");

  // Resolve pinned vs stacked on the client, and stay responsive to viewport /
  // media changes (a desktop resized narrow, or reduced-motion toggled, restacks).
  useIsoLayoutEffect(() => {
    const evaluate = () => setMode(detectStacked() ? "stacked" : "pinned");
    evaluate();
    const mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqPointer = window.matchMedia("(pointer: fine)");
    window.addEventListener("resize", evaluate);
    mqReduce.addEventListener("change", evaluate);
    mqPointer.addEventListener("change", evaluate);
    return () => {
      window.removeEventListener("resize", evaluate);
      mqReduce.removeEventListener("change", evaluate);
      mqPointer.removeEventListener("change", evaluate);
    };
  }, []);

  // Measure the hero copy block → NDC zone the constellation shader fades around
  // (P1.2b "protect the type"). Re-measured on resize; layout box is transform-stable.
  useEffect(() => {
    const measure = () => {
      const el = copyBlockRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (!rect.width || !w) return;
      const cx = ((rect.left + rect.width / 2) / w) * 2 - 1;
      const cy = -(((rect.top + rect.height / 2) / h) * 2 - 1);
      const diag = Math.hypot((rect.width / w) * 2, (rect.height / h) * 2);
      copyZoneRef.current = { cx, cy, r: diag * 0.9 };
    };
    measure();
    const raf = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Prepare the hero reveal (hidden) only when the ignition ceremony will play.
  useIsoLayoutEffect(() => {
    if (mode !== "pinned") return;
    if (!headlineRef.current || !stageRef.current) return;
    if (!shouldPlayIgnition()) return;
    const split = new SplitText(headlineRef.current, { type: "lines", mask: "lines", linesClass: "hero-line" });
    splitRef.current = split;
    revealsRef.current = Array.from(stageRef.current.querySelectorAll(".hero-reveal"));
    gsap.set(split.lines, { yPercent: 110 });
    gsap.set(revealsRef.current, { autoAlpha: 0, y: 16 });
    return () => {
      split.revert();
      splitRef.current = null;
    };
  }, [mode]);

  // The pin + progress engine. One ScrollTrigger pins #stage for ~700vh, scrub:true
  // through the existing Lenis bridge (no double smoothing). Writes global progress
  // into the shared ref and fades overlays + Method phase sub-blocks.
  useIsoLayoutEffect(() => {
    if (mode !== "pinned") return;
    const stage = stageRef.current;
    if (!stage) return;

    const applyOverlays = (p: number) => {
      for (let i = 0; i < CHAPTERS.length; i++) {
        const el = overlayRefs[i].current;
        if (!el) continue;
        const o = chapterOpacity(p, CHAPTERS[i], i === 0, i === CHAPTERS.length - 1);
        el.style.opacity = String(o);
        el.style.transform = `translateY(${(1 - o) * 16}px)`;
        el.style.pointerEvents = o > 0.5 ? "auto" : "none";
      }
      for (let i = 0; i < METHOD_PHASES.length; i++) {
        const el = phaseRefs[i].current;
        if (!el) continue;
        const { opacity, y } = methodPhaseState(p, i);
        el.style.opacity = String(opacity);
        el.style.transform = `translateY(${y}px)`;
      }
    };

    const publishProgress = (p: number) => {
      (window as unknown as { __lumoraProgress?: number }).__lumoraProgress = p;
    };

    const st = ScrollTrigger.create({
      id: "stage",
      trigger: stage,
      start: "top top",
      end: "+=700%",
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        stageActiveRef.current = true;
        applyOverlays(self.progress);
        publishProgress(self.progress);
      },
      onToggle: (self) => {
        // The nav + fixed morph button only live while the stage owns the viewport.
        stageActiveRef.current = self.isActive;
      },
      onRefresh: (self) => {
        progressRef.current = self.progress;
        stageActiveRef.current = self.isActive;
        applyOverlays(self.progress);
        publishProgress(self.progress);
      },
    });
    applyOverlays(0);

    // Publish true engine progress for the screenshot harness (scripts/README.md).
    // In dev only, also expose a seek so the harness can land exact checkpoints
    // without approximating by scroll fraction; never shipped to production.
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __seek?: (p: number) => void }).__seek = (p: number) => {
        progressRef.current = p;
        stageActiveRef.current = true;
        applyOverlays(p);
        publishProgress(p);
      };
    }

    return () => st.kill();
  }, [mode]);

  // §6 dot→CTA morph driver. Runs every frame (the dot moves as the camera + ring
  // settle). Two beats, both progress-driven so scrubbing back un-converges cleanly:
  //  · crossfade (.97–.985): button fades in AT the projected dot coords while the
  //    canvas dot fades out (uMorph) → a zero-jump handoff.
  //  · travel (.985–1.00): button FLIP-lerps from the dot to its natural slot.
  // When no canvas drives the morph (mobile poster / not-yet-projected) the button
  // simply parks at the natural slot, following the finale's fade-in.
  useEffect(() => {
    if (mode !== "pinned") return;
    const btn = morphBtnRef.current;
    if (!btn) return;
    let raf = 0;
    let parked = false;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = progressRef.current;
      if (!stageActiveRef.current || p < 0.9) {
        if (!parked) {
          btn.style.opacity = "0";
          btn.style.pointerEvents = "none";
          parked = true;
        }
        return;
      }
      parked = false;
      const ds = dotScreenRef.current;
      let ax = window.innerWidth / 2;
      let ay = window.innerHeight * 0.62;
      const anchor = ctaAnchorRef.current;
      if (anchor) {
        const r = anchor.getBoundingClientRect();
        ax = r.left + r.width / 2;
        ay = r.top + r.height / 2;
      }
      if (ds.visible) {
        const fade = smoothstep(0.97, 0.985, p);
        const travel = smoothstep(0.985, 1.0, p);
        btn.style.left = `${ds.x + (ax - ds.x) * travel}px`;
        btn.style.top = `${ds.y + (ay - ds.y) * travel}px`;
        btn.style.opacity = String(fade);
        btn.style.pointerEvents = fade > 0.6 ? "auto" : "none";
      } else {
        const o = smoothstep(0.9, 0.925, p);
        btn.style.left = `${ax}px`;
        btn.style.top = `${ay}px`;
        btn.style.opacity = String(o);
        btn.style.pointerEvents = o > 0.6 ? "auto" : "none";
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  const handleIgnited = (played: boolean) => {
    if (!played || !splitRef.current) return;
    gsap
      .timeline()
      .to(splitRef.current.lines, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 })
      .to(revealsRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 }, "-=0.55");
  };

  if (mode === "stacked") return <MobileStory />;

  return (
    <section ref={stageRef} id="stage" className="relative h-dvh w-full overflow-hidden bg-ink">
      <IgnitionGate onComplete={handleIgnited} />

      <StageBackdrop
        progressRef={progressRef}
        copyZoneRef={copyZoneRef}
        dotScreenRef={dotScreenRef}
        className="absolute inset-0 z-0 [&>div]:h-full [&_canvas]:!h-full [&_canvas]:!w-full"
      />
      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-ink/70" />

      <div className="absolute inset-0 z-10">
        {/* 01 — Hero */}
        <div ref={overlayRefs[0]} className="absolute inset-0 flex items-center" style={{ opacity: 1 }}>
          <Container>
            <div ref={copyBlockRef} className="max-w-3xl">
              <p className="hero-reveal eyebrow mb-6">{STORY_COPY.hero.eyebrow}</p>
              <h1 ref={headlineRef} className="display-hero text-paper">
                {STORY_COPY.hero.headlineLines[0]}
                <br />
                {STORY_COPY.hero.headlineLines[1]}
              </h1>
              <p className="hero-reveal mt-8 max-w-xl text-lg leading-relaxed text-mist">
                {STORY_COPY.hero.sub}
              </p>
              <div className="hero-reveal mt-10 flex flex-wrap items-center gap-4">
                <Button href="/contact">{STORY_COPY.finale.cta}</Button>
                <Button href="/systems" variant="secondary">
                  {STORY_COPY.finale.ctaSecondary}
                </Button>
              </div>
            </div>
          </Container>
          <div className="hero-reveal absolute bottom-10 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-3 text-mist">
              <span className="eyebrow">{STORY_COPY.hero.scrollCue}</span>
              <span className="h-10 w-px bg-gradient-to-b from-mist/70 to-transparent" />
            </div>
          </div>
        </div>

        {/* 02 — Philosophy */}
        <div ref={overlayRefs[1]} className={`absolute inset-0 flex items-center ${OVERLAY_INSET}`} style={{ opacity: 0 }}>
          <Container>
            <div className="max-w-2xl">
              <SectionLabel>{STORY_COPY.philosophy.eyebrow}</SectionLabel>
              <p className="pull-quote mt-8">{STORY_COPY.philosophy.pullQuote}</p>
            </div>
          </Container>
        </div>

        {/* 03 — Why Generic Fails (comparison-as-visual: split constellation + labels) */}
        <div ref={overlayRefs[2]} className="absolute inset-0" style={{ opacity: 0 }}>
          <span className="eyebrow absolute left-[8%] top-[16%] text-mist">
            {WHY_COMPARISON.genericLabel}
          </span>
          <span className="eyebrow absolute right-[8%] top-[16%] text-lumen">
            {WHY_COMPARISON.lumoraLabel}
          </span>
          {/* headline sits low so the split reads in the frame's centre */}
          <Container className="absolute inset-x-0 bottom-[13%]">
            <div className="mx-auto max-w-2xl text-center">
              <SectionLabel align="center">{STORY_COPY.why.eyebrow}</SectionLabel>
              <p className="mt-4 text-xl leading-snug text-paper md:text-2xl">
                {STORY_COPY.why.headline}
              </p>
            </div>
          </Container>
        </div>

        {/* 04 — Method (left header + right-rail phase copy stepping five sub-ranges) */}
        <div ref={overlayRefs[3]} className={`absolute inset-0 flex items-center ${OVERLAY_INSET}`} style={{ opacity: 0 }}>
          <Container>
            <div className="grid gap-12 md:grid-cols-[1fr_1.1fr] md:items-center md:gap-16">
              <div>
                <SectionLabel>{STORY_COPY.method.eyebrow}</SectionLabel>
                <p className="display-chapter mt-6 max-w-md text-paper">{STORY_COPY.method.headline}</p>
              </div>
              <div className="relative min-h-[260px]">
                {METHOD_PHASES.map((phase, i) => (
                  <div
                    key={phase.name}
                    ref={phaseRefs[i]}
                    className="absolute inset-0 flex flex-col justify-center"
                    style={{ opacity: 0 }}
                  >
                    <span className="eyebrow text-lumen">Phase {phase.index}</span>
                    <h2 className="mt-4 font-display text-2xl font-medium text-paper">{phase.name}</h2>
                    <p className="mt-3 max-w-md text-lg leading-snug text-paper">{phase.headline}</p>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">{phase.description}</p>
                    <p className="mt-4 max-w-md text-sm leading-relaxed text-mist/80">
                      <span className="font-mono text-xs uppercase tracking-wide text-paper">Output — </span>
                      {phase.output}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </div>

        {/* 05 — Solutions preview (editorial list, not cards) */}
        <div ref={overlayRefs[4]} className={`absolute inset-0 flex items-center ${OVERLAY_INSET}`} style={{ opacity: 0 }}>
          <Container>
            <div className="max-w-2xl">
              <SectionLabel>{STORY_COPY.solutions.eyebrow}</SectionLabel>
              <p className="display-chapter mt-6 max-w-xl text-paper">{STORY_COPY.solutions.headline}</p>
              <ul className="mt-10 flex flex-col">
                {FEATURED.map((solution, i) => (
                  <li key={solution.name} className="border-t border-line py-4 last:border-b">
                    <span className="mr-4 font-mono text-xs text-lumen">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-display text-lg font-medium text-paper">{solution.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </div>

        {/* 06 — Proof (serif testimonial pull-quotes). The field is cooled + calmed
            here (uTemp dip, motion damp) and an ink scrim sits behind the grid so the
            human quotes read at a glance — a scrim, not a card. */}
        <div ref={overlayRefs[5]} className={`absolute inset-0 flex items-center ${OVERLAY_INSET}`} style={{ opacity: 0 }}>
          <Container>
            <div className="relative max-w-5xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-10 -inset-y-8"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(10,14,26,0.8) 0%, rgba(10,14,26,0.62) 58%, rgba(10,14,26,0) 82%)",
                  filter: "blur(30px)",
                }}
              />
              <div className="relative grid gap-10 md:grid-cols-2">
                {TESTIMONIALS.slice(0, 2).map((t) => (
                  <figure key={t.name}>
                    <blockquote className="pull-quote text-[clamp(1.3rem,2.4vw,1.9rem)]">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-5 border-t border-line pt-4">
                      <p className="text-sm font-medium text-paper">{t.name}</p>
                      <p className="text-xs text-mist">{t.role}</p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </Container>
        </div>

        {/* 07 — Finale. The constellation converges into the Halo ring; the ring's
            dot node hands off to the primary CTA (the fixed morph button below).
            Here the placeholder reserves that CTA's slot under the closing line. */}
        <div ref={overlayRefs[6]} className="absolute inset-0 flex items-center" style={{ opacity: 0 }}>
          <Container className="text-center">
            <p className="display-chapter mx-auto max-w-2xl text-paper">{STORY_COPY.finale.line}</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <span ref={ctaAnchorRef} aria-hidden className={`${MORPH_BTN_BASE} invisible`}>
                <span>{STORY_COPY.finale.cta}</span>
                <MorphArrow />
              </span>
              <Button href="/systems" variant="secondary">
                {STORY_COPY.finale.ctaSecondary}
              </Button>
            </div>
          </Container>
        </div>
      </div>

      {/* The dot→CTA morph button (§6). position:fixed so it can track the canvas
          dot's viewport coords; driven entirely by the rAF driver above. Kept out
          of the transformed overlays so `fixed` stays viewport-relative. */}
      <Link
        ref={morphBtnRef}
        href="/contact"
        aria-label={STORY_COPY.finale.cta}
        className={`${MORPH_BTN_BASE} fixed left-0 top-0 z-30 -translate-x-1/2 -translate-y-1/2 shadow-[0_0_0_1px_rgba(222,168,47,0.4),0_0_40px_-12px_rgba(222,168,47,0.85)] transition-colors duration-300 will-change-transform hover:bg-lumen-bright`}
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        <span>{STORY_COPY.finale.cta}</span>
        <MorphArrow />
      </Link>

      <AnchorNav progressRef={progressRef} activeRef={stageActiveRef} />
    </section>
  );
}
