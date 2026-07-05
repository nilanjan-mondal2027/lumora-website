"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { HeroConstellation } from "@/components/three/HeroConstellation";
import { IgnitionGate, shouldPlayIgnition } from "@/components/layout/IgnitionGate";

if (typeof window !== "undefined") {
  gsap.registerPlugin(SplitText);
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const splitRef = useRef<SplitText | null>(null);
  const revealsRef = useRef<Element[]>([]);

  // Prepare the pre-reveal (hidden) state up front, but only when the ignition
  // ceremony will actually play. Otherwise the hero renders as its static SSR
  // composition (reduced-motion, or already ignited this session) — no hiding.
  useIsoLayoutEffect(() => {
    if (!headlineRef.current || !rootRef.current) return;
    if (!shouldPlayIgnition()) return;
    const split = new SplitText(headlineRef.current, { type: "lines", mask: "lines", linesClass: "hero-line" });
    splitRef.current = split;
    revealsRef.current = Array.from(rootRef.current.querySelectorAll(".hero-reveal"));
    gsap.set(split.lines, { yPercent: 110 });
    gsap.set(revealsRef.current, { autoAlpha: 0, y: 16 });
    return () => {
      split.revert();
      splitRef.current = null;
    };
  }, []);

  // Fired by the ignition overlay on completion (or skip). Only the "played"
  // path animates; the static path leaves the SSR composition untouched.
  const handleIgnited = (played: boolean) => {
    if (!played || !splitRef.current) return;
    gsap
      .timeline()
      .to(splitRef.current.lines, { yPercent: 0, duration: 1.1, ease: "expo.out", stagger: 0.12 })
      .to(revealsRef.current, { autoAlpha: 1, y: 0, duration: 0.8, ease: "expo.out", stagger: 0.08 }, "-=0.55");
  };

  return (
    <section
      ref={rootRef}
      className="relative flex min-h-screen items-center overflow-hidden bg-ink pt-24"
    >
      <IgnitionGate onComplete={handleIgnited} />

      <HeroConstellation className="fixed inset-0 z-0 [&>div]:h-full [&_canvas]:!h-full [&_canvas]:!w-full" />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-transparent via-transparent to-ink" />

      <Container className="relative z-10">
        <div className="max-w-3xl">
          <p className="hero-reveal text-eyebrow mb-6">Lumora — AI Business Engineering</p>
          <h1 ref={headlineRef} className="display-hero text-paper">
            Business,
            <br />
            Reimagined.
          </h1>
          <p className="hero-reveal mt-8 max-w-xl text-lg leading-relaxed text-mist">
            We design intelligent business systems tailored to how your business actually
            operates. Not a generic AI tool installed on top of it, a system engineered into it.
          </p>
          <div className="hero-reveal mt-10 flex flex-wrap items-center gap-4">
            <Button href="/contact">Book a Strategy Session</Button>
            <Button href="/systems" variant="secondary">
              See how we build
            </Button>
          </div>
        </div>
      </Container>

      <div className="hero-reveal absolute bottom-10 left-1/2 z-10 -translate-x-1/2">
        <div className="flex flex-col items-center gap-3 text-mist">
          <span className="text-eyebrow">Scroll</span>
          <span className="h-10 w-px bg-gradient-to-b from-mist/70 to-transparent" />
        </div>
      </div>
    </section>
  );
}
