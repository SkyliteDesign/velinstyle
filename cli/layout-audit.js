/**
 * Static layout audit for VelinStyle HTML — flex/grid, containers, responsive display.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import { join, extname, relative } from 'path';

const DEFAULT_IGNORE = ['node_modules', 'dist', '.git', '.next', '.nuxt', 'vendor', 'build'];

export function walkHtmlFiles(dir, ignore = DEFAULT_IGNORE) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignore.includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkHtmlFiles(full, ignore));
    } else if (extname(entry.name).toLowerCase() === '.html') {
      results.push(full);
    }
  }
  return results;
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

function extractClassTokens(html) {
  const tokens = new Set();
  const re = /class\s*=\s*["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    for (const c of m[1].split(/\s+/)) {
      if (c) tokens.add(c);
    }
  }
  return tokens;
}

function hasAnyClass(tokens, patterns) {
  return patterns.some((p) => {
    if (typeof p === 'string') return tokens.has(p);
    return [...tokens].some((t) => p.test(t));
  });
}

/** @typedef {{ id: string, severity: string, message: string, line?: number, file?: string, suggestions?: object, responsive?: object }} LayoutIssue */

/**
 * @param {string} html
 * @param {{ file?: string }} meta
 * @returns {LayoutIssue[]}
 */
