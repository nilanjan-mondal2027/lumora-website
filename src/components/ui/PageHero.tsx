import { Container } from "./Container";
import { Reveal } from "./Reveal";
import { SectionLabel } from "./SectionLabel";

export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="border-b border-paper/8 bg-ink pt-40 pb-24 md:pt-48 md:pb-32">
      <Container>
        <Reveal>
          <SectionLabel>{eyebrow}</SectionLabel>
          <h1 className="text-hero mt-6 max-w-3xl text-paper">{title}</h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-mist">{lead}</p>
        </Reveal>
      </Container>
    </section>
  );
}
