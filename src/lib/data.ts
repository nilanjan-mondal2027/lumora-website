export type MethodPhase = {
  index: string;
  name: string;
  headline: string;
  description: string;
  output: string;
};

export const METHOD_PHASES: MethodPhase[] = [
  {
    index: "01",
    name: "Discover",
    headline: "We study how your business actually runs.",
    description:
      "A real audit inside your operations — workflows, data, and where time and revenue quietly leak.",
    output: "A written map of how the business actually operates today, gaps included.",
  },
  {
    index: "02",
    name: "Analyze",
    headline: "We find where intelligence changes the outcome.",
    description:
      "Every workflow tested against one question: does intelligence change the outcome here, or just the interface?",
    output: "A prioritized list of interventions ranked by business impact, not novelty.",
  },
  {
    index: "03",
    name: "Design",
    headline: "We architect a system, not a tool.",
    description:
      "We architect the specific software, automations, and AI your business needs — around your team, data, and customers.",
    output: "A system architecture your team can see and approve before a line of code is written.",
  },
  {
    index: "04",
    name: "Build",
    headline: "We engineer it into your business.",
    description:
      "Our engineers build inside your real environment, integrated with what you already run, not bolted on top.",
    output: "A working system, tested against your actual data and workflows.",
  },
  {
    index: "05",
    name: "Optimize",
    headline: "We keep tuning after launch.",
    description:
      "Systems drift as you grow. We monitor, retrain, and refine so day-one fit still holds three years in.",
    output: "A maintained system with a standing improvement cycle, not a one-time delivery.",
  },
];

// Verbatim homepage story copy (story-spec §8). Components stay copy-free and
// source everything from here. Edits require approval.
export const STORY_COPY = {
  hero: {
    eyebrow: "Lumora — AI Business Engineering",
    headlineLines: ["Business,", "Reimagined."],
    sub: "We design intelligent business systems tailored to how your business actually operates. Not a generic AI tool installed on top of it — a system engineered into it.",
    scrollCue: "Scroll",
  },
  philosophy: {
    eyebrow: "Our Philosophy",
    pullQuote: "Every business is different. Every solution should be too.",
  },
  why: {
    eyebrow: "Why Generic AI Fails",
    headline: "Generic tools optimize for everyone. That is precisely why they underperform for you.",
  },
  method: {
    eyebrow: "The Lumora Method",
    headline: "Five phases. One system, engineered around your business.",
  },
  solutions: {
    eyebrow: "Solutions",
    headline: "A sample of what we engineer, shaped around your business.",
  },
  proof: {
    eyebrow: "Proof",
  },
  finale: {
    line: "The system completes when you move.",
    cta: "Book a Strategy Session",
    ctaSecondary: "See how we build",
  },
} as const;

// About-page narrative + machine-readable brand facts (story-spec §8 voice).
// Single source consumed by /llms.txt, /llms-full.txt, and the About JSON-LD. Verbatim.
export const ABOUT = {
  hero: {
    eyebrow: "About",
    title: "Why Lumora exists.",
    lead: "Most businesses have been sold a tool when what they needed was a system. Lumora exists to close that gap, one business at a time.",
  },
  mission:
    "To empower businesses through intelligent software, custom AI systems, and data-driven solutions that simplify operations and accelerate long-term growth.",
  vision:
    "To become one of the world's most trusted companies for designing custom AI-powered business systems, for organizations of every size.",
  brandPromise: "Every business is different. Every solution should be too.",
  philosophy: {
    heading: "Restraint is a design decision.",
    body: "We design systems to be understood by the people who run the business, not just the people who built them. Every interface, integration, and automation is judged against one question: does this make the business easier to run, or just harder to explain?",
  },
} as const;

// Solutions surfaced in the Solutions-preview chapter (editorial list, not cards).
export const FEATURED_SOLUTION_INDEXES = [0, 1, 5, 9];

// Comparison-as-visual (story-spec §6). The constellation split carries the
// argument on desktop; these rows are the accessible/crawlable fallback rendered
// beneath the stage (full on mobile/reduced-motion, sr-only compact on desktop).
export const WHY_COMPARISON = {
  genericLabel: "Generic AI Tools",
  lumoraLabel: "A Lumora System",
  rows: [
    { generic: "One-size-fits-all workflows", lumora: "Workflows modeled on how you actually operate" },
    { generic: "Bolted onto your existing software", lumora: "Engineered directly into your operations" },
    { generic: "Optimized for broad adoption", lumora: "Optimized for your specific outcomes" },
    { generic: "Support ends at onboarding", lumora: "Optimization continues after launch" },
  ],
};

export type Solution = {
  name: string;
  description: string;
  detail: string;
};

