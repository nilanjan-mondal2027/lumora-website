"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NAV_LINKS } from "@/lib/nav";

// Full-screen editorial menu (story-spec §7): two groups — story anchors (mono,
// small) and routes (huge Bricolage, lumen-dot hover). Staggered 40ms reveals;
// traps focus, closes on Esc, locks body scroll through Lenis.
const STORY_ANCHORS = [
  { label: "Philosophy", start: 0.12 },
  { label: "Approach", start: 0.24 },
  { label: "Method", start: 0.38 },
  { label: "Solutions", start: 0.72 },
  { label: "Proof", start: 0.82 },
  { label: "Begin", start: 0.9 },
];

export function MenuOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    if (!open) return;
    lenisRef.current?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const nodes = ref.current?.querySelectorAll<HTMLElement>("a[href],button:not([disabled])");
        if (!nodes || nodes.length === 0) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const raf = requestAnimationFrame(() =>
      ref.current?.querySelector<HTMLElement>("a[href],button:not([disabled])")?.focus(),
    );
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      lenisRef.current?.start();
    };
  }, [open, onClose]);

  const goStory = (start: number) => {
    onClose();
    if (pathname !== "/") {
      router.push("/");
      return;
    }
    // On home, smooth-scroll to the pinned-stage range (same math as AnchorNav).
    const run = () => {
      const st = ScrollTrigger.getById("stage");
      if (!st) return;
      const target = st.start + Math.min(1, start + 0.03) * (st.end - st.start);
      const l = lenisRef.current;
      if (l) l.scrollTo(target, { duration: 1.1 });
      else window.scrollTo({ top: target, behavior: "smooth" });
    };
    requestAnimationFrame(() => requestAnimationFrame(run));
  };

  if (!open) return null;

  const container = { animate: { transition: { staggerChildren: 0.04 } } };
  const item = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
  };

  return (
    <motion.div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[80] flex flex-col justify-center overflow-y-auto bg-ink px-[max(1.5rem,6vw)] py-24"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="fixed right-[max(1.5rem,6vw)] top-6 z-[81] font-mono text-xs uppercase tracking-[0.18em] text-mist transition-colors hover:text-paper"
      >
        Close
      </button>
      <motion.div variants={container} initial="initial" animate="animate" className="mx-auto w-full max-w-[1400px]">
        <motion.p variants={item} className="eyebrow mb-8 text-mist">
          Story
        </motion.p>
        <motion.ul variants={container} className="mb-16 flex flex-wrap gap-x-8 gap-y-2">
          {STORY_ANCHORS.map((a) => (
            <motion.li key={a.label} variants={item}>
              <button
                type="button"
                onClick={() => goStory(a.start)}
                className="group flex items-center gap-2 font-mono text-xs uppercase tracking-[0.18em] text-mist transition-colors hover:text-paper"
              >
                <span className="h-1 w-1 rounded-full bg-mist/40 transition-colors group-hover:bg-lumen" />
                {a.label}
              </button>
            </motion.li>
          ))}
        </motion.ul>

        <motion.p variants={item} className="eyebrow mb-8 text-mist">
          Pages
        </motion.p>
        <motion.ul variants={container} className="flex flex-col gap-1">
          {NAV_LINKS.map((link) => (
            <motion.li key={link.href} variants={item}>
              <Link
                href={link.href}
                onClick={onClose}
                aria-current={pathname === link.href ? "page" : undefined}
                className="group flex items-center gap-5 py-1 font-display font-medium leading-[1.05] text-mist transition-colors hover:text-paper [font-size:clamp(2.5rem,7vw,5rem)]"
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full transition-all duration-300 ${
                    pathname === link.href ? "bg-lumen" : "bg-transparent group-hover:bg-lumen"
                  }`}
                />
                {link.label}
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
