import { NextResponse } from "next/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Resend endpoint — overridable so the payload can be integration-tested against a
// local mock (defaults to the real API).
const RESEND_URL = process.env.RESEND_API_URL ?? "https://api.resend.com/emails";

// Every lead reaches the private inbox configured for the site. Overridable via
// CONTACT_TO (comma-separated) without exposing the address on the website.
const RECIPIENTS = (process.env.CONTACT_TO ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Sender name per spec; use a verified domain in production.
const FROM =
  process.env.CONTACT_FROM ??
  `Lumora — New Strategy Session Request <${["onboarding", "resend.dev"].join("@")}>`;

// Basic in-memory rate limit (per instance): 5 requests / 60s / IP. First line
// of defence; a durable limiter (KV) is a deploy-time upgrade (see HANDOFF).
const hits = new Map<string, number[]>();
function rateLimited(ip: string) {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

type Contact = {
  name: string;
  email: string;
  company: string;
  industry: string;
  message: string;
  source: string;
};

function istTimestamp(): string {
  return (
    new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date()) + " IST"
  );
}

// site + utm from the submitting page's Referer (or an explicit client value).
function parseSource(referer: string, explicit: string): string {
  if (explicit) return explicit;
  if (!referer) return "direct";
  try {
    const u = new URL(referer);
    const utm = [...u.searchParams.entries()].filter(([k]) => k.startsWith("utm_"));
    const base = `${u.host}${u.pathname}`;
    return utm.length ? `${base} · ${utm.map(([k, v]) => `${k}=${v}`).join(", ")}` : base;
  } catch {
    return referer;
  }
}

function subjectFor(d: Contact) {
  return `Strategy session: ${d.name}, ${d.company || "independent"}`;
}

function bodyFor(d: Contact) {
  return [
    "New strategy session request",
    "",
    `Name:      ${d.name}`,
    `Email:     ${d.email}`,
    `Company:   ${d.company || "independent"}`,
    `Industry:  ${d.industry || "—"}`,
    "",
    "Message:",
    d.message,
    "",
    "———",
    `Submitted: ${istTimestamp()}`,
    `Source:    ${d.source}`,
  ].join("\n");
}

async function deliver(d: Contact): Promise<{ provider: string; id: string | null }> {
  const resendKey = process.env.RESEND_API_KEY;
  const webhook = process.env.CONTACT_WEBHOOK;

  if (!RECIPIENTS.length) throw new Error("contact recipient is not configured");

  if (resendKey) {
    const r = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: FROM,
        to: RECIPIENTS,
        reply_to: d.email, // hitting reply goes to the lead
        subject: subjectFor(d),
        text: bodyFor(d),
      }),
    });
    if (!r.ok) throw new Error(`resend ${r.status}`);
    const json = (await r.json().catch(() => ({}))) as { id?: string };
    return { provider: "resend", id: json?.id ?? null };
  }
  if (webhook) {
    const r = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...d, to: RECIPIENTS, subject: subjectFor(d), submittedAt: istTimestamp() }),
    });
    if (!r.ok) throw new Error(`webhook ${r.status}`);
    return { provider: "webhook", id: null };
  }
  // No provider configured — log so nothing is silently dropped (dev). NOT for prod.
  if (process.env.NODE_ENV === "production") {
    throw new Error("contact delivery is not configured");
  }
  console.warn("[contact] no RESEND_API_KEY / CONTACT_WEBHOOK set — logged only:", {
    ...d,
    to: RECIPIENTS,
  });
  return { provider: "log", id: null };
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  let payload: Record<string, string>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  // Honeypot: bots fill the hidden field. Accept silently so they think it worked.
  if (payload.company_url) return NextResponse.json({ ok: true });

  const name = (payload.name ?? "").trim();
  const email = (payload.email ?? "").trim();
  const message = (payload.message ?? "").trim();

  if (!name || !email || !message) {
    return NextResponse.json({ error: "Name, email, and message are required." }, { status: 400 });
  }
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const data: Contact = {
    name,
    email,
    message,
    company: (payload.company ?? "").trim(),
    industry: (payload.industry ?? "").trim(),
    source: parseSource(request.headers.get("referer") ?? "", (payload.source ?? "").trim()),
  };

  try {
    const { id } = await deliver(data);
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    console.error("[contact] delivery failed", err);
    return NextResponse.json(
      { error: "We couldn't send your message. Please try again later." },
      { status: 502 },
    );
  }
}