export function auditHtml(html, meta = {}) {
  const issues = [];
  const file = meta.file || '';
  const classes = extractClassTokens(html);
  const classStr = html;

  // velin-col-* without velin-row in nearby context (heuristic: same file has col but no row)
  const hasCol = /\bvelin-(?:sm-|md-|lg-|xl-)?col(?:-\d+)?\b/.test(classStr);
  const hasRow = /\bvelin-row\b/.test(classStr);
  if (hasCol && !hasRow) {
    const idx = classStr.search(/\bvelin-(?:sm-|md-|lg-|xl-)?col/);
    issues.push({
      id: 'grid-missing-row',
      severity: 'warning',
      message: 'Column classes (velin-col-*) found without a parent velin-row.',
      line: idx >= 0 ? lineOf(html, idx) : undefined,
      file,
      suggestions: { addClasses: ['velin-row', 'velin-g-4'] },
      responsive: {
        mobile: 'Stack columns: velin-flex velin-flex--col on small screens or use velin-grid.',
        tablet: 'velin-row with velin-md-col-* at 48rem+.',
        desktop: 'velin-row + velin-col-* for 12-column layout.',
      },
    });
  }

  // flex without wrap and many flex children (heuristic: 6+ velin-btn or 8+ class on flex container)
  const flexNoWrap =
    /\bvelin-flex\b/.test(classStr) &&
    !/\bvelin-flex--wrap\b/.test(classStr) &&
    (classStr.match(/<a\b/gi)?.length || 0) + (classStr.match(/<button\b/gi)?.length || 0) >= 4;
  if (flexNoWrap) {
    issues.push({
      id: 'flex-no-wrap-overflow',
      severity: 'warning',
      message: 'Flex layout without velin-flex--wrap may overflow on narrow viewports.',
      file,
      suggestions: { addClasses: ['velin-flex--wrap'], alt: ['velin-overflow-x-auto'] },
      responsive: {
        mobile: 'Add velin-flex--wrap or velin-flex--col for stacked mobile nav.',
        tablet: 'velin-flex--wrap with velin-gap-4.',
        desktop: 'Keep row layout with wrap for many items.',
      },
    });
  }

  // main or section without container
  const hasMainOrSection = /<(?:main|section)\b/i.test(html);
  const hasContainer = /\bvelin-container\b/.test(classStr);
  if (hasMainOrSection && !hasContainer) {
    issues.push({
      id: 'missing-container',
      severity: 'info',
      message: 'Page sections without velin-container may span edge-to-edge unintentionally.',
      file,
      suggestions: { wrapWith: 'velin-container', alt: ['velin-container--fluid'] },
      responsive: {
        mobile: 'velin-container keeps readable padding on phones.',
        tablet: 'Same container max-width scales at 48rem / 62rem breakpoints.',
        desktop: 'Use velin-container--wide for marketing pages if needed.',
      },
    });
  }

  // velin-hidden without responsive show (velin-md-block etc.)
  if (hasAnyClass(classes, ['velin-hidden']) && !hasAnyClass(classes, [/^velin-(?:sm|md|lg)-(?:block|flex|grid|inline)/])) {
    const idx = classStr.indexOf('velin-hidden');
    issues.push({
      id: 'mobile-hidden-only',
      severity: 'warning',
      message: 'velin-hidden without a matching velin-md-block / velin-md-flex (element may stay hidden on all breakpoints).',
      line: idx >= 0 ? lineOf(html, idx) : undefined,
      file,
      suggestions: { pairWith: ['velin-hidden', 'velin-md-flex'], example: 'velin-hidden velin-md-flex' },
      responsive: {
        mobile: 'Hidden on default (mobile-first).',
        tablet: 'Show from md (48rem) with velin-md-flex or velin-md-block.',
        desktop: 'Adjust with velin-lg-* if needed.',
      },
    });
  }

  // desktop-only nav without mobile alternative hint
  const desktopOnlyNav =
    /\bvelin-desktop-only\b/.test(classStr) &&
    /<nav\b/i.test(html) &&
    !/\bvelin-mobile-only\b/.test(classStr) &&
    !/bottom-nav|velin-bottom-nav/i.test(classStr);
  if (desktopOnlyNav) {
    issues.push({
      id: 'desktop-nav-no-mobile',
      severity: 'info',
      message: 'Desktop-only navigation detected; consider velin-mobile-only + bottom-nav-mobile blueprint for phones.',
      file,
      suggestions: { blueprint: 'bottom-nav-mobile', addClasses: ['velin-mobile-only'] },
      responsive: {
        mobile: 'Use blueprint bottom-nav-mobile or velin-mobile-only block.',
        tablet: 'velin-md-flex for nav from 48rem.',
        desktop: 'velin-desktop-only for wide layouts.',
      },
    });
  }

  // 100vw
  if (/100vw|width:\s*100vw/i.test(html)) {
    issues.push({
      id: 'viewport-width',
      severity: 'warning',
      message: '100vw can cause horizontal scroll; prefer velin-w-full inside velin-container.',
      file,
      suggestions: { replaceWith: 'velin-w-full', wrapWith: 'velin-container' },
      responsive: {
        mobile: 'Avoid 100vw; use container + full width children.',
        tablet: '—',
        desktop: '—',
      },
    });
  }

  // sticky + overflow hidden on same element or parent snippet
  if (
    (/position:\s*sticky|velin-position-sticky/i.test(html)) &&
    (/overflow:\s*hidden|velin-overflow-hidden/i.test(html))
  ) {
    issues.push({
      id: 'sticky-overflow-parent',
      severity: 'warning',
      message: 'Sticky positioning may not work when an ancestor uses overflow: hidden.',
      file,
      suggestions: { doc: 'Remove overflow:hidden from sticky ancestors or use velin-position-sticky on a different wrapper.' },
      responsive: { mobile: 'Test sticky headers on iOS Safari.', tablet: '—', desktop: '—' },
    });
  }

  // table without responsive wrapper
  if (/<table\b/i.test(html) && !/\btable-responsive\b|velin-table-responsive|overflow-x-auto|velin-overflow-x-auto/i.test(html)) {
    issues.push({
      id: 'table-not-responsive',
      severity: 'info',
      message: 'Tables should scroll horizontally on small screens (blueprint table-responsive or velin-overflow-x-auto).',
      file,
      suggestions: { blueprint: 'table-responsive', wrapWith: 'velin-overflow-x-auto' },
      responsive: {
        mobile: 'Wrap table in scroll container.',
        tablet: 'Full table visible from md if columns fit.',
        desktop: '—',
      },
    });
  }

  return issues;
}

