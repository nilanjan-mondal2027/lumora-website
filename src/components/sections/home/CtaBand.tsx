import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export function CtaBand() {
  return (
    <section className="relative border-t border-paper/8 bg-ink py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0 flex justify-center">
        <div className="h-full w-full max-w-2xl bg-[radial-gradient(ellipse_at_center,_rgba(222,168,47,0.14)_0%,_transparent_70%)]" />
      </div>
      <Container className="relative text-center">
        <Reveal>
          <p className="text-display mx-auto max-w-2xl text-paper">
            Ready to reimagine how your business runs?
          </p>
          <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-mist">
            Begin with a conversation about your business. The system comes after we understand
            it.
          </p>
          <div className="mt-10 flex justify-center">
            <Button href="/contact">Book a Strategy Session</Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
