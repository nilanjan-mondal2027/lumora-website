#!/usr/bin/env node
// @ts-check
/**
 * Lumora homepage scroll-progress screenshot harness.
 *
 * Captures the homepage at the eight story checkpoints defined in
 * docs/story-spec.md §5 (the chapter-range boundaries) at both the desktop
 * (1440w) and mobile (390w) breakpoints, writing PNGs into /screenshots.
 *
 * PROGRESS POINTS: 0, .15, .30, .45, .62, .78, .92, 1.0
 *   These map to Hero / Philosophy / Why-Generic / Method(mid) / Build /
 *   Optimize / Finale-approach / Finale per the story spec.
 *
 * ── How "progress" is resolved ──────────────────────────────────────────────
 * The pinned ScrollStage (P2.1) does not exist yet. Until it does, this script
 * approximates progress as a fraction of the document's total scrollable
 * height. Once ScrollStage lands and writes the global story progress to
 *   window.__lumoraProgress  (0→1)
 * this harness will PREFER that value: it scrolls, then reads the global back
 * and records the true progress in the filename + console. Wire that global in
 * ScrollStage's onUpdate and this harness becomes exact with no changes here.
 *
 * ── Requirements ────────────────────────────────────────────────────────────
 * Playwright is intentionally NOT a project dependency (per CLAUDE.md: never
 * add deps as a side effect). Run it on demand without committing it:
 *
 *     npx --yes playwright@latest install chromium   # one-time browser fetch
 *     npm run dev                                     # in another terminal
 *     node scripts/screenshot.mjs                     # this harness
 *
 * If Playwright cannot be resolved, the script prints a manual capture
 * protocol and exits 0 (so it never breaks CI).
 *
 * ── Options (env vars) ──────────────────────────────────────────────────────
 *   LUMORA_URL      base url            (default http://localhost:3000)
 *   LUMORA_OUT      output dir          (default ./screenshots)
 *   LUMORA_WIDTHS   csv of widths       (default 1440,390)
 *   LUMORA_WAIT     ms settle per shot  (default 900)
 *   LUMORA_RM       "1" => emulate prefers-reduced-motion: reduce
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const URL = process.env.LUMORA_URL ?? "http://localhost:3000";
const OUT = process.env.LUMORA_OUT ?? path.resolve(process.cwd(), "screenshots");
const WIDTHS = (process.env.LUMORA_WIDTHS ?? "1440,390")
  .split(",")
  .map((w) => parseInt(w.trim(), 10))
  .filter((w) => Number.isFinite(w) && w > 0);
const SETTLE_MS = parseInt(process.env.LUMORA_WAIT ?? "900", 10);
const REDUCED_MOTION = process.env.LUMORA_RM === "1";

// Default = the eight story checkpoints; override with LUMORA_POINTS (csv) to
// capture a specific stretch (e.g. the finale: LUMORA_POINTS=0.85,0.9,0.96,1.0).
const PROGRESS_POINTS = process.env.LUMORA_POINTS
  ? process.env.LUMORA_POINTS.split(",")
      .map((s) => parseFloat(s.trim()))
      .filter((n) => Number.isFinite(n))
  : [0, 0.15, 0.3, 0.45, 0.62, 0.78, 0.92, 1.0];
const HEIGHT_FOR = (w) => (w >= 1024 ? 900 : 844); // desktop vs phone viewport

const MODE = process.env.LUMORA_MODE ?? "";

// Chapter-visibility regression suite (guards the P4.3 hero-reveal regression):
// captures the pinned stage AFTER ignition at the five chapter checkpoints and
// fails (non-zero exit) if any chapter's copy is missing, measured as bright-pixel
// density in the mid-region of the frame (dark-empty vs text-dense).
// The five acceptance checkpoints PLUS progress 0 — the Hero, which is where the
// P4.3 regression actually lived (its ignition-reveal never fired). Guarding only
// 0.15–0.95 would miss it: those chapters rendered even with the bug.
const CHAPTER_POINTS = [0, 0.15, 0.35, 0.55, 0.85, 0.95];
const CHAPTER_LABELS = {
  0: "Hero (regression locus)",
  0.15: "Philosophy",
  0.35: "Method/early",
  0.55: "Method/Build",
  0.85: "Proof",
  0.95: "Finale",
};
const BRIGHT_FLOOR = parseInt(process.env.LUMORA_BRIGHT_FLOOR ?? "1000", 10);

const MANUAL_PROTOCOL = `
────────────────────────────────────────────────────────────────────────────
  Playwright is not available. Manual capture protocol
────────────────────────────────────────────────────────────────────────────
  1. Run the dev server:                npm run dev
  2. For each width in [${WIDTHS.join(", ")}]:
       • Open ${URL} and set the browser/device viewport to that width.
       • Open DevTools console and scroll to each checkpoint with:
             const d = document.documentElement;
             const p = ${JSON.stringify(PROGRESS_POINTS)};   // pick one
             window.scrollTo(0, p * (d.scrollHeight - window.innerHeight));
         (Once ScrollStage exists, read window.__lumoraProgress to confirm.)
       • Capture a VIEWPORT screenshot (Cmd/Ctrl+Shift+P → "Capture screenshot").
       • Save as  screenshots/home-<width>w-p<progress>.png
  3. The eight progress points are: ${PROGRESS_POINTS.join(", ")}.
────────────────────────────────────────────────────────────────────────────
`;

async function loadPlaywright() {
  try {
    return await import("playwright");
  } catch {
    try {
      // Fall back to a globally/npx-cached install.
      return await import("playwright-core");
    } catch {
      return null;
    }
  }
}

async function run() {
  const pw = await loadPlaywright();
  if (!pw) {
    console.log(MANUAL_PROTOCOL);
    return;
  }
  const { chromium } = pw;

  await mkdir(OUT, { recursive: true });
  console.log(`▸ Lumora screenshot harness`);
  console.log(`  url     ${URL}`);
  console.log(`  out     ${OUT}`);
  console.log(`  widths  ${WIDTHS.join(", ")}`);
  console.log(`  reduced-motion: ${REDUCED_MOTION ? "on" : "off"}\n`);

  // SwiftShader flags: Chrome ≥ ~135 headless blocks software WebGL by default,
  // which stalls the R3F canvas. These enable it so the story canvas renders.
  const browser = await chromium.launch({
    args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  try {
    for (const width of WIDTHS) {
      const context = await browser.newContext({
        viewport: { width, height: HEIGHT_FOR(width) },
        deviceScaleFactor: 2,
        reducedMotion: REDUCED_MOTION ? "reduce" : "no-preference",
        isMobile: width < 768,
        hasTouch: width < 768,
      });
      const page = await context.newPage();
      // Capture via a raw CDP session: Playwright's page.screenshot() wrapper
      // waits for a stable compositor surface that a continuously-rendering WebGL
      // canvas never provides (it hangs). Page.captureScreenshot returns promptly.
      const cdp = await context.newCDPSession(page);

      const response = await page.goto(URL, { waitUntil: "networkidle", timeout: 45_000 }).catch(() => null);
      if (!response) {
        console.error(`  ✗ could not reach ${URL} — is \`npm run dev\` running?`);
        await context.close();
        continue;
      }
      // Let fonts, the ignition sequence, and lazy R3F mount settle.
      await page.waitForTimeout(1600);

      for (const target of PROGRESS_POINTS) {
        const actual = await page.evaluate(async (t) => {
          const w = /** @type {any} */ (window);
          if (typeof w.__seek === "function") {
            // Exact: drive the pinned engine to progress t (dev-only hook). No
            // scroll-fraction approximation, and it works while the tab paints.
            w.__seek(t);
          } else {
            const doc = document.documentElement;
            const max = Math.max(1, doc.scrollHeight - window.innerHeight);
            window.scrollTo({ top: t * max, behavior: "instant" });
          }
          await new Promise((r) => setTimeout(r, 80));
          const g = w.__lumoraProgress;
          return typeof g === "number" ? g : t;
        }, target);

        await page.waitForTimeout(SETTLE_MS);
        const tag = String(Math.round(target * 100)).padStart(3, "0");
        const file = path.join(OUT, `home-${width}w-p${tag}.png`);
        const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
        await writeFile(file, Buffer.from(data, "base64"));
        const note = Math.abs(actual - target) > 0.02 ? ` (engine progress ${actual.toFixed(2)})` : "";
        console.log(`  ✓ ${path.basename(file)}${note}`);
      }
      await context.close();
    }
  } finally {
    await browser.close();
  }
  console.log(`\n▸ done — ${WIDTHS.length * PROGRESS_POINTS.length} shots in ${OUT}`);
}

