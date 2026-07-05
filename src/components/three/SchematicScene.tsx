"use client";

import dynamic from "next/dynamic";
import { useInView } from "@/hooks/useInView";

const SchematicCanvas = dynamic(
  () => import("./SchematicCanvas").then((module) => module.SchematicCanvas),
  { ssr: false },
);

export function SchematicScene({
  progressRef,
  className = "",
  rotationSpeed,
  parallax,
  jitter,
}: {
  progressRef: { current: number };
  className?: string;
  rotationSpeed?: number;
  parallax?: number;
  jitter?: number;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      {inView && (
        <SchematicCanvas
          progressRef={progressRef}
          className="h-full w-full"
          rotationSpeed={rotationSpeed}
          parallax={parallax}
          jitter={jitter}
        />
      )}
    </div>
  );
}
