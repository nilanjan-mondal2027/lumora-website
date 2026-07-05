// Renders a JSON-LD <script>. Server-safe; the payload is serialized inline so it
// is present in the initial HTML (crawler + LLM readable with JS disabled).
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
