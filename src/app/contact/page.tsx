import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/sections/contact/ContactForm";
import { BreathingHalo } from "@/components/sections/contact/BreathingHalo";
import { Faq } from "@/components/sections/contact/Faq";
import { ContactChannels } from "@/components/sections/contact/ContactChannels";
import { JsonLd } from "@/components/JsonLd";
import { faqPage, breadcrumb } from "@/lib/schema";
import { pageMeta } from "@/lib/seo";
import { FAQS } from "@/lib/data";

export const metadata: Metadata = pageMeta({
  title: "Contact",
  description:
    "Book a strategy session with Lumora. Tell us what's slowing your business down and we'll respond within one business day.",
  path: "/contact",
});

const CONTACT_PHONE = process.env.LUMORA_CONTACT_PHONE;

const NEXT_STEPS = [
  {
    name: "We respond within one business day",
    description: "A real reply from the team, not an autoresponder.",
  },
  {
    name: "A 30-minute discovery call",
    description: "We ask about your operations. You ask anything about how we work.",
  },
  {
    name: "A proposal only if it's a fit",
    description: "If a custom system isn't the right move for you yet, we'll say so.",
  },
];

export default function ContactPage() {
  return (
    <>
      <JsonLd data={faqPage(FAQS)} />
      <JsonLd data={breadcrumb("Contact", "/contact")} />
      <PageHero
        eyebrow="Contact"
        title="Begin with a conversation, not a proposal."
        lead="Tell us what's slowing your business down. We'll reply within one business day to schedule a strategy session, no obligation, no generic pitch deck."
      />

      <ContactChannels phone={CONTACT_PHONE} />

      <section className="border-b border-paper/8 bg-ink py-20 md:py-28">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <Reveal>
              <ContactForm />
            </Reveal>

            <div className="flex flex-col gap-12">
              <Reveal delay={0.05} className="hidden lg:block">
                <BreathingHalo className="h-28 w-28" />
              </Reveal>
              <Reveal delay={0.08}>
                <SectionLabel>Contact</SectionLabel>
                <div className="mt-6 flex flex-col gap-2">
                  <p className="font-display text-xl font-medium text-paper">
                    Use the form to start the conversation.
                  </p>
                  <p className="text-sm text-mist">Response within one business day.</p>
                </div>
              </Reveal>

              <Reveal delay={0.14}>
                <SectionLabel>What Happens Next</SectionLabel>
                <div className="mt-6 flex flex-col gap-6">
                  {NEXT_STEPS.map((step, index) => (
                    <div key={step.name} className="flex gap-4">
                      <span className="font-mono text-sm text-lumen">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-paper">{step.name}</p>
                        <p className="mt-1 text-sm leading-relaxed text-mist">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-ink-raised py-20 md:py-28">
        <Container>
          <Reveal className="max-w-xl">
            <SectionLabel>Frequently Asked</SectionLabel>
            <p className="text-display mt-6 text-paper">Before you write your message.</p>
          </Reveal>

          <div className="mt-12">
            <Faq />
          </div>
        </Container>
      </section>
    </>
  );
}