// Drive the pinned engine to `target`: exact via the dev-only __seek hook, else
// converge by wheel-scrolling (works on a prod build) and read back the engine.
async function seekProgress(page, target) {
  const hasSeek = await page.evaluate(() => typeof (/** @type {any} */ (window)).__seek === "function");
  if (hasSeek) {
    await page.evaluate((t) => (/** @type {any} */ (window)).__seek(t), target);
    await page.waitForTimeout(120);
  } else {
    await page.mouse.move(720, 450);
    for (let i = 0; i < 60; i++) {
      const p = await page.evaluate(() => (/** @type {any} */ (window)).__lumoraProgress ?? 0);
      if (Math.abs(p - target) < 0.015) break;
      await page.mouse.wheel(0, Math.max(-1000, Math.min(1000, (target - p) * 6300 * 0.55)));
      await page.waitForTimeout(70);
    }
    await page.waitForTimeout(300);
  }
  return page.evaluate(() => (/** @type {any} */ (window)).__lumoraProgress ?? 0);
}

// Count bright (text/glyph) pixels in the frame's mid-region — the copy band.
async function brightMidRegion(page, b64) {
  return page.evaluate(async (data) => {
    const img = new Image();
    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      img.src = "data:image/png;base64," + data;
    });
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    const y0 = Math.floor(c.height * 0.26);
    const y1 = Math.floor(c.height * 0.74);
    const px = g.getImageData(0, y0, c.width, y1 - y0).data;
    let bright = 0;
    for (let i = 0; i < px.length; i += 4) {
      const lum = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
      if (lum > 140) bright++;
    }
    return bright;
  }, b64);
}

