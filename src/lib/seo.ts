import type { Metadata } from "next";

// Per-route metadata (P4.2 SEO). Unique title + description, a self-referencing
// canonical, and complete OpenGraph + Twitter Card. The OG *image* is inherited
// site-wide from app/opengraph-image (no per-route image needed). `title` is a
// string so the layout's "%s · Lumora" template still applies to the <title>.
export function pageMeta({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const full = `${title} · Lumora`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: full,
      description,
      url: path,
      type: "website",
      siteName: "Lumora",
      // Site-wide OG image (app/opengraph-image). Setting openGraph on a page drops
      // the inherited file image, so re-attach it explicitly. Per-route images = T2.
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Lumora — AI Business Engineering" }],
    },
    twitter: {
      card: "summary_large_image",
      title: full,
      description,
      images: ["/opengraph-image"],
    },
  };
}
