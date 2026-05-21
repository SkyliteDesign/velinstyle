#!/usr/bin/env node
/**
 * Sync showcase HTML from velinstyle-site into velinstyle-demos (unpkg CDN, fork-friendly).
 * Usage: node tools/sync-demos-to-repo.mjs [--out ../velinstyle-demos]
 */
import { cp, mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FRAMEWORK_ROOT = path.resolve(__dirname, '..');
const SITE_ROOT = path.resolve(FRAMEWORK_ROOT, '../velinstyle-site');
const DEFAULT_OUT = path.resolve(FRAMEWORK_ROOT, '../velinstyle-demos');
const VERSION = '0.9.0';
const UNPKG = `https://unpkg.com/@birdapi/velinstyle@${VERSION}`;

const outArg = process.argv.find((a, i) => process.argv[i - 1] === '--out');
const OUT = path.resolve(outArg || DEFAULT_OUT);

function patchHtml(html, { isRootIndex }) {
  let s = html;
  s = s.replaceAll('../dist/velinstyle.min.css', `${UNPKG}/dist/velinstyle.min.css`);
  s = s.replaceAll('../dist/velinstyle.css', `${UNPKG}/dist/velinstyle.min.css`);
  s = s.replaceAll('../dist/velinstyle-components.iife.js', `${UNPKG}/dist/velinstyle-components.iife.js`);
  s = s.replaceAll('../dist/velinstyle-components.min.js', `${UNPKG}/dist/velinstyle-components.min.js`);
  s = s.replaceAll('../dist/velinstyle-components.js', `${UNPKG}/dist/velinstyle-components.min.js`);
  s = s.replaceAll('../dist/themes/', `${UNPKG}/dist/themes/`);
  s = s.replaceAll('href="../index.html"', 'href="https://velinstyle.info/"');
  s = s.replaceAll("href='../index.html'", "href='https://velinstyle.info/'");
  if (isRootIndex) {
    s = s.replaceAll('href="showcase-', 'href="demos/showcase-');
    s = s.replaceAll('../dist/', `${UNPKG}/dist/`);
  }
  const forkBanner = `<!-- Synced from velinstyle-site — fork: https://github.com/SkyliteDesign/velinstyle-demos -->\n`;
  if (!s.includes('velinstyle-demos')) {
    s = s.replace('<head>', `<head>\n${forkBanner}`);
  }
  return s;
}

async function main() {
  const siteDemos = path.join(SITE_ROOT, 'demos');
  const outDemos = path.join(OUT, 'demos');
  const outAssets = path.join(OUT, 'assets');

  await mkdir(outDemos, { recursive: true });
  await mkdir(outAssets, { recursive: true });

  const files = (await readdir(siteDemos)).filter((f) => f.endsWith('.html'));
  for (const file of files) {
    const raw = await readFile(path.join(siteDemos, file), 'utf8');
    if (file === 'index.html') {
      const patched = patchHtml(raw, { isRootIndex: true });
      await writeFile(path.join(OUT, 'index.html'), patched, 'utf8');
      console.log('Wrote', path.join(OUT, 'index.html'));
      continue;
    }
    const patched = patchHtml(raw, { isRootIndex: false });
    await writeFile(path.join(outDemos, file), patched, 'utf8');
    console.log('Wrote', path.join(outDemos, file));
  }

  const siteAssets = path.join(SITE_ROOT, 'assets', 'img');
  await cp(siteAssets, path.join(outAssets, 'img'), { recursive: true, force: true }).catch(() => {});

  for (const shared of ['demos-shared.css', 'demos-shared.js']) {
    const src = path.join(siteDemos, shared);
    await cp(src, path.join(outDemos, shared), { force: true });
    console.log('Wrote', path.join(outDemos, shared));
  }

  console.log(`Synced ${files.length} HTML file(s) -> ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
