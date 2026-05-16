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
  c = c.replaceAll('VelinStyle v0.6.1', 'VelinStyle v0.7.0');

  c = c.replace(
    /<button class="velin-nav__toggle"([^>]*)\s+onclick="[^"]*"/gi,
    '<button type="button" class="velin-nav__toggle" data-velin-nav-toggle$1',
  );
  c = c.replace(
    /<button onclick="document\.getElementById\('themePanel'\)[^"]*"([^>]*aria-label="Theme[^"]*"[^>]*)>/gi,
    '<button type="button" data-velin-theme-toggle $1>',
  );

  const assetPrefix = depth === 0 ? 'assets/' : `${'../'.repeat(depth)}assets/`;
  if (c.includes('id="themePicker"') && !c.includes('docs-a11y.js')) {
    c = c.replace('</body>', `<script src="${assetPrefix}docs-a11y.js" defer></script>\n</body>`);
  } else if (c.includes('velin-nav__toggle') && !c.includes('docs-a11y.js')) {
    c = c.replace('</body>', `<script src="${assetPrefix}docs-a11y.js" defer></script>\n</body>`);
  }

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
