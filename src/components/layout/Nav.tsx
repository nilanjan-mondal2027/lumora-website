"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS } from "@/lib/nav";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Mark } from "./Mark";
import { MenuOverlay } from "./MenuOverlay";

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const primaryLinks = NAV_LINKS.filter((link) => link.href !== "/");

  return (
    <>
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled && !open ? "border-b border-paper/8 bg-ink/85 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between py-5">
          <Link href="/" aria-label="Lumora, home">
            <Mark withWordmark />
          </Link>

          <nav className="hidden items-center gap-9 md:flex">
            {primaryLinks.slice(0, -1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors ${
                  pathname === link.href ? "text-paper" : "text-mist hover:text-paper"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:block">
              <Button href="/contact" variant="primary" className="!px-5 !py-2.5 text-xs" showArrow={false}>
                Book a Strategy Session
              </Button>
            </div>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="flex h-9 w-9 items-center justify-center text-paper"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
            <span className="relative block h-4 w-5">
              <span
                className={`absolute left-0 top-0 h-px w-5 bg-paper transition-transform duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 top-[7px] h-px w-5 bg-paper transition-opacity duration-300 ${open ? "opacity-0" : "opacity-100"}`}
              />
              <span
                className={`absolute left-0 top-[14px] h-px w-5 bg-paper transition-transform duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
              />
            </span>
            </button>
          </div>
        </div>
      </Container>
    </header>

    <MenuOverlay open={open} onClose={() => setOpen(false)} />
    </>
  );
}
