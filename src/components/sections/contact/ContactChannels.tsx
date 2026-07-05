import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { Reveal } from "@/components/ui/Reveal";

// Optional secondary talk channel. Keep the number in LUMORA_CONTACT_PHONE, not source.
const WHATSAPP_MESSAGE = "Hi Lumora — I'd like to discuss a system for my business.";

function WhatsAppMark() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" className="shrink-0" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function PhoneGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function ContactChannels({ phone }: { phone?: string }) {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  const national = digits.replace(/^91/, "");
  const display = `+91 ${national.slice(0, 5)} ${national.slice(5)}`.trim();
  const waHref = `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
  const telHref = `tel:+${digits}`;

  return (
    <section className="border-b border-lumen/20 bg-ink pt-16 pb-14 md:pt-20 md:pb-16">
      <Container>
        <Reveal className="max-w-3xl">
          <SectionLabel>Prefer to talk</SectionLabel>
          <h2 className="display-chapter mt-6 text-paper">
            Message us on WhatsApp, or call directly.
          </h2>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button
              href={waHref}
              variant="secondary"
              target="_blank"
              rel="noopener"
              ariaLabel="Chat with Lumora on WhatsApp, opens in a new tab"
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="text-lumen">
                  <WhatsAppMark />
                </span>
                Chat on WhatsApp
              </span>
            </Button>
            <Button
              href={telHref}
              variant="secondary"
              showArrow={false}
              ariaLabel={`Call Lumora at ${display}`}
            >
              <span className="inline-flex items-center gap-2.5">
                <span className="text-lumen">
                  <PhoneGlyph />
                </span>
                Call {display}
              </span>
            </Button>
          </div>
          <p className="mt-5 text-sm text-mist">Available 10 AM – 8 PM IST, weekdays.</p>
        </Reveal>
      </Container>
    </section>
  );
}
