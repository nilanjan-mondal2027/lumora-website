import Link from "next/link";
import { Magnetic } from "./Magnetic";

type Variant = "primary" | "secondary";

const base =
  "group relative inline-flex items-center gap-2.5 rounded-md px-6 py-3.5 text-sm font-medium transition-colors duration-300";

const variants: Record<Variant, string> = {
  primary:
    "bg-lumen text-ink hover:bg-lumen-bright shadow-[0_0_0_1px_rgba(222,168,47,0.4),0_0_40px_-12px_rgba(222,168,47,0.85)]",
  secondary: "border border-paper/15 text-paper hover:border-lumen/50 hover:bg-lumen/10",
};

function Arrow() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 14 14"
      fill="none"
      className="shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      aria-hidden
    >
      <path
        d="M3 11L11 3M11 3H4.5M11 3V9.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Button({
  href,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  children,
  showArrow = true,
  disabled = false,
  target,
  rel,
  ariaLabel,
}: {
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
  showArrow?: boolean;
  disabled?: boolean;
  target?: string;
  rel?: string;
  ariaLabel?: string;
}) {
  const classes = `${base} ${variants[variant]} ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`;

  const content = (
    <>
      <span>{children}</span>
      {showArrow && <Arrow />}
    </>
  );

  if (href) {
    // tel: / mailto: / external URLs render a plain anchor (Link is for routes).
    const external = /^(https?:|tel:|mailto:)/.test(href);
    return (
      <Magnetic>
        {external ? (
          <a href={href} className={classes} target={target} rel={rel} aria-label={ariaLabel}>
            {content}
          </a>
        ) : (
          <Link href={href} className={classes} target={target} rel={rel} aria-label={ariaLabel}>
            {content}
          </Link>
        )}
      </Magnetic>
    );
  }

  return (
    <Magnetic>
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        className={classes}
        aria-label={ariaLabel}
      >
        {content}
      </button>
    </Magnetic>
  );
}