export const SOLUTIONS: Solution[] = [
  {
    name: "AI Business Systems",
    description:
      "End-to-end systems combining automation, data, and applied AI, modeled on how your business actually decides things.",
    detail:
      "We start from your decisions, not a feature list. Every AI Business System is built around the specific choices your team makes every day, then engineered to make those choices faster and better informed.",
  },
  {
    name: "Intelligent Automation",
    description:
      "Replacing manual, repetitive workflows with automation that understands context, not just triggers.",
    detail:
      "Most automation breaks the moment a real-world exception appears. Ours is built to understand context, so it handles the exception instead of stalling and waiting for a human to notice.",
  },
  {
    name: "Custom Software",
    description:
      "Internal tools and customer-facing applications built around your process, not a template you bend to fit.",
    detail:
      "When off-the-shelf software forces your team to work around it, the cost shows up every day in workarounds and lost time. We build software shaped to your process instead of the other way around.",
  },
  {
    name: "Internal Dashboards",
    description:
      "A single, accurate view of the metrics your team already tries to track across five different tools.",
    detail:
      "We consolidate the numbers scattered across spreadsheets, inboxes, and disconnected platforms into one dashboard your team actually opens every morning, and trusts.",
  },
  {
    name: "Business Intelligence",
    description:
      "Real reporting infrastructure that turns your operational data into decisions, not static spreadsheets.",
    detail:
      "Static exports go stale the day they're generated. We build reporting infrastructure that stays live, so the numbers your leadership sees are the numbers that are actually true right now.",
  },
  {
    name: "AI Assistants",
    description:
      "Assistants trained on your business's own knowledge, handling the specific questions your team and customers actually ask.",
    detail:
      "Generic chatbots answer generic questions. We build assistants grounded in your documentation, policies, and history, so the answers are specific to your business, not the internet's average guess.",
  },
  {
    name: "CRM & ERP Integrations",
    description:
      "Connecting the systems you already run so information moves once, correctly, instead of being re-entered five times.",
    detail:
      "Every manual re-entry point is a place data quietly diverges. We integrate your CRM, ERP, and operational tools so a single update is the only update anyone has to make.",
  },
  {
    name: "Client Portals",
    description: "A dedicated space where your clients see status, documents, and progress without a single email thread.",
    detail:
      "We build portals that replace the back-and-forth of status-update emails with a single source of truth your clients can check whenever they want an answer.",
  },
  {
    name: "Analytics Platforms",
    description: "Infrastructure that tracks the metrics that actually predict your business's outcomes, built to scale with it.",
    detail:
      "We start by identifying the handful of metrics that actually predict your outcomes, then build the platform that tracks them accurately as your data volume grows.",
  },
  {
    name: "Workflow Optimization",
    description: "Re-engineering how work actually moves through your business, then automating what should never have been manual.",
    detail:
      "Before automating anything, we re-engineer the sequence itself. Automating a broken workflow just makes the breakage faster; we fix the path first.",
  },
  {
    name: "Enterprise Websites",
    description: "A digital presence engineered with the same rigor as the systems behind it, not a template.",
    detail:
      "Your website is the first system a prospect experiences. We engineer it with the same precision as your internal tools, fast, accessible, and built to convert attention into a conversation.",
  },
  {
    name: "Digital Transformation",
    description: "The coordinated shift from manual, fragmented operations to a connected, intelligent business, planned as one system.",
    detail:
      "Transformation fails when it's a collection of disconnected projects. We plan and sequence every system change as one coordinated roadmap, so each piece strengthens the next.",
  },
];

export type SystemCapability = {
  name: string;
  description: string;
};

export type SystemCluster = {
  cluster: string;
  summary: string;
  capabilities: SystemCapability[];
};

export const SYSTEM_CLUSTERS: SystemCluster[] = [
  {
    cluster: "Foundation",
    summary: "What every system stands on before intelligence enters the picture.",
    capabilities: [
      {
        name: "Business Process Engineering",
        description: "Mapping and re-engineering how work actually flows before any system is designed around it.",
      },
      {
        name: "Software Architecture",
        description: "The underlying structure your system is built on, engineered to be extended for a decade, not patched for a quarter.",
      },
      {
        name: "Cloud Systems",
        description: "Infrastructure sized to your business today and built to scale without a rebuild.",
      },
    ],
  },
  {
    cluster: "Intelligence",
    summary: "Where applied AI is engineered into the decisions your business makes daily.",
    capabilities: [
      {
        name: "Intelligent Workflow Design",
        description: "Workflows engineered to make the right decision automatically, not just move information faster.",
      },
      {
        name: "AI Infrastructure",
        description: "The models, data pipelines, and inference systems that let AI operate reliably inside a live business.",
      },
      {
        name: "AI Decision Support",
        description: "Systems that surface the right decision at the right moment to the right person, with the reasoning behind it.",
      },
    ],
  },
  {
    cluster: "Delivery",
    summary: "How dozens of small systems act, in practice, as one coherent platform.",
    capabilities: [
      {
        name: "Automation Architecture",
        description: "The orchestration layer that lets dozens of small automations behave as one coherent system.",
      },
      {
        name: "Data Pipelines",
        description: "The plumbing that moves your data cleanly from where it's created to where it's needed, in real time.",
      },
      {
        name: "Reporting Systems",
        description: "Structured reporting built once, trusted permanently, not a dashboard someone has to explain every meeting.",
      },
      {
        name: "Custom Integrations",
        description: "Connecting the tools your business already depends on so they behave like one platform.",
      },
    ],
  },
  {
    cluster: "Assurance",
    summary: "What keeps a system trustworthy long after the launch date.",
    capabilities: [
      {
        name: "Security & Reliability",
        description: "Systems engineered to fail safely, recover fast, and protect the data your business is trusted with.",
      },
      {
        name: "Scalability & Long-Term Optimization",
        description: "Architecture that absorbs real growth without a rebuild, monitored and tuned long after launch.",
      },
    ],
  },
];

