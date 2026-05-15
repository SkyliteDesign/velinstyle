import { existsSync, readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, relative, extname } from 'path';
import { applyFixes, fixSafeExternalLinkLine, fixZIndexLine } from './apply-fixes.js';

const SEVERITY = { error: 0, warning: 1, info: 2 };
const SEVERITY_LABEL = { 0: 'ERROR', 1: 'WARNING', 2: 'INFO' };
const C = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
};

const DEFAULT_IGNORE = ['node_modules', 'dist', '.git', '.next', '.nuxt', 'vendor', 'build'];

// ── File walker ──────────────────────────────────────────────────────────────

function walkFiles(dir, exts, ignore = DEFAULT_IGNORE) {
  const results = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (ignore.includes(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkFiles(full, exts, ignore));
    } else if (exts.includes(extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

// ── Security Scanner ─────────────────────────────────────────────────────────

const INLINE_EVENTS = [
  'onclick', 'ondblclick', 'onmousedown', 'onmouseup', 'onmouseover',
  'onmouseout', 'onkeydown', 'onkeyup', 'onkeypress', 'onfocus', 'onblur',
  'onchange', 'onsubmit', 'onreset', 'onload', 'onerror', 'onscroll',
  'onresize', 'oninput', 'oncontextmenu',
];

function scanSecurityHTML(content, file) {
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const ln = idx + 1;

    for (const evt of INLINE_EVENTS) {
      const re = new RegExp(`\\s${evt}\\s*=`, 'i');
      if (re.test(line)) {
        issues.push({
          file, line: ln, severity: 1,
          rule: 'security/no-inline-handler',
          message: `Inline event handler "${evt}" found. Use addEventListener() instead.`,
          fixable: false,
        });
      }
    }

    if (/href\s*=\s*["']javascript:/i.test(line)) {
      issues.push({
        file, line: ln, severity: 0,
        rule: 'security/no-javascript-url',
        message: 'javascript: URL detected. This is an XSS vector.',
        fixable: false,
      });
    }

    if (/target\s*=\s*["']_blank["']/i.test(line) && !/rel\s*=\s*["'][^"']*noopener/i.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'security/safe-external-link',
        message: 'target="_blank" without rel="noopener noreferrer". Risk of tab-napping.',
        fixable: true,
        fix: (currentLine) => fixSafeExternalLinkLine(currentLine),
      });
    }
  });

  if (!/<meta\s[^>]*http-equiv\s*=\s*["']Content-Security-Policy["']/i.test(content)) {
    issues.push({
      file, line: 1, severity: 2,
      rule: 'security/csp-meta',
      message: 'No CSP meta tag found. Consider adding Content-Security-Policy headers.',
      fixable: false,
    });
  }

  return issues;
}

function scanSecurityJS(content, file) {
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const ln = idx + 1;

    if (/\.innerHTML\s*=/.test(line) && !/escapeHTML|sanitize|textContent/i.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'security/no-raw-innerhtml',
        message: 'Direct innerHTML assignment. Use escapeHTML() or textContent.',
        fixable: false,
      });
    }

    if (/document\.write\s*\(/.test(line)) {
      issues.push({
        file, line: ln, severity: 0,
        rule: 'security/no-document-write',
        message: 'document.write() detected. This is dangerous and blocks parsing.',
        fixable: false,
      });
    }

    if (/\beval\s*\(/.test(line)) {
      issues.push({
        file, line: ln, severity: 0,
        rule: 'security/no-eval',
        message: 'eval() detected. This is a critical security risk.',
        fixable: false,
      });
    }

    if (/new\s+Function\s*\(/.test(line)) {
      issues.push({
        file, line: ln, severity: 0,
        rule: 'security/no-function-constructor',
        message: 'new Function() is equivalent to eval(). Avoid.',
        fixable: false,
      });
    }
  });

  return issues;
}

// ── Accessibility Scanner ────────────────────────────────────────────────────

function scanA11yHTML(content, file) {
  const issues = [];
  const lines = content.split('\n');

  if (/<html[^>]*>/i.test(content) && !/<html[^>]*\slang\s*=/i.test(content)) {
    issues.push({
      file, line: 1, severity: 0,
      rule: 'a11y/html-lang',
      message: '<html> element missing lang attribute.',
      fixable: true,
    });
  }

  lines.forEach((line, idx) => {
    const ln = idx + 1;

    const imgMatches = line.matchAll(/<img\b[^>]*>/gi);
    for (const m of imgMatches) {
      if (!/\balt\s*=/i.test(m[0])) {
        issues.push({
          file, line: ln, severity: 0,
          rule: 'a11y/img-alt',
          message: '<img> without alt attribute. Add alt="" for decorative or descriptive text.',
          fixable: false,
        });
      }
    }

    const btnMatches = line.matchAll(/<button\b[^>]*>([^<]*)<\/button>/gi);
    for (const m of btnMatches) {
      if (!m[1].trim() && !/aria-label/i.test(m[0])) {
        issues.push({
          file, line: ln, severity: 1,
          rule: 'a11y/button-label',
          message: '<button> has no text content and no aria-label.',
          fixable: false,
        });
      }
    }

    const inputMatches = line.matchAll(/<input\b[^>]*>/gi);
    for (const m of inputMatches) {
      const tag = m[0];
      if (/type\s*=\s*["'](hidden|submit|button|reset|image)["']/i.test(tag)) continue;
      if (!/aria-label|id\s*=/i.test(tag)) {
        issues.push({
          file, line: ln, severity: 1,
          rule: 'a11y/input-label',
          message: '<input> without id (for <label>) or aria-label.',
          fixable: false,
        });
      }
    }
  });

  if (/<body/i.test(content) && !/velin-skip-link|skip-link|skiplink|class=".*skip/i.test(content)) {
    issues.push({
      file, line: 1, severity: 1,
      rule: 'a11y/skip-link',
      message: 'No skip link found. Add <a href="#main" class="velin-skip-link"> for keyboard users. Auto-fix inserts a link only when id="main" exists.',
      fixable: true,
    });
  }

  return issues;
}

// ── CSS Lint ─────────────────────────────────────────────────────────────────

function scanCSS(content, file) {
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const ln = idx + 1;

    const varMatches = line.matchAll(/var\(\s*(--[\w-]+)\s*\)/g);
    for (const m of varMatches) {
      if (!/var\(\s*--[\w-]+\s*,/.test(m.input.slice(m.index))) {
        issues.push({
          file, line: ln, severity: 2,
          rule: 'css/var-fallback',
          message: `CSS variable ${m[1]} without fallback value.`,
          fixable: false,
        });
      }
    }

    if (/z-index\s*:\s*\d+/i.test(line) && !/var\(\s*--velin-z-/i.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'css/z-index-token',
        message: 'Raw z-index value. Use VelinStyle z-index tokens (--velin-z-*).',
        fixable: true,
        fix: (currentLine) => fixZIndexLine(currentLine),
      });
    }

    if (/!important/i.test(line)) {
      if (!/security|hidden|\.velin-sr-only|\.velin-user-content|display:\s*none\s*!important/i.test(line)) {
        issues.push({
          file, line: ln, severity: 2,
          rule: 'css/no-important',
          message: '!important usage. Consider using specificity or @layer instead.',
          fixable: false,
        });
      }
    }

    const prefixes = ['-webkit-', '-moz-', '-ms-', '-o-'];
    for (const pre of prefixes) {
      if (line.includes(pre) && !/text-size-adjust|font-smoothing|text-fill-color|box-shadow|text-security|user-modify|appearance|autofill/.test(line)) {
        issues.push({
          file, line: ln, severity: 2,
          rule: 'css/vendor-prefix',
          message: `Vendor prefix "${pre}" may be unnecessary. Lightning CSS handles autoprefixing.`,
          fixable: false,
        });
      }
    }
  });

  return issues;
}

// ── Main scan function ───────────────────────────────────────────────────────

export function scan(targetPath, options = {}) {
  const minSeverity = SEVERITY[options.severity] ?? SEVERITY.warning;
  const format = options.format || 'text';
  const doFix = options.fix || false;
  const fixDryRun = options.fixDryRun || false;
  const fixLang = options.fixLang || 'de';
  const writeFixes = doFix && !fixDryRun;
  const runFixPipeline = doFix || fixDryRun;
  const ignore = options.ignore || DEFAULT_IGNORE;

  const htmlFiles = walkFiles(targetPath, ['.html', '.htm'], ignore);
  const cssFiles = walkFiles(targetPath, ['.css'], ignore);
  const jsFiles = walkFiles(targetPath, ['.js', '.mjs'], ignore);

  let allIssues = [];

  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf-8');
    allIssues.push(...scanSecurityHTML(content, file));
    allIssues.push(...scanA11yHTML(content, file));
  }

  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf-8');
    allIssues.push(...scanCSS(content, file));
  }

  for (const file of jsFiles) {
    const content = readFileSync(file, 'utf-8');
    allIssues.push(...scanSecurityJS(content, file));
  }

  allIssues = allIssues.filter(i => i.severity <= minSeverity);
  allIssues.sort((a, b) => a.severity - b.severity || a.file.localeCompare(b.file) || a.line - b.line);

  let fixSummary = null;
  if (runFixPipeline) {
    fixSummary = applyFixes(targetPath, allIssues, {
      dryRun: !writeFixes,
      fixLang,
    });
  }

  const errors = allIssues.filter(i => i.severity === 0).length;
  const warnings = allIssues.filter(i => i.severity === 1).length;
  const infos = allIssues.filter(i => i.severity === 2).length;

  if (format === 'json') {
    const jsonIssues = allIssues.map(i => ({
      file: relative(targetPath, i.file),
      line: i.line,
      severity: SEVERITY_LABEL[i.severity],
      rule: i.rule,
      message: i.message,
      fixable: !!i.fixable,
    }));
    const payload = {
      total: allIssues.length,
      errors,
      warnings,
      infos,
      issues: jsonIssues,
    };
    if (fixSummary) {
      payload.autoFix = {
        dryRun: fixSummary.dryRun,
        changedFiles: fixSummary.changedRelPaths,
      };
    }
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`\n  ${C.bold('VelinStyle Scanner Report')}\n`);
    console.log(`  Scanned: ${htmlFiles.length} HTML, ${cssFiles.length} CSS, ${jsFiles.length} JS files\n`);

    let currentFile = '';
    for (const issue of allIssues) {
      const relPath = relative(targetPath, issue.file);
      if (relPath !== currentFile) {
        currentFile = relPath;
        console.log(`  ${C.bold(currentFile)}`);
      }

      const sevColor = issue.severity === 0 ? C.red : issue.severity === 1 ? C.yellow : C.dim;
      const sevLabel = SEVERITY_LABEL[issue.severity].padEnd(7);
      const fixTag = issue.fixable ? C.green(' [fixable]') : '';
      console.log(`    ${sevColor(sevLabel)} L${String(issue.line).padStart(4)}  ${C.cyan(issue.rule)}`);
      console.log(`    ${' '.repeat(7)}       ${issue.message}${fixTag}`);
    }

    console.log(`\n  ${C.bold('Summary:')}`);
    if (errors > 0) console.log(`    ${C.red(`${errors} error(s)`)}`);
    if (warnings > 0) console.log(`    ${C.yellow(`${warnings} warning(s)`)}`);
    if (infos > 0) console.log(`    ${C.dim(`${infos} info(s)`)}`);
    if (allIssues.length === 0) console.log(`    ${C.green('No issues found!')}`);
    console.log();

    if (fixSummary) {
      const { changedRelPaths, dryRun } = fixSummary;
      if (changedRelPaths.length > 0) {
        if (dryRun) {
          console.log(`  ${C.dim(`Dry run: would write ${changedRelPaths.length} file(s):`)}`);
          changedRelPaths.forEach((p) => console.log(`    ${C.dim(p)}`));
        } else {
          console.log(`  ${C.green(`Auto-fixed ${changedRelPaths.length} file(s):`)}`);
          changedRelPaths.forEach((p) => console.log(`    ${C.dim(p)}`));
        }
        console.log();
      } else if (dryRun) {
        console.log(`  ${C.dim('Dry run: no auto-fixable changes (or nothing to apply).')}\n`);
      }
    }
  }

  return errors > 0 ? 1 : 0;
}
