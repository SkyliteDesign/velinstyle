/**
 * Wrap doc nav (+ optional site alert) in <header role="banner"> for axe region rule.
 * Wrap bare sample pages in <main id="main">.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');

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

function wrapDocHeader(html) {
  if (html.includes('<header role="banner">') || !html.includes('class="velin-nav"')) {
    return html;
  }
  let next = html.replace(
    /(<a href="#main" class="velin-skip-link">[\s\S]*?<\/a>\s*\n)(\s*<nav class="velin-nav")/,
    '$1  <header role="banner">\n$2',
  );
  if (next === html) return html;

  next = next.replace(
    /(<\/nav>\s*\n)(<div class="velin-alert[\s\S]*?<\/div>\s*\n)?(\s*<main)/,
    (_, navEnd, alert, main) => {
      const close = '  </header>\n';
      return `${navEnd}${alert || ''}${close}${main}`;
    },
  );
  return next;
}

function wrapSampleMain(html) {
  if (html.includes('<main ') || html.includes('class="velin-nav"')) return html;
  const m = html.match(/<body([^>]*)>([\s\S]*)<\/body>/i);
  if (!m) return html;
  const inner = m[2].trim();
  if (!inner || inner.startsWith('<main')) return html;
  return html.replace(
    /<body([^>]*)>[\s\S]*<\/body>/i,
    `<body$1>\n  <main id="main">\n${inner.replace(/^/gm, '    ')}\n  </main>\n</body>`,
  );
}

let changed = 0;
for (const rel of [...walkHtml('docs'), ...walkHtml('samples')]) {
  const path = join(ROOT, rel);
  let html = readFileSync(path, 'utf-8');
  const orig = html;
  if (rel.startsWith('docs/')) html = wrapDocHeader(html);
  if (rel.startsWith('samples/')) html = wrapSampleMain(html);
  if (html !== orig) {
    writeFileSync(path, html);
    changed++;
    console.log('patched', rel);
  }
}
let closed = 0;
for (const rel of walkHtml('docs')) {
  const path = join(ROOT, rel);
  let html = readFileSync(path, 'utf-8');
  if (!html.includes('<header role="banner">')) continue;
  const mainIdx = html.indexOf('<main id="main"');
  const headerIdx = html.indexOf('<header role="banner">');
  const closeIdx = html.indexOf('</header>', headerIdx);
  if (mainIdx < 0 || (closeIdx > headerIdx && closeIdx < mainIdx)) continue;
  const next = html.replace(/(\s*<main id="main")/, '  </header>\n$1');
  if (next !== html) {
    writeFileSync(path, next);
    closed++;
    console.log('closed header', rel);
  }
}
console.log(`Done. ${changed} patched, ${closed} header(s) closed.`);
