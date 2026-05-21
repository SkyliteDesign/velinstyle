/**
 * Performance audit for static HTML — images, scripts, inline styles.
 */
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, extname, relative } from 'path';

const DEFAULT_IGNORE = ['node_modules', 'dist', '.git', '.next', 'build'];

export function walkHtmlFiles(dir, ignore = DEFAULT_IGNORE) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (ignore.includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) results.push(...walkHtmlFiles(full, ignore));
    else if (extname(entry.name).toLowerCase() === '.html') results.push(full);
  }
  return results;
}

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

/**
 * @param {string} html
 * @param {{ file?: string }} meta
 */
export function auditHtml(html, meta = {}) {
  const issues = [];
  const file = meta.file || '';
  const lines = html.split('\n');

  lines.forEach((line, idx) => {
    const ln = idx + 1;

    const imgTags = [...line.matchAll(/<img\b[^>]*>/gi)];
    for (const m of imgTags) {
      const tag = m[0];
      const hasW = /\bwidth\s*=/i.test(tag);
      const hasH = /\bheight\s*=/i.test(tag);
      const hasStyleDim = /style\s*=\s*["'][^"']*(?:width|height)\s*:/i.test(tag);
      if (!hasW && !hasH && !hasStyleDim) {
        issues.push({
          id: 'img-missing-dimensions',
          severity: 'warning',
          message: '<img> without width/height causes layout shift (CLS).',
          line: ln,
          file,
          fixable: true,
          fix: (l) => l.replace(/<img\b/i, '<img width="800" height="450"'),
        });
      }
      if (!/\bloading\s*=/i.test(tag) && !/\bfetchpriority\s*=\s*["']high["']/i.test(tag)) {
        issues.push({
          id: 'img-no-lazy',
          severity: 'info',
          message: 'Consider loading="lazy" for below-fold images.',
          line: ln,
          file,
          fixable: true,
          fix: (l) => l.replace(/<img\b/i, '<img loading="lazy"'),
        });
      }
    }

    const scriptTags = [...line.matchAll(/<script\b[^>]*>/gi)];
    for (const m of scriptTags) {
      const tag = m[0];
      if (/\bsrc\s*=/i.test(tag) && !/\bdefer\b/i.test(tag) && !/\basync\b/i.test(tag) && !/\btype\s*=\s*["']module["']/i.test(tag)) {
        issues.push({
          id: 'script-no-defer',
          severity: 'warning',
          message: 'External <script> without defer/async blocks parsing.',
          line: ln,
          file,
          fixable: true,
          fix: (l) => l.replace(/<script\b/i, '<script defer'),
        });
      }
    }

    if (/\sstyle\s*=\s*["'][^"']{120,}["']/i.test(line)) {
      issues.push({
        id: 'large-inline-style',
        severity: 'info',
        message: 'Large inline style block. Prefer external CSS.',
        line: ln,
        file,
        fixable: false,
      });
    }
  });

  if (/@font-face/i.test(html) && !/font-display\s*:\s*swap/i.test(html)) {
    issues.push({
      id: 'font-display-swap',
      severity: 'info',
      message: 'Add font-display: swap to @font-face rules.',
      file,
      line: 1,
      fixable: false,
    });
  }

  if (/velinstyle-components\.min\.js/i.test(html) && /velin-(?:modal|toast|tabs)/i.test(html) === false) {
    issues.push({
      id: 'unused-velin-import',
      severity: 'info',
      message: 'Full component bundle loaded. Consider @birdapi/velinstyle/runtime for tree-shaking.',
      file,
      line: 1,
      fixable: false,
    });
  }

  return issues;
}

export function auditPath(targetPath) {
  const files = walkHtmlFiles(targetPath);
  const issues = [];
  for (const file of files) {
    const html = readFileSync(file, 'utf-8');
    issues.push(...auditHtml(html, { file }));
  }
  return { issues, files };
}

export function formatTextReport(issues, files) {
  const lines = [`Performance audit — ${files.length} HTML file(s)\n`];
  if (issues.length === 0) {
    lines.push('No performance issues found.');
    return lines.join('\n');
  }
  for (const i of issues) {
    const loc = i.line ? `${relative(process.cwd(), i.file)}:${i.line}` : i.file;
    lines.push(`[${i.severity}] ${i.id} — ${loc}`);
    lines.push(`  ${i.message}`);
  }
  return lines.join('\n');
}

export function fixPath(targetPath, { write = false, dryRun = true } = {}) {
  const { issues } = auditPath(targetPath);
  const fixable = issues.filter((i) => i.fixable && typeof i.fix === 'function');
  const byFile = {};
  for (const issue of fixable) {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  }
  const changes = [];
  for (const [file, fileIssues] of Object.entries(byFile)) {
    const original = readFileSync(file, 'utf-8');
    const lines = original.split('\n');
    fileIssues.sort((a, b) => b.line - a.line);
    const applied = [];
    for (const issue of fileIssues) {
      const idx = issue.line - 1;
      if (idx < 0 || idx >= lines.length) continue;
      const next = issue.fix(lines[idx]);
      if (next !== lines[idx]) {
        lines[idx] = next;
        applied.push(issue.id);
      }
    }
    const content = lines.join('\n');
    if (content !== original) {
      if (write && !dryRun) writeFileSync(file, content, 'utf-8');
      changes.push({ file, changes: applied });
    }
  }
  return { ok: true, changes, dryRun: dryRun && !write };
}
