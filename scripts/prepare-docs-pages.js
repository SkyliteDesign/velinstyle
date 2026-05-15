#!/usr/bin/env node
/**
 * Rewrites docs HTML asset paths for GitHub Pages (docs/ is site root, dist/ lives in docs/dist/).
 * Run after: npm run build && cp -r dist docs/dist (CI does both).
 */
import { cpSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const DOCS = 'docs';

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function patchContent(relFromDocs, content) {
  const depth = relFromDocs.split(/[/\\]/).length - 1;
  let c = content;
  if (depth === 0) {
    c = c.replaceAll('../../dist/', 'dist/');
    c = c.replaceAll('../dist/', 'dist/');
  } else {
    c = c.replaceAll('../../dist/', '../dist/');
  }
  c = c.replaceAll(
    /https:\/\/unpkg\.com\/velinstyle@/g,
    'https://unpkg.com/@birdapi/velinstyle@',
  );
  c = c.replaceAll(
    /https:\/\/cdn\.jsdelivr\.net\/npm\/velinstyle@/g,
    'https://cdn.jsdelivr.net/npm/@birdapi/velinstyle@',
  );
  return c;
}

for (const file of walkHtml(DOCS)) {
  const rel = relative(DOCS, file).replace(/\\/g, '/');
  const before = readFileSync(file, 'utf8');
  const after = patchContent(rel, before);
  if (after !== before) writeFileSync(file, after, 'utf8');
}

cpSync('dist', 'docs/dist', { recursive: true });
console.log('docs paths patched; dist copied to docs/dist');
