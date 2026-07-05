import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { GlowCard } from "@/components/ui/GlowCard";
import { Button } from "@/components/ui/Button";
import { SOLUTIONS } from "@/lib/data";

const FEATURED = [0, 1, 5, 9].map((index) => SOLUTIONS[index]);

export function FeaturedSolutions() {
  return (
    <section className="border-t border-paper/8 bg-ink py-28 md:py-36">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <Reveal>
            <SectionLabel>Featured Solutions</SectionLabel>
            <p className="text-display mt-6 max-w-lg text-paper">
              A sample of what we engineer, shaped around your business.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <Button href="/solutions" variant="secondary">
              View all solutions
            </Button>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {FEATURED.map((solution, index) => (
            <Reveal key={solution.name} delay={index * 0.08}>
              <GlowCard className="h-full">
                <p className="font-display text-lg font-medium text-paper">{solution.name}</p>
                <p className="mt-3 text-sm leading-relaxed text-mist">{solution.description}</p>
              </GlowCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
