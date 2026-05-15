import { readFileSync, writeFileSync } from 'fs';
import { relative } from 'path';

/** Official VelinStyle z-index scale (mirrors src/tokens/z-index.css) */
const VELIN_Z_SCALE = [
  ['--velin-z-hide', -1],
  ['--velin-z-base', 0],
  ['--velin-z-raised', 1],
  ['--velin-z-dropdown', 100],
  ['--velin-z-sticky', 200],
  ['--velin-z-navbar', 300],
  ['--velin-z-overlay', 400],
  ['--velin-z-modal', 500],
  ['--velin-z-toast', 600],
  ['--velin-z-tooltip', 700],
  ['--velin-z-max', 9999],
];

const FILE_FIX_RULES = new Set(['a11y/html-lang', 'a11y/skip-link']);

export function pickClosestZToken(n) {
  let best = VELIN_Z_SCALE[0];
  let bestDist = Math.abs(n - best[1]);
  for (const entry of VELIN_Z_SCALE) {
    const d = Math.abs(n - entry[1]);
    if (d < bestDist) {
      best = entry;
      bestDist = d;
    }
  }
  return best;
}

/**
 * Replace raw numeric z-index with var(--velin-z-*, fallback).
 * Skips values already using var(--velin-z-*).
 */
export function fixZIndexLine(line) {
  if (!/z-index\s*:\s*\d+/i.test(line) || /var\(\s*--velin-z-/i.test(line)) return line;
  return line.replace(/z-index\s*:\s*(\d+)/gi, (m, numStr) => {
    const n = parseInt(numStr, 10);
    const [name] = pickClosestZToken(n);
    return `z-index: var(${name}, ${n})`;
  });
}

/**
 * Add rel="noopener noreferrer" (or merge into existing rel) for target="_blank" inside tags on this line.
 */
export function fixSafeExternalLinkLine(line) {
  return line.replace(/<[^>]+>/g, (tag) => {
    if (!/target\s*=\s*["']_blank["']/i.test(tag)) return tag;
    if (/rel\s*=\s*["'][^"']*noopener/i.test(tag)) return tag;

    const relDouble = tag.match(/\brel\s*=\s*"([^"]*)"/i);
    if (relDouble) {
      const val = relDouble[1];
      if (/noopener/i.test(val)) return tag;
      return tag.replace(relDouble[0], `rel="${val} noopener noreferrer"`);
    }
    const relSingle = tag.match(/\brel\s*=\s*'([^']*)'/i);
    if (relSingle) {
      const val = relSingle[1];
      if (/noopener/i.test(val)) return tag;
      return tag.replace(relSingle[0], `rel='${val} noopener noreferrer'`);
    }
    return tag.replace(/(target\s*=\s*["']_blank["'])/i, '$1 rel="noopener noreferrer"');
  });
}

export function fixHtmlLangContent(content, fixLang = 'de') {
  if (/<html[^>]*\slang\s*=/i.test(content)) return content;
  return content.replace(/<html(\s[^>]*)?>/i, (full, attrs) => {
    if (/\slang\s*=/i.test(full)) return full;
    const a = attrs && attrs.trim();
    return `<html lang="${fixLang}"${a ? ` ${a}` : ''}>`;
  });
}

const SKIP_LINK_SNIPPET =
  '\n<a href="#main" class="velin-skip-link">Skip to main content</a>';

export function fixSkipLinkContent(content) {
  if (/velin-skip-link|skip-link|skiplink|class=["'][^"']*skip/i.test(content)) return content;
  if (!/\bid\s*=\s*["']main["']/i.test(content)) return content;
  return content.replace(/<body([^>]*)>/i, (full, g1) => `${full}${SKIP_LINK_SNIPPET}`);
}

function needsFileFix(issues, rule) {
  return issues.some((i) => i.rule === rule && i.fixable);
}

/**
 * @param {string} targetPath
 * @param {Array<object>} allIssues filtered issues (same list as report)
 * @param {{ dryRun?: boolean, fixLang?: string }} options
 * @returns {{ changedFiles: string[], dryRun: boolean }}
 */
export function applyFixes(targetPath, allIssues, options = {}) {
  const dryRun = !!options.dryRun;
  const fixLang = options.fixLang || 'de';

  const fixable = allIssues.filter(
    (i) => i.fixable && (typeof i.fix === 'function' || FILE_FIX_RULES.has(i.rule)),
  );
  if (fixable.length === 0) return { changedFiles: [], dryRun };

  const byFile = {};
  for (const issue of fixable) {
    if (!byFile[issue.file]) byFile[issue.file] = [];
    byFile[issue.file].push(issue);
  }

  const changedFiles = [];

  for (const [file, fileIssues] of Object.entries(byFile)) {
    const original = readFileSync(file, 'utf-8');
    let content = original;
    const ext = file.toLowerCase().endsWith('.css');

    if (!ext) {
      if (needsFileFix(fileIssues, 'a11y/html-lang')) {
        content = fixHtmlLangContent(content, fixLang);
      }
    }

    const lineIssues = fileIssues.filter(
      (i) => typeof i.fix === 'function' && !FILE_FIX_RULES.has(i.rule),
    );
    lineIssues.sort((a, b) => b.line - a.line || a.rule.localeCompare(b.rule));

    if (lineIssues.length > 0) {
      const lines = content.split('\n');
      for (const issue of lineIssues) {
        const idx = issue.line - 1;
        if (idx < 0 || idx >= lines.length) continue;
        const next = issue.fix(lines[idx]);
        if (typeof next === 'string' && next !== lines[idx]) lines[idx] = next;
      }
      content = lines.join('\n');
    }

    if (!ext) {
      if (needsFileFix(fileIssues, 'a11y/skip-link')) {
        content = fixSkipLinkContent(content);
      }
    }

    if (content !== original) {
      changedFiles.push(file);
      if (!dryRun) writeFileSync(file, content, 'utf-8');
    }
  }

  return { changedFiles, dryRun, changedRelPaths: changedFiles.map((f) => relative(targetPath, f)) };
}
