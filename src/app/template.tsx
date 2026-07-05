"use client";

import { motion } from "framer-motion";

// Route transition (story-spec §7): a 400ms lumen light-streak sweeps across a
// brief ink veil while the incoming page fades/slides. The streak layer is
// pointer-events-none for its whole life, so it never blocks input after 400ms.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[100]"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <motion.div
          className="absolute inset-0 bg-ink"
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-0 top-1/2 h-px w-full origin-left bg-gradient-to-r from-transparent via-lumen to-transparent"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: [0, 1, 0] }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </>
  );
}
