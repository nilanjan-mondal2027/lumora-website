# Lumora Website

Open-source Next.js website for Lumora, an AI business engineering studio. It pairs editorial brand pages with a cinematic homepage, responsive motion, SEO metadata, and a production-ready contact form API.

Live site: https://lumora-website-peach.vercel.app

## What Is Inside

- Home, Solutions, Systems, About, and Contact routes using the Next.js App Router.
- Cinematic desktop homepage with Three.js, GSAP ScrollTrigger, Lenis, and mobile/reduced-motion fallbacks.
- Contact form API with validation, honeypot spam handling, in-memory rate limiting, Resend delivery, and webhook fallback.
- SEO basics: route metadata, Open Graph image route, sitemap, robots, manifest, JSON-LD, `llms.txt`, and `llms-full.txt`.
- Brand SVG assets and a small quality script for env/privacy regressions.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Three.js / React Three Fiber
- GSAP / ScrollTrigger
- Framer Motion
- Lenis

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy the example file and fill only the values you need:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
| --- | --- |
| `CONTACT_TO` | Comma-separated recipient email list for contact submissions. |
| `CONTACT_FROM` | Verified sender address for Resend. |
| `RESEND_API_KEY` | Sends contact form emails through Resend. |
| `CONTACT_WEBHOOK` | Optional webhook fallback when Resend is not used. |
| `LUMORA_CONTACT_PHONE` | Optional WhatsApp/call number in E.164 format without `+`. If omitted, the talk channel is hidden. |

Never commit `.env*`, `.vercel`, build output, or API keys.

## Scripts

```bash
npm run dev
npm run lint
npm test
npm run build
npm run start
```

`npm test` runs a lightweight source-level quality check. `npm run build` is the real production check.

## Deployment

Vercel is the easiest target because the project uses Next.js App Router APIs, metadata routes, and server-side environment variables.

Build settings:

```txt
Install command: npm install
Build command: npm run build
Output directory: .next
```

Set production environment variables in Vercel before expecting contact form delivery.

## Repository Hygiene

This public snapshot intentionally excludes local secrets, `.vercel` metadata, screenshots, deployment logs, internal build notes, and generated dependency/build folders.

## License

MIT
