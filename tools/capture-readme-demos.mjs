#!/usr/bin/env node
/**
 * Capture README demo screenshots from velinstyle.info (or local site).
 * Usage: node tools/capture-readme-demos.mjs
 * Env: CAPTURE_BASE=https://velinstyle.info  CAPTURE_OUT=.github/assets/readme
 */
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(ROOT, process.env.CAPTURE_OUT || '.github/assets/readme');
const BASE = (process.env.CAPTURE_BASE || 'https://velinstyle.info').replace(/\/$/, '');

const DEMOS = [
  { id: 'crypto', path: '/demos/showcase-crypto.html' },
  { id: 'ecommerce', path: '/demos/showcase-ecommerce.html' },
  { id: 'saas', path: '/demos/showcase-saas.html' },
  { id: 'dashboard', path: '/demos/showcase-dashboard.html' },
  { id: 'interactive', path: '/demos/showcase-interactive.html' },
  { id: 'forum', path: '/demos/showcase-forum.html' },
];

async function main() {
  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error('Install playwright: npm install -D playwright && npx playwright install chromium');
    process.exit(1);
  }

  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  for (const demo of DEMOS) {
    const url = `${BASE}${demo.path}`;
    console.log('Capture', url);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await page.waitForTimeout(800);
    const pngPath = path.join(OUT, `demo-${demo.id}.png`);
    await page.screenshot({ path: pngPath, fullPage: false });
    console.log('  ->', pngPath);
  }

  const heroUrl = `${BASE}/demos/showcase-crypto.html`;
  await page.goto(heroUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.waitForTimeout(500);
  const heroPng = path.join(OUT, 'hero-demo.png');
  await page.screenshot({ path: heroPng });
  await copyFile(heroPng, path.join(OUT, 'hero-demo.webp')).catch(() => {});

  await browser.close();
  console.log('Done. Convert PNG→WebP with: npm run readme:assets:webp (optional)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
