import { existsSync, readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { applyFixes, fixSafeExternalLinkLine, fixZIndexLine } from './apply-fixes.js';
import { scanPIIHTML, scanPIIJS } from './pii-scanner.js';
import { loadKnownCssClasses } from './blueprint.js';
import { contrastFromInlineStyle, parseColor, contrastRatio, relLuminance } from './contrast-utils.js';

export { SCANNER_RULES, PERF_RULES } from './scanner-rules-data.js';

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

/** Accept a single file or a directory (same pattern as layout-audit). */
function collectFiles(targetPath, exts, ignore = DEFAULT_IGNORE) {
  if (!existsSync(targetPath)) return [];
  const st = statSync(targetPath);
  if (st.isFile()) {
    return exts.includes(extname(targetPath).toLowerCase()) ? [targetPath] : [];
  }
  if (st.isDirectory()) {
    return walkFiles(targetPath, exts, ignore);
  }
  return [];
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

    if (/<meta\s[^>]*http-equiv\s*=\s*["']refresh["']/i.test(line)) {
      issues.push({
        file, line: ln, severity: 0,
        rule: 'security/no-meta-refresh',
        message: '<meta http-equiv="refresh"> can redirect users without consent.',
        fixable: false,
      });
    }

    if (/\sstyle\s*=\s*["'][^"']+["']/i.test(line) && !/velin-user-content/i.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'security/no-inline-style',
        message: 'Inline style attribute. Prefer CSS classes to reduce XSS surface.',
        fixable: false,
      });
    }

    if (/document\.write\s*\(/.test(line)) {
      issues.push({
        file, line: ln, severity: 0,
        rule: 'security/no-document-write',
        message: 'document.write() detected in HTML/script. This is dangerous and blocks parsing.',
        fixable: false,
      });
    }

    if (/(?:href|src)\s*=\s*["']data:text\/html/i.test(line)) {
      issues.push({
        file, line: ln, severity: 0,
        rule: 'security/no-data-html-uri',
        message: 'data:text/html URI can execute script when mishandled.',
        fixable: false,
      });
    }

    if (/<form\b[^>]*\btarget\s*=\s*["']_blank["']/i.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'security/dangerous-target',
        message: '<form target="_blank"> is unusual and can be abused. Prefer same-tab navigation.',
        fixable: false,
      });
    }

    if (/<script\b[^>]*\bsrc\s*=\s*["']https?:\/\//i.test(line) && !/\bintegrity\s*=/i.test(line)) {
      issues.push({
        file, line: ln, severity: 2,
        rule: 'security/integrity-missing',
        message: 'External <script> without integrity attribute. Use SRI for CDN scripts.',
        fixable: false,
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

    if (/\.postMessage\s*\([^)]*,\s*['"]\*['"]\s*\)/.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'security/postmessage-wildcard',
        message: 'postMessage with targetOrigin "*" accepts any origin.',
        fixable: false,
      });
    }
  });

  return issues;
}

function issueCategory(rule) {
  if (rule.startsWith('security/')) return 'security';
  if (rule.startsWith('pii/')) return 'pii';
  if (rule.startsWith('a11y/')) return 'a11y';
  if (rule.startsWith('css/')) return 'css';
  if (rule.startsWith('wc/')) return 'wc';
  if (rule.startsWith('perf/')) return 'perf';
  return 'other';
}

/** Author-facing attrs per tag (observed + documented aliases). Global HTML attrs ignored. */
const WC_ATTR_ALLOW = {
  'velin-tooltip': new Set(['content', 'placement']),
  'velin-copy': new Set(['value', 'text', 'label']),
  'velin-icon': new Set(['name', 'size', 'label', 'provider', 'variant', 'sprite', 'aria-label', 'aria-hidden', 'class']),
  'velin-sparkline': new Set(['values', 'width', 'height', 'min', 'max', 'area', 'glow', 'animate', 'label']),
  'velin-data-table': new Set(['page-size', 'filter-input', 'empty-text', 'label', 'editable', 'sortable', 'class']),
  'velin-form-summary': new Set([]),
  'velin-theme-toggle': new Set(['themes-base', 'theme', 'themes']),
  'velin-calendar': new Set(['value', 'min', 'max', 'label', 'class']),
  'velin-file-dropzone': new Set(['accept', 'multiple', 'label', 'progress', 'class']),
  'velin-code-block': new Set(['language', 'class']),
};

const WC_GLOBAL_ATTRS = new Set([
  'id', 'class', 'slot', 'part', 'style', 'hidden', 'title', 'role', 'tabindex',
  'aria-label', 'aria-labelledby', 'aria-describedby', 'aria-hidden', 'aria-expanded',
  'aria-controls', 'aria-live', 'aria-atomic', 'dir', 'lang', 'data-velin-component',
]);

function lineNumberAt(content, index) {
  return content.slice(0, Math.max(0, index)).split('\n').length;
}

function scanDuplicateIds(content, file) {
  const issues = [];
  const seen = new Map();
  for (const m of content.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    const id = m[1];
    const ln = lineNumberAt(content, m.index);
    if (seen.has(id)) {
      issues.push({
        file,
        line: ln,
        severity: 0,
        rule: 'a11y/duplicate-id',
        message: `Duplicate id="${id}" (also at line ${seen.get(id)}).`,
        fixable: false,
      });
    } else {
      seen.set(id, ln);
    }
  }
  return issues;
}

function scanUnknownVelinClasses(content, file, knownClasses) {
  const issues = [];
  if (!knownClasses) return issues;
  for (const m of content.matchAll(/\bclass\s*=\s*["']([^"']+)["']/gi)) {
    const ln = lineNumberAt(content, m.index);
    for (const token of m[1].split(/\s+/)) {
      if (!token.startsWith('velin-')) continue;
      if (!knownClasses.has(token)) {
        issues.push({
          file,
          line: ln,
          severity: 1,
          rule: 'css/unknown-velin-class',
          message: `Unknown VelinStyle class "${token}".`,
          fixable: false,
        });
      }
    }
  }
  return issues;
}

function scanInvalidWcAttributes(content, file) {
  const issues = [];
  for (const m of content.matchAll(/<(velin-[a-z0-9-]+)\b([^>]*)>/gi)) {
    const tag = m[1].toLowerCase();
    const attrBlob = m[2] || '';
    const allow = WC_ATTR_ALLOW[tag];
    if (!allow) continue;
    const ln = lineNumberAt(content, m.index);
    for (const am of attrBlob.matchAll(/([:@]?[a-zA-Z_:][\w:.-]*)\s*=/g)) {
      const name = am[1].toLowerCase();
      if (name.startsWith('on')) continue;
      if (name.startsWith('aria-') || name.startsWith('data-')) {
        // data-velin-copy is wrong API for <velin-copy>; allow only data-* that we document via dataset.source → data-source
        if (tag === 'velin-copy' && name !== 'data-source' && name.startsWith('data-')) {
          issues.push({
            file,
            line: ln,
            severity: 1,
            rule: 'wc/invalid-attribute',
            message: `<${tag}> does not use "${name}". Prefer value="…" or text="…".`,
            fixable: false,
          });
        }
        continue;
      }
      if (WC_GLOBAL_ATTRS.has(name) || allow.has(name)) continue;
      issues.push({
        file,
        line: ln,
        severity: 1,
        rule: 'wc/invalid-attribute',
        message: `<${tag}> does not observe attribute "${name}". Allowed: ${[...allow].join(', ') || '(none besides globals)'}.`,
        fixable: false,
      });
    }
  }
  return issues;
}

function collectTinyTapClasses(content) {
  const tiny = new Set();
  for (const block of content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = block[1];
    for (const rule of css.matchAll(/\.([a-zA-Z_-][\w-]*)\s*\{([^}]*)\}/g)) {
      const body = rule[2];
      const w = body.match(/(?:^|;)\s*(?:width|inline-size)\s*:\s*([\d.]+)px/i);
      const h = body.match(/(?:^|;)\s*(?:height|block-size)\s*:\s*([\d.]+)px/i);
      const wp = w ? Number(w[1]) : Infinity;
      const hp = h ? Number(h[1]) : Infinity;
      if (wp <= 24 || hp <= 24) tiny.add(rule[1]);
    }
  }
  return tiny;
}

function scanTargetSizeMin(content, file) {
  const issues = [];
  const tinyClasses = collectTinyTapClasses(content);
  const interactiveRe = /<(button|a|input|select|textarea|summary)\b([^>]*)>/gi;
  for (const m of content.matchAll(interactiveRe)) {
    const attrs = m[2] || '';
    const ln = lineNumberAt(content, m.index);
    let tiny = false;
    const styleM = attrs.match(/\bstyle\s*=\s*["']([^"']*)["']/i);
    if (styleM) {
      const s = styleM[1];
      for (const dim of s.matchAll(/(?:width|height|inline-size|block-size)\s*:\s*([\d.]+)px/gi)) {
        if (Number(dim[1]) <= 24) tiny = true;
      }
    }
    const classM = attrs.match(/\bclass\s*=\s*["']([^"']*)["']/i);
    if (classM) {
      for (const c of classM[1].split(/\s+/)) {
        if (tinyClasses.has(c)) tiny = true;
      }
    }
    if (tiny) {
      issues.push({
        file,
        line: ln,
        severity: 1,
        rule: 'a11y/target-size-min',
        message: `<${m[1]}> appears to have a hit target ≤24px (WCAG 2.5.8 heuristic).`,
        fixable: false,
      });
    }
  }
  return issues;
}

function scanNestedInteractive(content, file) {
  const issues = [];
  const html = content
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '');

  for (const m of html.matchAll(/<(button|a)\b([^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const outer = m[1].toLowerCase();
    const innerHtml = m[3] || '';
    const ln = lineNumberAt(content, m.index);
    const nestedTag = innerHtml.match(/<(button|a)\b/i);
    if (nestedTag) {
      issues.push({
        file,
        line: ln,
        severity: 0,
        rule: 'a11y/nested-interactive',
        message: `Nested interactive elements (<${outer}> contains <${nestedTag[1].toLowerCase()}>). Use a single control.`,
        fixable: false,
      });
    }
    if (/\brole\s*=\s*["'](button|link|menuitem)["']/i.test(innerHtml)) {
      const role = innerHtml.match(/\brole\s*=\s*["'](button|link|menuitem)["']/i)[1];
      issues.push({
        file,
        line: ln,
        severity: 0,
        rule: 'a11y/nested-interactive',
        message: `<${outer}> contains an element with role="${role}" (nested interactive).`,
        fixable: false,
      });
    }
  }

  // role=button wrapping another interactive
  for (const m of html.matchAll(/<([a-z][\w-]*)\b([^>]*\brole\s*=\s*["']button["'][^>]*)>([\s\S]*?)<\/\1>/gi)) {
    const innerHtml = m[3] || '';
    if (/<(button|a)\b/i.test(innerHtml) || /\brole\s*=\s*["'](button|link)["']/i.test(innerHtml)) {
      issues.push({
        file,
        line: lineNumberAt(content, m.index),
        severity: 0,
        rule: 'a11y/nested-interactive',
        message: `role="button" host contains nested interactive content.`,
        fixable: false,
      });
    }
  }

  return issues;
}

function scanContrastInline(content, file) {
  const issues = [];
  for (const m of content.matchAll(/<([a-z][\w-]*)\b([^>]*?\bstyle\s*=\s*["']([^"']*)["'][^>]*)>/gi)) {
    const style = m[3];
    const result = contrastFromInlineStyle(style);
    if (!result) continue;
    if (!result.pass) {
      issues.push({
        file,
        line: lineNumberAt(content, m.index),
        severity: 0,
        rule: 'a11y/contrast-inline',
        message: `Inline color contrast ${result.ratio.toFixed(2)}:1 fails WCAG AA (${result.min}:1). color=${result.fg} on ${result.bg}.`,
        fixable: false,
      });
    }
  }

  // Authored <style> blocks: flag pairs of color + background-color in the same rule when both parse
  for (const block of content.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)) {
    const css = block[1];
    const blockStart = block.index ?? 0;
    for (const rule of css.matchAll(/([^{]+)\{([^}]*)\}/g)) {
      const body = rule[2];
      const colorM = body.match(/(?:^|;)\s*color\s*:\s*([^;]+)/i);
      const bgM = body.match(/(?:^|;)\s*(?:background-color|background)\s*:\s*([^;]+)/i);
      if (!colorM || !bgM) continue;
      const fg = parseColor(colorM[1].trim());
      const bgRaw = bgM[1].trim();
      if (/gradient|url\(/i.test(bgRaw)) continue;
      const bg = parseColor(bgRaw.split(/\s+/)[0]);
      if (!fg || !bg) continue;
      const ratio = contrastRatio(relLuminance(fg), relLuminance(bg));
      if (ratio < 4.5) {
        issues.push({
          file,
          line: lineNumberAt(content, blockStart + (rule.index || 0)),
          severity: 0,
          rule: 'a11y/contrast-inline',
          message: `Authored CSS contrast ${ratio.toFixed(2)}:1 fails WCAG AA (4.5:1) in rule "${rule[1].trim().slice(0, 40)}".`,
          fixable: false,
        });
      }
    }
  }
  return issues;
}

const VELIN_WC_WITH_KEYBOARD = new Set([
  'velin-popover', 'velin-collapse', 'velin-dropdown', 'velin-menubar', 'velin-command',
  'velin-tabs', 'velin-accordion', 'velin-dialog', 'velin-modal', 'velin-drawer', 'velin-sheet',
]);

function scanRoleButtonContract(content, file) {
  const issues = [];
  for (const m of content.matchAll(/<([a-z][\w-]*)\b([^>]*\brole\s*=\s*["']button["'][^>]*)>/gi)) {
    const tag = m[1].toLowerCase();
    const attrs = m[2] || '';
    const ln = lineNumberAt(content, m.index);
    if (tag === 'button' || tag === 'summary') continue;
    if (VELIN_WC_WITH_KEYBOARD.has(tag)) continue;

    const hasTab = /\btabindex\s*=\s*["']?(?:0|-?\d+)/i.test(attrs);
    const hasKeyHandler = /\bon(?:keydown|keyup|keypress)\s*=/i.test(attrs);
    // Look ahead ~800 chars for a nearby script attaching keys (weak); prefer explicit warning
    if (!hasTab) {
      issues.push({
        file,
        line: ln,
        severity: 1,
        rule: 'a11y/role-button-contract',
        message: `role="button" on <${tag}> without tabindex. Use <button> or add tabindex="0" and Enter/Space handlers.`,
        fixable: false,
      });
      continue;
    }
    if (!hasKeyHandler) {
      issues.push({
        file,
        line: ln,
        severity: 1,
        rule: 'a11y/role-button-contract',
        message: `role="button" on <${tag}> lacks Enter/Space keyboard handling. Prefer <button> or handle keydown.`,
        fixable: false,
      });
    }
  }
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
      const tag = m[0];
      if (!/\balt\s*=/i.test(tag)) {
        issues.push({
          file, line: ln, severity: 0,
          rule: 'a11y/img-alt',
          message: '<img> without alt attribute. Add alt="" for decorative or descriptive text.',
          fixable: false,
        });
      } else if (
        /\balt\s*=\s*["']\s*["']/i.test(tag)
        && !/\baria-hidden\s*=\s*["']true["']/i.test(tag)
        && !/\brole\s*=\s*["']presentation["']/i.test(tag)
      ) {
        issues.push({
          file, line: ln, severity: 1,
          rule: 'a11y/img-decorative',
          message: 'Decorative <img alt=""> should include aria-hidden="true" so assistive tech ignores it consistently.',
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

    if (/<button\b[^>]*>[\s\S]*<velin-icon\b/i.test(line) && /<velin-icon\b(?![^>]*\blabel\s*=)/i.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'a11y/velin-icon-label',
        message: '<velin-icon> inside icon-only <button> should have a label attribute.',
        fixable: false,
      });
    }
    if (/<velin-sparkline\b/i.test(line) && !/<velin-sparkline\b[^>]*\blabel\s*=/i.test(line) && !/<figcaption/i.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'a11y/sparkline-label',
        message: '<velin-sparkline> needs label or a parent <figure> with <figcaption>.',
        fixable: false,
      });
    }
    if (/\bvelin-skeleton\b/i.test(line) && />\s*[^<\s][^<]+</i.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'a11y/skeleton-text',
        message: 'velin-skeleton on elements with visible text may hide content from assistive tech.',
        fixable: false,
      });
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

  if (/<body/i.test(content) && !/<main\b/i.test(content) && !/id\s*=\s*["']main["']/i.test(content)) {
    issues.push({
      file, line: 1, severity: 1,
      rule: 'a11y/landmark-main',
      message: 'No <main> landmark or id="main" found. Add a main landmark for screen readers.',
      fixable: false,
    });
  }

  const headings = [...content.matchAll(/<h([1-6])\b/gi)].map((m) => parseInt(m[1], 10));
  for (let i = 1; i < headings.length; i++) {
    if (headings[i] - headings[i - 1] > 1) {
      issues.push({
        file, line: 1, severity: 1,
        rule: 'a11y/heading-order',
        message: `Heading level skips from h${headings[i - 1]} to h${headings[i]}. Use sequential heading levels.`,
        fixable: false,
      });
      break;
    }
  }

  lines.forEach((line, idx) => {
    const ln = idx + 1;
    if (/aria-hidden\s*=\s*["']true["']/i.test(line) && /<(button|a|input|select|textarea)\b/i.test(line)) {
      issues.push({
        file, line: ln, severity: 0,
        rule: 'a11y/interactive-aria-hidden',
        message: 'Interactive element with aria-hidden="true" is not exposed to assistive tech.',
        fixable: false,
      });
    }

    const iframeMatches = line.matchAll(/<iframe\b[^>]*>/gi);
    for (const m of iframeMatches) {
      if (!/\btitle\s*=/i.test(m[0])) {
        issues.push({
          file, line: ln, severity: 0,
          rule: 'a11y/iframe-title',
          message: '<iframe> without title attribute.',
          fixable: false,
        });
      }
    }

    if (/<form\b/i.test(line) && /type\s*=\s*["'](?:password|email)["']/i.test(line)) {
      const formCtx = content.slice(Math.max(0, content.indexOf(line) - 800), content.indexOf(line) + 200);
      if (/type\s*=\s*["']password["']/i.test(formCtx) && !/autocomplete\s*=/i.test(line) && !/autocomplete\s*=/i.test(formCtx)) {
        issues.push({
          file, line: ln, severity: 1,
          rule: 'a11y/autocomplete-auth',
          message: 'Auth field missing autocomplete (WCAG 2.2 / 1.3.5). Add autocomplete="username" or "current-password".',
          fixable: false,
        });
      }
    }

    if (/aria-invalid\s*=\s*["']true["']/i.test(line) && !/aria-describedby/i.test(line)) {
      issues.push({
        file, line: ln, severity: 1,
        rule: 'a11y/invalid-describedby',
        message: 'aria-invalid without aria-describedby linking to error help text.',
        fixable: false,
      });
    }
  });

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
  const onlyCategories = options.only
    ? options.only.split(',').map((s) => s.trim().toLowerCase())
    : null;

  const htmlFiles = collectFiles(targetPath, ['.html', '.htm'], ignore);
  const cssFiles = collectFiles(targetPath, ['.css'], ignore);
  const jsFiles = collectFiles(targetPath, ['.js', '.mjs'], ignore);

  let allIssues = [];

  const fixEmailPlaceholder = options.fixEmailPlaceholder || 'user@example.com';
  const knownClasses = htmlFiles.length ? loadKnownCssClasses({ includeDist: true }) : null;

  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf-8');
    allIssues.push(...scanSecurityHTML(content, file));
    allIssues.push(...scanA11yHTML(content, file));
    allIssues.push(...scanDuplicateIds(content, file));
    allIssues.push(...scanTargetSizeMin(content, file));
    allIssues.push(...scanNestedInteractive(content, file));
    allIssues.push(...scanContrastInline(content, file));
    allIssues.push(...scanRoleButtonContract(content, file));
    allIssues.push(...scanInvalidWcAttributes(content, file));
    allIssues.push(...scanUnknownVelinClasses(content, file, knownClasses));
    allIssues.push(...scanPIIHTML(content, file, { fixEmailPlaceholder }));
  }

  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf-8');
    allIssues.push(...scanCSS(content, file));
  }

  for (const file of jsFiles) {
    const content = readFileSync(file, 'utf-8');
    allIssues.push(...scanSecurityJS(content, file));
    allIssues.push(...scanPIIJS(content, file));
  }

  allIssues = allIssues.filter(i => i.severity <= minSeverity);
  if (onlyCategories?.length) {
    allIssues = allIssues.filter((i) => onlyCategories.includes(issueCategory(i.rule)));
  }
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
      category: issueCategory(i.rule),
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
    if (options.returnData) {
      return { exitCode: errors > 0 ? 1 : 0, ...payload };
    }
    console.log(JSON.stringify(payload, null, 2));
  } else if (options.returnData) {
    return {
      exitCode: errors > 0 ? 1 : 0,
      total: allIssues.length,
      errors,
      warnings,
      infos,
      issues: allIssues.map((i) => ({
        file: relative(targetPath, i.file),
        line: i.line,
        severity: SEVERITY_LABEL[i.severity],
        category: issueCategory(i.rule),
        rule: i.rule,
        message: i.message,
        fixable: !!i.fixable,
      })),
    };
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
