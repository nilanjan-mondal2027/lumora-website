import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { TECH_ECOSYSTEM } from "@/lib/data";

export function TechEcosystem() {
  return (
    <section className="border-t border-paper/8 bg-ink py-28 md:py-36">
      <Container>
        <Reveal className="max-w-xl">
          <SectionLabel>Technology Ecosystem</SectionLabel>
          <p className="text-display mt-6 text-paper">
            The disciplines every system draws from.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-wrap gap-3">
          {TECH_ECOSYSTEM.map((tech, index) => (
            <Reveal key={tech.name} delay={index * 0.04}>
              <div className="group flex items-center gap-2.5 rounded-md border border-paper/12 px-5 py-3 transition-colors duration-300 hover:border-lumen/40 hover:bg-lumen/8">
                <span className="h-1.5 w-1.5 rounded-full bg-lumen" />
                <span className="text-sm text-paper">{tech.name}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
