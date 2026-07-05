import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SystemsDiagram } from "@/components/sections/systems/SystemsDiagram";
import { CtaBand } from "@/components/sections/home/CtaBand";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumb } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Systems",
  description:
    "The engineering behind every Lumora system: business process engineering, AI infrastructure, automation architecture, data pipelines, security, and long-term optimization.",
  path: "/systems",
});

export default function SystemsPage() {
  return (
    <>
      <JsonLd data={breadcrumb("Systems", "/systems")} />
      <PageHero
        eyebrow="Systems"
        title="The engineering behind every system."
        lead="Systems replaces a services page. This is what we're actually engineering underneath the surface, organized by how the work builds on itself. Select a stage to see what's inside it."
      />

      <section className="border-b border-paper/8 bg-ink py-20 md:py-28">
        <Container>
          <SystemsDiagram />
        </Container>
      </section>

      <CtaBand />
    </>
  );
}
