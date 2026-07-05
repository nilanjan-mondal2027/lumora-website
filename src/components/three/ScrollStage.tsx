"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MobileStory } from "./MobileStory";

const DesktopScrollStage = dynamic(
  () => import("./DesktopScrollStage").then((mod) => mod.DesktopScrollStage),
  { ssr: false, loading: () => <MobileStory /> },
);

function shouldUseDesktopStage() {
  const fine = window.matchMedia("(pointer: fine)").matches;
  const wide = window.innerWidth >= 768;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return fine && wide && !reduced;
}

export function ScrollStage() {
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const evaluate = () => setDesktop(shouldUseDesktopStage());
    evaluate();

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer = window.matchMedia("(pointer: fine)");
    window.addEventListener("resize", evaluate);
    reduced.addEventListener("change", evaluate);
    pointer.addEventListener("change", evaluate);
    return () => {
      window.removeEventListener("resize", evaluate);
      reduced.removeEventListener("change", evaluate);
      pointer.removeEventListener("change", evaluate);
    };
  }, []);

  return desktop ? <DesktopScrollStage /> : <MobileStory />;
}
