/**
 * Replace inline theme-picker widget with class-based assets (reduces scan warnings).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');

const WIDGET = `<!-- Theme Picker Widget -->
<link rel="stylesheet" href="assets/theme-picker.css">
<div role="region" aria-label="Theme picker" class="velin-docs-theme-picker" id="themePicker">
  <div id="themePanel" class="velin-docs-theme-panel">
    <p class="velin-docs-theme-panel__title">Theme waehlen</p>
    <div class="velin-docs-theme-grid" id="themeGrid"></div>
  </div>
  <button type="button" class="velin-docs-theme-trigger" aria-label="Theme waehlen" aria-expanded="false" aria-controls="themePanel">&#127912; Theme</button>
</div>
<script src="assets/theme-picker.js" defer></script>`;

const OLD_RE = /<!-- Theme Picker Widget -->[\s\S]*?<\/script>\s*(?=<script src="assets\/docs|<\/body>)/;

function walkHtml(relDir) {
  const dir = join(ROOT, relDir);
  if (!existsSync(dir)) return [];
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const rel = join(relDir, e.name).replace(/\\/g, '/');
    if (e.isDirectory()) out.push(...walkHtml(rel));
    else if (e.name.endsWith('.html')) out.push(rel);
  }
  return out;
}

let patched = 0;
for (const rel of walkHtml('docs')) {
  const path = join(ROOT, rel);
  let html = readFileSync(path, 'utf-8');
  if (!html.includes('<!-- Theme Picker Widget -->')) continue;
  const next = html.replace(OLD_RE, `${WIDGET}\n`);
  if (next === html) continue;
  writeFileSync(path, next);
  patched += 1;
  console.log('patched', rel);
}
console.log(`Done: ${patched} file(s)`);
