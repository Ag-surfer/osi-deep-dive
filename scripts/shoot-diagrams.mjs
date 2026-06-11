// Dev-only: clip-screenshot specific LayerDiagrams (by aria-label substring) in light + dark.
// Usage: node scripts/shoot-diagrams.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.SHOOT_BASE ?? "http://localhost:3000";
const OUT = "/tmp/osi-diagrams";
mkdirSync(OUT, { recursive: true });

// [path, aria-label substring, output name]
const TARGETS = [
  ["/layers/data-link/", "A 48-bit MAC", "datalink-mac"],
  ["/layers/data-link/", "A and C are each in range", "datalink-hidden-terminal"],
  ["/layers/network/", "Splitting a /24 into four", "network-subnetting"],
  ["/layers/network/", "NAT rewrites each outbound", "network-nat"],
  ["/layers/transport/", "Two separate limits", "transport-flow-congestion"],
  ["/layers/transport/", "congestion window over time", "transport-congestion"],
];

const browser = await chromium.launch();

async function shoot(path, label, name, dark) {
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    colorScheme: dark ? "dark" : "light",
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500); // let rough.js hydrate
  // figure that contains the svg whose aria-label matches
  const fig = page.locator("figure", { has: page.locator(`svg[aria-label*="${label}"]`) }).first();
  await fig.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  const file = `${OUT}/${name}-${dark ? "dark" : "light"}.png`;
  await fig.screenshot({ path: file });
  await ctx.close();
  console.log(`shot: ${name}-${dark ? "dark" : "light"}.png`);
}

for (const [path, label, name] of TARGETS) {
  for (const dark of [false, true]) {
    await shoot(path, label, name, dark);
  }
}

await browser.close();
console.log(`done → ${OUT}`);