export const INDUSTRIES = [
  {
    name: "Professional Services",
    note: "Client work, billing, and knowledge scattered across inboxes and one-off spreadsheets.",
  },
  {
    name: "Healthcare & Wellness",
    note: "Scheduling, intake, and records that need to move fast without compromising trust.",
  },
  {
    name: "Retail & E-Commerce",
    note: "Inventory, fulfillment, and customer data that fall out of sync the moment you scale.",
  },
  {
    name: "Manufacturing & Logistics",
    note: "Operations where a single delay upstream costs real money downstream.",
  },
  {
    name: "Real Estate",
    note: "Listings, leads, and transactions moving across too many disconnected platforms.",
  },
  {
    name: "Financial Services",
    note: "Precision and compliance requirements that generic automation wasn't built to respect.",
  },
  {
    name: "Hospitality",
    note: "Guest experience that has to feel personal while the operations behind it scale.",
  },
  {
    name: "Construction & Trades",
    note: "Bids, crews, and materials tracked by memory and paper when the margins can't afford it.",
  },
];

export const TECH_ECOSYSTEM = [
  { name: "Cloud Infrastructure", description: "Resilient, scalable environments your systems run on." },
  { name: "Applied AI & LLMs", description: "Models grounded in your business's own data and language." },
  { name: "Workflow Automation", description: "Orchestration that connects decisions to action." },
  { name: "Data Engineering", description: "Pipelines that keep information accurate as it moves." },
  { name: "Custom Software", description: "Applications shaped to your process, not the reverse." },
  { name: "Enterprise Integration", description: "Every platform you run, working as one system." },
  { name: "Security & Compliance", description: "Trust engineered in from the first architecture decision." },
];

export type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

// Placeholder social proof for the pre-launch site. Swap in real client
// quotes (with permission) once the first engagements close.
export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "They spent the first three weeks asking questions before writing a line of code. The system they built understood our business better than the last two vendors combined.",
    name: "Managing Partner",
    role: "Professional Services Firm",
  },
  {
    quote:
      "We'd tried a generic AI tool before. It never stuck. What Lumora built was engineered around how we actually work, so our team adopted it without being told to.",
    name: "Operations Director",
    role: "Regional Healthcare Group",
  },
  {
    quote:
      "The dashboard replaced four spreadsheets and a Friday afternoon of manual reconciliation. It sounds small until you get the Friday afternoon back every week.",
    name: "Founder",
    role: "Multi-Location Retail Group",
  },
];

export const VALUES = [
  {
    name: "Precision over hype",
    description: "We describe exactly what a system does and what it doesn't. No exaggerated claims about intelligence.",
  },
  {
    name: "Partnership over transactions",
    description: "We work alongside your team through delivery and beyond, not as a vendor that disappears at handoff.",
  },
  {
    name: "Engineering over installation",
    description: "Every system is built into your business, not switched on top of it.",
  },
  {
    name: "Outcomes over output",
    description: "We measure success in hours saved and decisions improved, not features shipped.",
  },
  {
    name: "Long-term over launch day",
    description: "A system's real test is whether it still fits three years after launch. We build for that test.",
  },
];

export const ROADMAP = [
  {
    name: "Deeper vertical specialization",
    description: "Dedicated engineering playbooks for the industries where operational complexity runs highest.",
  },
  {
    name: "Standing systems-health monitoring",
    description: "An ongoing monitoring layer for every client system, so drift is caught before it becomes a problem.",
  },
  {
    name: "A larger embedded engineering team",
    description: "More engineers working inside client operations, not just alongside them from a distance.",
  },
];

export const FAQS = [
  {
    question: "Do you build custom software, or use existing platforms?",
    answer:
      "Both, whichever actually serves the outcome. We build custom where it matters and integrate proven platforms where custom would be wasted effort.",
  },
  {
    question: "How long does a typical engagement take?",
    answer:
      "It varies by scope. Most engagements move from Discover to a working first system in six to twelve weeks, with Optimize continuing after launch.",
  },
  {
    question: "We've tried AI tools before and they didn't stick.",
    answer:
      "That's usually because a generic tool was installed on top of an existing process instead of a system engineered around it. That's the problem Lumora exists to solve.",
  },
  {
    question: "What size businesses do you work with?",
    answer:
      "From founder-led operations to multi-location enterprises. The method stays the same; the scope changes.",
  },
  {
    question: "What happens after the system is built?",
    answer: "Optimize is ongoing. We monitor performance and refine the system as your business changes.",
  },
  {
    question: "Is our data secure?",
    answer: "Security and reliability are engineered into every system from the first architecture decision, not added afterward.",
  },
];