async function runChapters() {
  const pw = await loadPlaywright();
  if (!pw) {
    console.log(MANUAL_PROTOCOL);
    process.exit(0);
  }
  const { chromium } = pw;
  const out = path.join(OUT, "chapters");
  await mkdir(out, { recursive: true });
  console.log("▸ Chapter-visibility regression (post-ignition, 1440w)");
  const browser = await chromium.launch({ args: ["--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
  let failures = 0;
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(4200); // let the 3s ignition finish + the hero reveal
    const cdp = await context.newCDPSession(page);
    for (const t of CHAPTER_POINTS) {
      const actual = await seekProgress(page, t);
      await page.waitForTimeout(SETTLE_MS);
      const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
      const tag = String(Math.round(t * 100)).padStart(3, "0");
      await writeFile(path.join(out, `chap-p${tag}.png`), Buffer.from(data, "base64"));
      const bright = await brightMidRegion(page, data);
      const ok = bright >= BRIGHT_FLOOR;
      if (!ok) failures++;
      console.log(
        `  ${ok ? "✓" : "✗"} p${tag} ${CHAPTER_LABELS[t] ?? ""} — prog ${actual.toFixed(3)}, mid-region bright ${bright} (floor ${BRIGHT_FLOOR})`,
      );
    }
    await context.close();
  } finally {
    await browser.close();
  }
  if (failures) {
    console.error(`\n✗ chapters FAILED: ${failures}/${CHAPTER_POINTS.length} chapter(s) show no legible copy.`);
    process.exit(1);
  }
  console.log(`\n▸ chapters OK — all ${CHAPTER_POINTS.length} chapters legible in ${out}`);
}

if (MODE === "chapters") {
  runChapters().catch((err) => {
    console.error("chapter regression harness error:", err);
    process.exit(1);
  });
} else {
  run().catch((err) => {
    console.error("screenshot harness failed:", err);
    console.log(MANUAL_PROTOCOL);
    process.exit(0); // never break a pipeline on a screenshot step
  });
}
