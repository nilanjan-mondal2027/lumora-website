import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import localFont from "next/font/local";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// Editorial serif — self-hosted, italic only. Reserved for pull-quotes and
// About narrative (CLAUDE.md). display:swap + adjustFontFallback gives a
// metric-matched fallback so swap-in is zero-CLS.
const instrumentSerif = localFont({
  src: "./fonts/InstrumentSerif-Italic.woff2",
  variable: "--font-instrument-serif",
  weight: "400",
  style: "italic",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lumora.systems"),
  title: {
    default: "Lumora — Business Reimagined",
    template: "%s · Lumora",
  },
  description:
    "Lumora designs intelligent business systems tailored to how each business operates — custom AI, automation, and software engineered into real operations, not installed on top of them.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Lumora — Business Reimagined",
    description:
      "Intelligent business systems, engineered around how your business actually operates.",
    siteName: "Lumora",
    type: "website",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumora — Business Reimagined",
    description:
      "Intelligent business systems, engineered around how your business actually operates.",
  },
};

// Organization JSON-LD (P4.2 SEO subset) — emitted on every route for search +
// LLM discovery. sameAs carries the canonical Instagram (query params stripped).
const ORG_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lumora",
  url: "https://lumora.systems",
  logo: "https://lumora.systems/icon.svg",
  description:
    "Lumora designs intelligent business systems tailored to how each business operates — custom AI, automation, and software engineered into real operations, not installed on top of them.",
  sameAs: ["https://www.instagram.com/lumora_ai_automation_agency"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-ink text-paper antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }}
        />
        <SmoothScroll>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}
