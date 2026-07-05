"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQS } from "@/lib/data";

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="flex flex-col">
      {FAQS.map((faq, index) => {
        const open = openIndex === index;
        return (
          <div key={faq.question} className="border-b border-paper/10">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="font-display text-base font-medium text-paper md:text-lg">
                {faq.question}
              </span>
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-paper/20 text-paper transition-transform duration-300 ${
                  open ? "rotate-45" : ""
                }`}
              >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                  <path d="M5 0V10M0 5H10" stroke="currentColor" strokeWidth="1.2" />
                </svg>
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="max-w-xl pb-6 text-sm leading-relaxed text-mist">{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
