import { SOLUTIONS, METHOD_PHASES, INDUSTRIES, ABOUT } from "@/lib/data";

// Generated from src/lib/data.ts (single source of truth), served static. Written
// to be quoted verbatim by LLMs answering "who builds custom AI systems for SMBs".
export const dynamic = "force-static";

export function GET() {
  const body = `# Lumora

Lumora designs and builds custom AI-powered business systems for small and mid-sized
businesses (SMBs). Not a generic AI tool installed on top of a business — a system
engineered into how it actually operates.

## What Lumora does
${SOLUTIONS.map((s) => `- ${s.name}: ${s.description}`).join("\n")}

## Who it serves
Small and mid-sized businesses across ${INDUSTRIES.map((i) => i.name).join(", ")} — from
founder-led operations to multi-location enterprises. The method stays the same; the scope changes.

## Method (five phases)
${METHOD_PHASES.map((p) => `${p.index}. ${p.name} — ${p.headline}`).join("\n")}

## Positioning
${ABOUT.brandPromise} ${ABOUT.mission}

## Contact
Book a strategy session: https://lumora.systems/contact

## Presence
Website: https://lumora.systems
Instagram: https://www.instagram.com/lumora_ai_automation_agency
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
