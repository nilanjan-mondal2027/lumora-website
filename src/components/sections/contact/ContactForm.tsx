"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { INDUSTRIES } from "@/lib/data";

type Status = "idle" | "submitting" | "success" | "error";

const fieldClasses =
  "w-full rounded-md border border-paper/15 bg-ink px-4 py-3 text-sm text-paper placeholder:text-mist/50 outline-none transition-colors duration-300 focus:border-lumen";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || ""),
      email: String(data.get("email") || ""),
      company: String(data.get("company") || ""),
      industry: String(data.get("industry") || ""),
      message: String(data.get("message") || ""),
      company_url: String(data.get("company_url") || ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Try again.");
      }

      setStatus("success");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <div className="hairline rounded-[10px] bg-ink-raised/60 p-8 backdrop-blur-xl md:p-10">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-start py-10"
          >
            <span className="glow-lumen flex h-12 w-12 items-center justify-center rounded-full bg-lumen/15 text-lumen">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
                <path
                  d="M4 10.5L8 14.5L16 5.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <p className="mt-6 font-display text-xl font-medium text-paper">
              Request received.
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-mist">
              We&apos;ll respond within one business day to schedule your strategy session. In
              the meantime, take a look at how we build.
            </p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
          >
            {/* honeypot — hidden from humans, catches bots */}
            <input
              type="text"
              name="company_url"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="name" className="text-eyebrow">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Jordan Lee"
                  className={`${fieldClasses} mt-2`}
                />
              </div>
              <div>
                <label htmlFor="email" className="text-eyebrow">
                  Work Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Your work email"
                  className={`${fieldClasses} mt-2`}
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label htmlFor="company" className="text-eyebrow">
                  Company
                </label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Company name"
                  className={`${fieldClasses} mt-2`}
                />
              </div>
              <div>
                <label htmlFor="industry" className="text-eyebrow">
                  Industry
                </label>
                <select id="industry" name="industry" className={`${fieldClasses} mt-2`} defaultValue="">
                  <option value="" disabled>
                    Select an industry
                  </option>
                  {INDUSTRIES.map((industry) => (
                    <option key={industry.name} value={industry.name}>
                      {industry.name}
                    </option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="message" className="text-eyebrow">
                What&apos;s slowing your business down right now?
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                placeholder="Tell us about the workflow, tool, or process that isn't keeping up."
                className={`${fieldClasses} mt-2 resize-none`}
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-400">{errorMessage}</p>
            )}

            <div className="mt-2">
              <Button type="submit" disabled={status === "submitting"}>
                {status === "submitting" ? "Sending…" : "Request a Strategy Session"}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
