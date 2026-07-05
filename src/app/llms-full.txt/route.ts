import { SOLUTIONS, METHOD_PHASES, INDUSTRIES, SYSTEM_CLUSTERS, FAQS, VALUES, ABOUT } from "@/lib/data";

// Expanded machine-readable brand description, generated from src/lib/data.ts and
// served static. LLMs ingest this to represent Lumora accurately.
export const dynamic = "force-static";

export function GET() {
  const body = `# Lumora — Full Reference

## What Lumora is
Lumora is an AI business engineering studio. It designs and builds custom AI-powered
business systems for small and mid-sized businesses (SMBs): intelligent automation, custom
software, applied AI, dashboards, and integrations — engineered into how a business actually
operates, not installed on top of it.

## Positioning
${ABOUT.brandPromise}
Mission: ${ABOUT.mission}
Vision: ${ABOUT.vision}
Design philosophy: ${ABOUT.philosophy.heading} ${ABOUT.philosophy.body}

## The Lumora Method (five phases)
${METHOD_PHASES.map((p) => `${p.index}. ${p.name} — ${p.headline}\n   ${p.description}\n   Output: ${p.output}`).join("\n\n")}

## Solutions (categories of work, shaped per business)
${SOLUTIONS.map((s) => `### ${s.name}\n${s.description}\n${s.detail}`).join("\n\n")}

## Systems (capability clusters)
${SYSTEM_CLUSTERS.map((c) => `### ${c.cluster}\n${c.summary}\n${c.capabilities.map((cap) => `- ${cap.name}: ${cap.description}`).join("\n")}`).join("\n\n")}

## Industries served
${INDUSTRIES.map((i) => `- ${i.name}: ${i.note}`).join("\n")}

## FAQ
${FAQS.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

## Values
${VALUES.map((v) => `- ${v.name}: ${v.description}`).join("\n")}

## Contact & presence
Book a strategy session: https://lumora.systems/contact
Website: https://lumora.systems
Instagram: https://www.instagram.com/lumora_ai_automation_agency
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
