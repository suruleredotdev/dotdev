// Visual check for public/ui/v1.
//
//   node scripts/ui-visual-check.mjs [outDir]
//
// Serves public/ on a local port, opens ui/v1/demo.html at phone (390px) and
// desktop (1280px) widths in light and dark, and for each:
//   - fails if the page scrolls sideways (the usual phone-width breakage)
//   - fails if the forced-dark tokens drift from the OS-dark tokens
//   - fails if the top bar or a sheet loses its shape
//   - writes a full-page screenshot, plus one with the sheet open
// Needs Playwright with Chromium (`npx playwright install chromium` in CI).
// Screenshots are for a human to look at or diff; the script itself only
// asserts layout facts, so it doesn't flake on font rendering. (Chromium's
// full-page capture paints fixed layers once, at the top, so the footer
// window looks blank in those images; it's fine in a real scroll.)

import { createServer } from "node:http";
import { readFile, mkdir } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

// require() rather than import so a globally installed Playwright resolves too.
const { chromium } = createRequire(import.meta.url)("playwright");

const root = fileURLToPath(new URL("../public/", import.meta.url));
const outDir = process.argv[2] || "ui-screens";
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon" };

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
  try {
    const body = await readFile(join(root, path));
    res.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
}).listen(0);
const base = `http://localhost:${server.address().port}/ui/v1/demo.html`;

const TOKENS = ["--su-ground", "--su-ink", "--su-text", "--su-muted", "--su-line",
  "--su-line-strong", "--su-accent", "--su-pattern"];
const widths = [{ name: "phone", width: 390, height: 844 }, { name: "desktop", width: 1280, height: 900 }];
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();

for (const scheme of ["light", "dark"]) {
  for (const vp of widths) {
    const label = `${vp.name}-${scheme}`;
    const page = await browser.newPage({ viewport: vp, colorScheme: scheme });
    page.on("pageerror", (e) => failures.push(`${label}: page error ${e.message}`));
    await page.goto(`${base}?frame`, { waitUntil: "networkidle" });
    // Park the pointer off the top bar so the logo isn't caught mid-hover.
    await page.mouse.move(vp.width / 2, vp.height - 2);

    const m = await page.evaluate((tokens) => {
      const doc = document.documentElement;
      const bar = document.querySelector(".su-topbar").getBoundingClientRect();
      const seg = document.querySelector(".su-seg").getBoundingClientRect();
      const css = getComputedStyle(doc);
      return {
        overflow: doc.scrollWidth - doc.clientWidth,
        barTop: bar.top, barHeight: bar.height, segRight: seg.right, segTop: seg.top, vw: doc.clientWidth,
        tokens: Object.fromEntries(tokens.map((t) => [t, css.getPropertyValue(t).trim()])),
      };
    }, TOKENS);

    check(m.overflow <= 0, `${label}: page scrolls sideways by ${m.overflow}px`);
    check(Math.abs(m.segRight - m.vw) < 1, `${label}: segmented bar doesn't hug the right edge`);
    if (vp.name === "desktop") check(m.barHeight <= 41, `${label}: top bar is ${m.barHeight}px, want one 40px row`);
    else check(m.segTop >= 40, `${label}: segmented bar should drop to its own row on phone`);

    // Forced theme must match the OS theme exactly.
    const forced = await browser.newPage({ viewport: vp, colorScheme: scheme === "dark" ? "light" : "dark" });
    await forced.goto(`${base}?frame&theme=${scheme}`, { waitUntil: "domcontentloaded" });
    const forcedTokens = await forced.evaluate((tokens) => {
      const css = getComputedStyle(document.documentElement);
      return Object.fromEntries(tokens.map((t) => [t, css.getPropertyValue(t).trim()]));
    }, TOKENS);
    await forced.close();
    for (const t of TOKENS) {
      check(forcedTokens[t] === m.tokens[t], `${label}: ${t} is ${m.tokens[t]} from the OS but ${forcedTokens[t]} when forced`);
    }

    await page.screenshot({ path: join(outDir, `${label}.png`), fullPage: true });

    await page.click('[data-su-open="about"]');
    const sheet = await page.evaluate(async () => {
      const d = document.getElementById("about");
      await Promise.all(d.getAnimations().map((a) => a.finished));
      const r = d.getBoundingClientRect();
      return { open: d.open, bottom: r.bottom, left: r.left, width: r.width, vh: innerHeight, vw: innerWidth };
    });
    check(sheet.open, `${label}: sheet did not open`);
    if (vp.name === "phone") {
      check(Math.abs(sheet.bottom - sheet.vh) < 1 && sheet.left === 0, `${label}: sheet should dock to the bottom edge`);
    } else {
      check(sheet.width <= 720 && sheet.bottom < sheet.vh, `${label}: sheet should be a centred modal`);
    }
    await page.screenshot({ path: join(outDir, `${label}-sheet.png`) });
    await page.keyboard.press("Escape");
    check(!(await page.evaluate(() => document.getElementById("about").open)), `${label}: Escape did not close the sheet`);
    await page.close();
  }
}

await browser.close();
server.close();

if (failures.length) {
  console.error(failures.map((f) => `✗ ${f}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ui/v1 demo: ${widths.length * 2} viewports, no overflow, themes in step. Screenshots in ${outDir}/`);
