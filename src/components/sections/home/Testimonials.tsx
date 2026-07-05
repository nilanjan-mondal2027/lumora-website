import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { TESTIMONIALS } from "@/lib/data";

export function Testimonials() {
  return (
    <section className="border-t border-paper/8 bg-ink-raised py-28 md:py-36">
      <Container>
        <Reveal>
          <SectionLabel>What Partners Say</SectionLabel>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 0.1}>
              <figure className="hairline flex h-full flex-col justify-between rounded-[10px] bg-ink p-8">
                <blockquote className="text-base leading-relaxed text-paper">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-6 border-t border-paper/10 pt-5">
                  <p className="text-sm font-medium text-paper">{testimonial.name}</p>
                  <p className="text-xs text-mist">{testimonial.role}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
