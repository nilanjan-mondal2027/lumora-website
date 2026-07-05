"use client";

import { useEffect, useState } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function LenisBridge({ children }: { children: React.ReactNode }) {
  const lenis = useLenis(() => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    function update(time: number) {
      lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(update);
    };
  }, [lenis]);

  return (
    <ReactLenis
      root
      options={{
        autoRaf: false,
        lerp: 0.11,
        duration: 1.2,
        smoothWheel: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Reading matchMedia only after mount (not via a lazy initial state) is
    // required here: the server always renders `false`, so syncing on the
    // client's first render instead of post-hydration would mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReducedMotion(query.matches);
    const listener = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, []);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return <LenisBridge>{children}</LenisBridge>;
}
