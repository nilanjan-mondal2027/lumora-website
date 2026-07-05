import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { INDUSTRIES } from "@/lib/data";

export function Industries() {
  return (
    <section className="border-t border-paper/8 bg-ink-raised py-28 md:py-36">
      <Container>
        <Reveal className="max-w-xl">
          <SectionLabel>Industries</SectionLabel>
          <p className="text-display mt-6 text-paper">
            Different industries fail with generic AI in different ways.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-px overflow-hidden rounded-[10px] border border-paper/10 bg-paper/10 sm:grid-cols-2 lg:grid-cols-4">
          {INDUSTRIES.map((industry, index) => (
            <Reveal key={industry.name} delay={(index % 4) * 0.06}>
              <div className="h-full bg-ink-raised p-7 transition-colors duration-300 hover:bg-ink-raised-2">
                <p className="font-display text-base font-medium text-paper">{industry.name}</p>
                <p className="mt-2 text-sm leading-relaxed text-mist">{industry.note}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
