"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { SchematicScene } from "@/components/three/SchematicScene";
import { METHOD_PHASES } from "@/lib/data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function Method() {
  const listRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (!listRef.current) return;

    const scrubTrigger = ScrollTrigger.create({
      trigger: listRef.current,
      start: "top center",
      end: "bottom center",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress * (METHOD_PHASES.length - 1);
      },
    });

    const blocks = gsap.utils.toArray<HTMLElement>(".phase-block");
    const blockTriggers = blocks.map((block) =>
      ScrollTrigger.create({
        trigger: block,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          block.style.opacity = self.isActive ? "1" : "0.32";
        },
      }),
    );

    return () => {
      scrubTrigger.kill();
      blockTriggers.forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <section id="method" className="relative border-t border-paper/8 bg-ink py-28 md:py-36">
      <Container>
        <Reveal>
          <SectionLabel>The Lumora Method</SectionLabel>
          <p className="text-display mt-6 max-w-xl text-paper">
            Five phases. One system, engineered around your business.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-12 md:grid-cols-[1fr_1.15fr] md:gap-16">
          <div className="relative hidden md:block">
            <div className="sticky top-32 h-[440px] rounded-[10px]">
              <SchematicScene
                progressRef={progressRef}
                className="h-full w-full [&>div]:h-full [&_canvas]:!h-full [&_canvas]:!w-full"
                rotationSpeed={0.012}
                parallax={0.06}
                jitter={0.05}
              />
            </div>
          </div>

          <div ref={listRef} className="flex flex-col gap-28">
            {METHOD_PHASES.map((phase) => (
              <div
                key={phase.name}
                className="phase-block transition-opacity duration-500"
                style={{ opacity: 0.32 }}
              >
                <span className="text-eyebrow text-lumen">Phase {phase.index}</span>
                <h3 className="text-display mt-4 text-paper">{phase.name}</h3>
                <p className="mt-3 max-w-md text-lg text-paper">{phase.headline}</p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
                  {phase.description}
                </p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-mist/80">
                  <span className="font-mono text-xs uppercase tracking-wide text-paper">
                    Output —{" "}
                  </span>
                  {phase.output}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
