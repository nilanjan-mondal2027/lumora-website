# Verification harness

Tooling for the phase checkpoints defined in `CLAUDE.md` → *Definition of done* and
`docs/story-spec.md` §5. None of this is a project dependency — run on demand.

## 1. Scroll-progress screenshots — `screenshot.mjs`

Captures the homepage at the eight story checkpoints (`0 .15 .30 .45 .62 .78 .92 1.0`)
at 1440w and 390w into `/screenshots`.

```bash
npx --yes playwright@latest install chromium   # one-time
npm run dev                                     # terminal A
node scripts/screenshot.mjs                     # terminal B
```

Options (env vars): `LUMORA_URL`, `LUMORA_OUT`, `LUMORA_WIDTHS`, `LUMORA_WAIT`, `LUMORA_RM=1`
(emulate `prefers-reduced-motion: reduce` — use this to prove the static fallback composition).

If Playwright can't be resolved the script prints a manual capture protocol and exits 0.

> Progress is approximated as a fraction of scrollable height until the pinned
> `ScrollStage` (P2.1) lands. Have `ScrollStage` publish `window.__lumoraProgress`
> (0→1) in its `onUpdate` and the harness records true engine progress automatically.

## 2. Throttled Lighthouse pass (mid-range Android, the CLAUDE.md perf gate)

Budget: **LCP < 2.5s, CLS < 0.05, Perf ≥ 85 mobile / ≥ 95 desktop, SEO ≥ 95, A11y ≥ 95.**

```bash
npm run build && npm run start        # ALWAYS profile a production build, never dev

# Mobile profile — Moto-G-class: 4× CPU throttle + Fast-3G, mobile form factor
npx --yes lighthouse@latest http://localhost:3000 \
  --preset=perf \
  --form-factor=mobile \
  --throttling-method=simulate \
  --throttling.cpuSlowdownMultiplier=4 \
  --only-categories=performance,seo,accessibility,best-practices \
  --output=json --output=html \
  --output-path=./screenshots/lh-home-mobile

# Desktop profile
npx --yes lighthouse@latest http://localhost:3000 \
  --preset=desktop \
  --only-categories=performance,seo,accessibility,best-practices \
  --output=json --output=html \
  --output-path=./screenshots/lh-home-desktop
```

Run against every route (`/`, `/solutions`, `/systems`, `/about`, `/contact`) at the
P4.2 gate. Record the numbers in `docs/BUILD-LOG.md`.

The DevTools **4× CPU / Fast 3G** manual profile is the interactive equivalent when
you need to feel the jank rather than score it.
