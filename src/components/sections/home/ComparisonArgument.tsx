import { Container } from "@/components/ui/Container";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { STORY_COPY, WHY_COMPARISON } from "@/lib/data";

// Accessible / crawlable fallback for the comparison-as-visual (story-spec §6).
// The split constellation carries the argument on desktop, so this is `sr-only`
// there (present in the DOM, read by crawlers + screen readers, sensible order);
// on mobile and under prefers-reduced-motion it renders as the full visible table.
export function ComparisonArgument() {
  return (
    <section aria-labelledby="why-generic-heading" className="bg-ink">
      <Container>
        <div className="py-20 motion-safe:md:sr-only">
          <SectionLabel>{STORY_COPY.why.eyebrow}</SectionLabel>
          <h2 id="why-generic-heading" className="text-display mt-6 max-w-2xl text-paper">
            {STORY_COPY.why.headline}
          </h2>

          <div className="hairline mt-10 overflow-hidden rounded-[10px]">
            <div className="grid grid-cols-2 border-b border-line bg-ink/40">
              <p className="eyebrow px-6 py-4">{WHY_COMPARISON.genericLabel}</p>
              <p className="eyebrow px-6 py-4 text-lumen">{WHY_COMPARISON.lumoraLabel}</p>
            </div>
            {WHY_COMPARISON.rows.map((row) => (
              <div key={row.generic} className="grid grid-cols-2 border-b border-line last:border-b-0">
                <p className="px-6 py-5 text-sm text-mist">{row.generic}</p>
                <p className="px-6 py-5 text-sm text-paper">{row.lumora}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
