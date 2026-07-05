// Halo brand mark — geometry copied verbatim from public/brand/halo-icon.svg
// (viewBox 0 0 120 120): an open ring (55° gap centered at −45°) with the gold
// dot sitting on the ring radius inside the gap. The ring inherits currentColor;
// the dot is always --lumen. Hover: the ring rotates −8° about its centre and
// the dot glows (0.3s) — CLAUDE.md micro-interaction timing.

type MarkProps = {
  size?: number;
  withWordmark?: boolean;
  className?: string;
};

export function Mark({ size = 26, withWordmark = false, className = "" }: MarkProps) {
  return (
    <span className={`group inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        fill="none"
        aria-hidden
        className="shrink-0 overflow-visible"
      >
        <path
          d="M 95.90 51.05 A 37 37 0 1 1 68.95 24.10"
          fill="none"
          stroke="currentColor"
          strokeWidth="12.5"
          strokeLinecap="round"
          className="transition-transform duration-300 ease-out group-hover:-rotate-[8deg]"
          style={{ transformBox: "view-box", transformOrigin: "60px 60px" }}
        />
        <circle
          cx="86.16"
          cy="33.84"
          r="7.2"
          fill="var(--color-lumen)"
          className="transition-[filter] duration-300 ease-out group-hover:[filter:drop-shadow(0_0_5px_var(--color-lumen))]"
        />
      </svg>
      {withWordmark && (
        <span
          className="font-display font-semibold tracking-tight text-paper"
          style={{ fontSize: size * 0.66 }}
        >
          Lumora
        </span>
      )}
    </span>
  );
}
