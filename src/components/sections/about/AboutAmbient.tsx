import { Container } from "@/components/ui/Container";

// About "heritage moment" hero (story-spec §8/§10). A muted ambient loop when
// public/media/about-loop.* is present; a graceful warm-shaft-on-ink gradient
// when it is absent (§10 mood). No WebGL — a chapter of the same film as Home.
// Server component: the video tag autoplays without JS; the text is the LCP.
export function AboutAmbient({
  hasLoop,
  eyebrow,
  title,
  lead,
}: {
  hasLoop: boolean;
  eyebrow: string;
  title: string;
  lead: string;
}) {
  return (
    <section className="relative flex min-h-[72svh] items-end overflow-hidden border-b border-paper/8 bg-ink">
      <div aria-hidden className="absolute inset-0">
        {hasLoop ? (
          <video
            className="h-full w-full object-cover opacity-70"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            poster="/media/about-poster.jpg"
          >
            <source src="/media/about-loop.webm" type="video/webm" />
            <source src="/media/about-loop.mp4" type="video/mp4" />
          </video>
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(115% 85% at 82% 4%, color-mix(in srgb, var(--color-lumen) 16%, transparent), color-mix(in srgb, var(--color-lumen) 4%, transparent) 32%, transparent 56%), var(--color-ink)",
            }}
          />
        )}
        {/* haze + floor grade so copy sits on darkness, not the light */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
        <div className="bg-grain absolute inset-0 opacity-40" />
      </div>

      <Container className="relative pt-40 pb-16 md:pt-48 md:pb-24">
        <p className="eyebrow text-mist">{eyebrow}</p>
        <h1 className="display-chapter mt-5 max-w-3xl text-paper">{title}</h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-mist">{lead}</p>
      </Container>
    </section>
  );
}
