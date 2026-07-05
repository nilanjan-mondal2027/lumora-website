import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { GlowCard } from "@/components/ui/GlowCard";
import { CtaBand } from "@/components/sections/home/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { serviceList, breadcrumb } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { SOLUTIONS } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Solutions",
  description:
    "What Lumora designs and builds: AI business systems, intelligent automation, custom software, dashboards, assistants, and more, engineered around your business.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <>
      <JsonLd data={serviceList(SOLUTIONS)} />
      <JsonLd data={breadcrumb("Solutions", "/solutions")} />
      <PageHero
        eyebrow="Solutions"
        title="Solutions engineered around your business."
        lead="We don't sell predefined packages. Every solution below is a starting point we shape around how your specific business operates, not a box you have to fit into."
      />

      <section className="border-b border-paper/8 bg-ink py-20 md:py-28">
        <Container>
          <Reveal className="max-w-2xl">
            <SectionLabel>How To Read This Page</SectionLabel>
            <p className="display-chapter mt-6 text-paper">
              Same category. Different system, every time.
            </p>
            <p className="pull-quote mt-8 !text-[clamp(1.1rem,2vw,1.5rem)]">
              Two businesses in the same industry rarely need the same system. What follows are
              the categories of work we engineer in, not a menu. The scope, integrations, and
              intelligence inside each one are decided during Discover and Design, specific to
              your operations.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="bg-ink-raised py-20 md:py-28">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {SOLUTIONS.map((solution, index) => (
              <Reveal key={solution.name} delay={(index % 3) * 0.08}>
                <GlowCard className="h-full">
                  <p className="font-display text-lg font-medium text-paper">{solution.name}</p>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{solution.description}</p>
                  <p className="mt-4 border-t border-paper/10 pt-4 text-sm leading-relaxed text-mist/80">
                    {solution.detail}
                  </p>
                </GlowCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
