"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useInView } from "@/hooks/useInView";
import { HeroPoster } from "./HeroPoster";

// R3F (three.js + postprocessing) is code-split and only fetched on desktop/
// fine-pointer — mobile/coarse never downloads it (CLAUDE.md perf budget).
const HeroCanvas = dynamic(() => import("./HeroCanvas").then((m) => m.HeroCanvas), { ssr: false });

type Caps = { mount: boolean; bloom: boolean };

export function HeroConstellation({ className = "" }: { className?: string }) {
  // null = undecided (SSR + first client paint) → render the static poster.
  const [caps, setCaps] = useState<Caps | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const fine = window.matchMedia("(pointer: fine)").matches;
      const wide = window.innerWidth >= 768;
      // deviceMemory is undefined in Safari/Firefox — treat "unknown" as capable so
      // desktop still gets bloom (resolves boot Q7). Coarse/narrow never mounts R3F.
      const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
      const mount = fine && wide;
      const bloom = mount && (mem === undefined || mem >= 4);
      setCaps({ mount, bloom });
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden>
      {caps?.mount && inView ? (
        <HeroCanvas bloom={caps.bloom} className="h-full w-full" />
      ) : (
        <HeroPoster className="h-full w-full" />
      )}
    </div>
  );
}
