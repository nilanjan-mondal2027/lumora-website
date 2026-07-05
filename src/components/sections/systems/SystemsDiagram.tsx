"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SYSTEM_CLUSTERS } from "@/lib/data";

export function SystemsDiagram() {
  const [active, setActive] = useState(0);
  const cluster = SYSTEM_CLUSTERS[active];

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:gap-3">
        {SYSTEM_CLUSTERS.map((c, index) => (
          <button
            key={c.cluster}
            type="button"
            onClick={() => setActive(index)}
            aria-pressed={index === active}
            className={`group flex-1 rounded-[10px] border px-6 py-6 text-left transition-colors duration-300 ${
              index === active
                ? "border-lumen/60 bg-lumen/[0.08]"
                : "border-volt/20 bg-volt/[0.03] hover:border-volt/45"
            }`}
          >
            {/* temperature: the selected cluster is engineered (lumen); the rest stay raw (volt) */}
            <span className="flex items-center gap-2.5">
              <span
                className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                  index === active ? "bg-lumen shadow-[0_0_10px_-1px_var(--color-lumen)]" : "bg-volt/50"
                }`}
              />
              <span className={`text-eyebrow ${index === active ? "text-lumen" : "text-volt/70"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
            </span>
            <p
              className={`mt-3 font-display text-xl font-medium transition-colors ${
                index === active ? "text-paper" : "text-paper/70"
              }`}
            >
              {c.cluster}
            </p>
            <p className={`mt-2 text-sm leading-relaxed ${index === active ? "text-mist" : "text-mist/60"}`}>
              {c.summary}
            </p>
          </button>
        ))}
      </div>

      <div className="relative mt-3 hidden h-px md:block">
        <div className="absolute inset-x-6 top-0 h-px bg-paper/10" />
      </div>

      <div className="mt-10 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={cluster.cluster}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {cluster.capabilities.map((capability) => (
              <div key={capability.name} className="hairline rounded-[10px] bg-ink-raised p-7">
                <p className="font-display text-base font-medium text-paper">
                  {capability.name}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-mist">
                  {capability.description}
                </p>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
