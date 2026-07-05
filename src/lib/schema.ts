// JSON-LD builders (P4.2 SEO). Single source for structured data across routes.
const BASE = "https://lumora.systems";

export function breadcrumb(name: string, pathname: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: BASE },
      { "@type": "ListItem", position: 2, name, item: `${BASE}${pathname}` },
    ],
  };
}

export function faqPage(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}

export function serviceList(items: { name: string; description: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Service",
        name: s.name,
        description: s.description,
        provider: { "@type": "Organization", name: "Lumora", url: BASE },
        areaServed: "Global",
      },
    })),
  };
}

export function aboutPage() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Lumora",
    url: `${BASE}/about`,
    mainEntity: { "@type": "Organization", name: "Lumora", url: BASE },
  };
}
