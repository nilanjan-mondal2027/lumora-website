// Idle breathing Halo beside the contact form (P3.3) — the brand mark at rest, a
// subtle 4s scale/glow loop. Pure CSS (no JS); respects reduced-motion.
export function BreathingHalo({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      <svg
        viewBox="0 0 120 120"
        className="halo-breathe h-full w-full [animation:breathe_4s_ease-in-out_infinite]"
        style={{ filter: "drop-shadow(0 0 26px color-mix(in srgb, var(--color-lumen) 45%, transparent))" }}
      >
        <path
          d="M 95.90 51.05 A 37 37 0 1 1 68.95 24.10"
          fill="none"
          stroke="var(--color-lumen)"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.85"
        />
        <circle cx="86.16" cy="33.84" r="7.2" fill="var(--color-lumen)" />
      </svg>
    </div>
  );
}
