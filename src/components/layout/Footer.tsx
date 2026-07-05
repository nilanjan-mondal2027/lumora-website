import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { NAV_LINKS } from "@/lib/nav";
import { Mark } from "./Mark";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-paper/8 bg-ink">
      <Container className="grid gap-14 py-20 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="max-w-sm">
          <Link href="/" aria-label="Lumora, home">
            <Mark withWordmark />
          </Link>
          <p className="mt-5 text-sm leading-relaxed text-mist">
            Business Reimagined. We design intelligent business systems tailored to how each
            business actually operates, then engineer them into place.
          </p>
        </div>

        <div>
          <p className="text-eyebrow">Sitemap</p>
          <ul className="mt-5 flex flex-col gap-3">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-mist transition-colors hover:text-paper">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-eyebrow">Start a Partnership</p>
          <ul className="mt-5 flex flex-col gap-3 text-sm text-mist">
            <li>Response within one business day</li>
            <li>
              <Link href="/contact" className="text-paper transition-colors hover:text-lumen-bright">
                Book a strategy session &rarr;
              </Link>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="flex flex-col gap-4 border-t border-paper/8 py-8 text-xs text-mist md:flex-row md:items-center md:justify-between">
        <p>&copy; {year} Lumora. Systems engineered, not installed.</p>
        <p className="font-mono tracking-wide text-mist">DISCOVER · ANALYZE · DESIGN · BUILD · OPTIMIZE</p>
      </Container>
    </footer>
  );
}
