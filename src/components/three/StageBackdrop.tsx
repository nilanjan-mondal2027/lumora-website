"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useInView } from "@/hooks/useInView";
import { HeroPoster } from "./HeroPoster";

// R3F (three + postprocessing) is code-split and only fetched on desktop/
// fine-pointer; mobile/coarse never downloads it (CLAUDE.md perf budget).
const StageCanvas = dynamic(() => import("./StageCanvas").then((m) => m.StageCanvas), { ssr: false });

type Caps = { mount: boolean; bloom: boolean };

export function StageBackdrop({
  progressRef,
  copyZoneRef,
  dotScreenRef,
  className = "",
}: {
  progressRef: { current: number };
  copyZoneRef?: { current: { cx: number; cy: number; r: number } | null };
  dotScreenRef?: { current: { x: number; y: number; visible: boolean } };
  className?: string;
}) {
  const [caps, setCaps] = useState<Caps | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const fine = window.matchMedia("(pointer: fine)").matches;
      const wide = window.innerWidth >= 768;
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
        <StageCanvas
          progressRef={progressRef}
          bloom={caps.bloom}
          copyZoneRef={copyZoneRef}
          dotScreenRef={dotScreenRef}
          className="h-full w-full"
        />
      ) : (
        <HeroPoster className="h-full w-full" />
      )}
    </div>
  );
}
