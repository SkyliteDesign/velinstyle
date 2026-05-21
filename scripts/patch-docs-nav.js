#!/usr/bin/env node
/**
 * Adds "API Reference" nav link before Migration in docs/*.html
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DOCS = 'docs';
const MARKER = 'velin-nav-api-reference';

function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walkHtml(p, out);
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

function patch(file, content) {
  if (content.includes(MARKER)) return content;
  const depth = file.replace(/\\/g, '/').split('/').length - 2;
  const prefix = depth <= 0 ? '' : '../'.repeat(depth);
  const ref = `${prefix}reference.html`;
  const insert = `      <li data-${MARKER}><a href="${ref}" class="velin-nav__link">API Reference</a></li>\n`;
  const re = /(\s*)<li><a href="[^"]*migration\.html" class="velin-nav__link">Migration<\/a><\/li>/i;
  if (!re.test(content)) return content;
  return content.replace(re, `${insert}$&`);
}

let changed = 0;
for (const file of walkHtml(DOCS)) {
  const before = readFileSync(file, 'utf8');
  const after = patch(file, before);
  if (after !== before) {
    writeFileSync(file, after, 'utf8');
    changed += 1;
  }
}
console.log(`Patched ${changed} HTML file(s) with API Reference nav link.`);
