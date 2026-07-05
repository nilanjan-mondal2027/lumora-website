import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";

const PRINCIPLES = [
  {
    title: "We start with your operations, not our product.",
    body: "Discovery comes before architecture. We learn how your business actually runs before we propose a single system.",
  },
  {
    title: "We build the specific system your business needs.",
    body: "No predefined packages. Every system is scoped to the workflows, data, and people it has to work with.",
  },
  {
    title: "We stay as the system evolves with you.",
    body: "A business that grows changes what it needs. We keep tuning the system so it keeps fitting.",
  },
];

export function Philosophy() {
  return (
    <section className="border-t border-paper/8 bg-ink py-28 md:py-36">
      <Container>
        <div className="grid gap-16 md:grid-cols-2 md:gap-12">
          <Reveal>
            <SectionLabel>Our Philosophy</SectionLabel>
            <p className="text-display mt-6 max-w-md text-paper">
              Every business is different. Every solution should be too.
            </p>
            <p className="mt-6 max-w-md text-base leading-relaxed text-mist">
              We don&apos;t sell predefined services or install generic AI tools. We work directly
              with business owners to understand how the business runs, identify where
              intelligence changes an outcome, and engineer a system around that reality, not
              around a template.
            </p>
          </Reveal>

          <div className="flex flex-col gap-8">
            {PRINCIPLES.map((principle, index) => (
              <Reveal key={principle.title} delay={index * 0.1}>
                <div className="border-t border-paper/10 pt-6">
                  <p className="font-display text-lg font-medium text-paper">{principle.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-mist">{principle.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
