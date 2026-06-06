// Dev-only visual verification: screenshot key pages in light + dark.
// Not part of the shipped site. Usage: node scripts/shoot.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.SHOOT_BASE ?? "http://localhost:3000";
const OUT = "/tmp/osi-shots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function shoot(path, name, { dark = false, width = 1280, height = 900 } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    colorScheme: dark ? "dark" : "light",
  });
  const page = await ctx.newPage();
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  await ctx.close();
  console.log(`shot: ${name}.png  (${path})`);
}

await shoot("/", "home-light", { dark: false });
await shoot("/", "home-dark", { dark: true });
await shoot("/layers/network/", "network-light", { dark: false });
await shoot("/layers/network/", "network-dark", { dark: true });

await browser.close();
console.log(`done → ${OUT}`);
