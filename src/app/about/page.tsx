import type { Metadata } from "next";
import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";
import { Container } from "@/components/ui/Container";
import { AboutAmbient } from "@/components/sections/about/AboutAmbient";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { GlowCard } from "@/components/ui/GlowCard";
import { CtaBand } from "@/components/sections/home/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { aboutPage, breadcrumb } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { METHOD_PHASES, ROADMAP, VALUES } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "About",
  description:
    "Why Lumora exists, our mission, vision, brand promise, core values, method, design philosophy, and roadmap.",
  path: "/about",
});

// Ambient loop only if delivered (T3); else the ink-shaft fallback. Resolved at build.
const HAS_ABOUT_LOOP =
  existsSync(path.join(process.cwd(), "public/media/about-loop.webm")) ||
  existsSync(path.join(process.cwd(), "public/media/about-loop.mp4"));

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutPage()} />
      <JsonLd data={breadcrumb("About", "/about")} />
      <AboutAmbient
        hasLoop={HAS_ABOUT_LOOP}
        eyebrow="About"
        title="Why Lumora exists."
        lead="Most businesses have been sold a tool when what they needed was a system. Lumora exists to close that gap, one business at a time."
      />

      <section className="border-b border-paper/8 bg-ink py-20 md:py-28">
        <Container>
          <div className="grid gap-16 md:grid-cols-2 md:gap-12">
            <Reveal>
              <SectionLabel>Mission</SectionLabel>
              <p className="text-display mt-6 text-paper">
                To empower businesses through intelligent software, custom AI systems, and
                data-driven solutions that simplify operations and accelerate long-term growth.
              </p>
            </Reveal>
            <div className="flex flex-col gap-10">
              <Reveal delay={0.08}>
                <SectionLabel>Vision</SectionLabel>
                <p className="mt-4 text-lg leading-relaxed text-paper">
                  To become one of the world&apos;s most trusted companies for designing custom
                  AI-powered business systems, for organizations of every size.
                </p>
              </Reveal>
              <Reveal delay={0.16}>
                <SectionLabel>Brand Promise</SectionLabel>
                <p className="mt-4 text-lg leading-relaxed text-paper">
                  Every business is different. Every solution should be too.
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-paper/8 bg-ink-raised py-20 md:py-28">
        <Container>
          <Reveal className="max-w-xl">
            <SectionLabel>Core Values</SectionLabel>
            <p className="text-display mt-6 text-paper">What we don&apos;t compromise on.</p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value, index) => (
              <Reveal key={value.name} delay={(index % 3) * 0.08}>
                <GlowCard className="h-full">
                  <p className="font-display text-lg font-medium text-paper">{value.name}</p>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{value.description}</p>
                </GlowCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-paper/8 bg-ink py-20 md:py-28">
        <Container>
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <Reveal>
              <SectionLabel>The Lumora Method</SectionLabel>
              <p className="text-display mt-6 max-w-lg text-paper">
                The same five phases, every time.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <Link href="/#method" className="text-sm text-lumen-bright hover:underline">
                See the method in motion &rarr;
              </Link>
            </Reveal>
          </div>

          <div className="mt-14 grid gap-px overflow-hidden rounded-[10px] border border-paper/10 bg-paper/10 md:grid-cols-5">
            {METHOD_PHASES.map((phase, index) => (
              <Reveal key={phase.name} delay={index * 0.06}>
                <div className="h-full bg-ink p-6">
                  <span className="text-eyebrow text-lumen">{phase.index}</span>
                  <p className="mt-3 font-display text-base font-medium text-paper">
                    {phase.name}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-mist">{phase.headline}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-b border-paper/8 bg-ink-raised py-20 md:py-28">
        <Container>
          <Reveal className="max-w-3xl">
            <SectionLabel>Design Philosophy</SectionLabel>
            <p className="display-chapter mt-6 text-paper">Restraint is a design decision.</p>
            <p className="pull-quote mt-8 !text-[clamp(1.15rem,2.2vw,1.7rem)]">
              We design systems to be understood by the people who run the business, not just the
              people who built them. Every interface, integration, and automation is judged against
              one question: does this make the business easier to run, or just harder to explain?
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="border-b border-paper/8 bg-ink py-24 md:py-32">
        <Container>
          <Reveal>
            <SectionLabel>Future Roadmap</SectionLabel>
          </Reveal>
          <div className="mt-12">
            {ROADMAP.map((item, index) => (
              <Reveal key={item.name} delay={0.05}>
                <div className="grid items-baseline gap-4 border-t border-paper/10 py-12 md:grid-cols-[auto_1fr] md:gap-16">
                  <span className="font-display font-semibold leading-[0.8] text-lumen [font-size:clamp(3.5rem,10vw,7.5rem)]">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="max-w-2xl">
                    <p className="font-display text-2xl font-medium text-paper md:text-3xl">{item.name}</p>
                    <p className="pull-quote mt-5 !text-[clamp(1.1rem,2vw,1.5rem)]">{item.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