/**
 * @param {string} targetPath file or directory
 * @returns {{ issues: LayoutIssue[], files: string[] }}
 */
export function auditPath(targetPath) {
  let files = [];
  if (!existsSync(targetPath)) {
    return { issues: [], files: [] };
  }
  const st = statSync(targetPath);
  if (st.isFile()) {
    files = extname(targetPath).toLowerCase() === '.html' ? [targetPath] : [];
  } else {
    files = walkHtmlFiles(targetPath);
  }

  const issues = [];
  for (const file of files) {
    const html = readFileSync(file, 'utf-8');
    issues.push(...auditHtml(html, { file }));
  }
  return { issues, files };
}

/**
 * @param {LayoutIssue[]} issues
 */
export function suggestFromIssues(issues) {
  return issues.map((i) => ({
    ...i,
    fix:
      i.suggestions?.addClasses?.length ?
        `Add classes: ${i.suggestions.addClasses.join(', ')}`
      : i.suggestions?.pairWith ?
        `Use: ${i.suggestions.pairWith.join(' ')}`
      : i.suggestions?.wrapWith ?
        `Wrap content in <div class="${i.suggestions.wrapWith}">…</div>`
      : i.suggestions?.blueprint ?
        `Consider blueprint: ${i.suggestions.blueprint}`
      : i.suggestions?.doc || 'See responsive-layout guide.',
  }));
}

/**
 * Whitelisted safe fixes on HTML string.
 * @returns {{ html: string, changes: string[] }}
 */
export function applySafeFixes(html) {
  const changes = [];
  let out = html;

  // Add velin-flex--wrap to velin-flex that lacks wrap/nowrap
  out = out.replace(
    /class\s*=\s*["']([^"']*\bvelin-flex\b[^"']*)["']/gi,
    (match, cls) => {
      if (/\bvelin-flex--(?:wrap|nowrap)\b/.test(cls)) return match;
      changes.push('Added velin-flex--wrap to flex container');
      return `class="${cls} velin-flex--wrap"`;
    },
  );

  // velin-hidden alone on same element -> add velin-md-block (conservative: only if exactly velin-hidden)
  out = out.replace(
    /class\s*=\s*["']velin-hidden["']/gi,
    () => {
      changes.push('Paired velin-hidden with velin-md-block');
      return 'class="velin-hidden velin-md-block"';
    },
  );

  // Wrap bare <main> children - skip (too invasive)

  return { html: out, changes };
}

/**
 * @param {string} targetPath
 * @param {{ write?: boolean, dryRun?: boolean }} opts
 */
export function fixPath(targetPath, opts = {}) {
  const { issues, files } = auditPath(targetPath);
  if (files.length === 0) {
    return { ok: false, error: 'No HTML files found.', changes: [] };
  }

  const allChanges = [];
  for (const file of files) {
    const html = readFileSync(file, 'utf-8');
    const { html: next, changes } = applySafeFixes(html);
    if (changes.length) {
      allChanges.push({ file, changes });
      if (opts.write && !opts.dryRun) {
        writeFileSync(file, next, 'utf-8');
      }
    }
  }

  return { ok: true, issues, changes: allChanges, dryRun: !!opts.dryRun && !opts.write };
}

export function formatTextReport(issues, files) {
  const lines = [];
  lines.push(`\nLayout audit: ${files.length} file(s), ${issues.length} issue(s)\n`);
  if (issues.length === 0) {
    lines.push('  No layout issues detected.\n');
    return lines.join('\n');
  }
  for (const i of issues) {
    const loc = i.file ? ` ${relative(process.cwd(), i.file)}` : '';
    const ln = i.line ? `:${i.line}` : '';
    lines.push(`  [${i.severity.toUpperCase()}] ${i.id}${loc}${ln}`);
    lines.push(`    ${i.message}`);
    if (i.suggestions?.addClasses) {
      lines.push(`    → Add: ${i.suggestions.addClasses.join(', ')}`);
    }
  }
  lines.push('');
  return lines.join('\n');
}
