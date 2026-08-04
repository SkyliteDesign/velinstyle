/**
 * Review Engine — design / a11y / seo / performance / conversion / prompt score.
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const PROFILES = new Set(['marketing', 'app', 'docs', 'fragment', 'ecommerce']);

function loadConstraint(id) {
  const p = join(ROOT, 'core/meta/design-constraints', `${id}.json`);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

/** Strip non-DOM noise so review heuristics do not count meta JSON or code demos. */
function stripNonRenderableHtml(html) {
  return String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<velin-code-block\b[^>]*>[\s\S]*?<\/velin-code-block>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

function visibleWordCount(html) {
  const clean = stripNonRenderableHtml(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) return 0;
  return clean.split(' ').filter(Boolean).length;
}

function detectProfile(html, ctx = {}) {
  if (ctx.profile && PROFILES.has(ctx.profile)) return ctx.profile;
  const intent = ctx.plan?.page?.intent || ctx.plan?.page?.id || '';
  const metaIntent = html.match(/"intent"\s*:\s*"([^"]+)"/)?.[1] || '';
  const blob = `${intent} ${metaIntent}`.toLowerCase();
  if (/dashboard|crm|erp|admin|app-shell|auth|login/.test(blob)) return 'app';
  if (/docs|documentation|guide/.test(blob)) return 'docs';
  if (/shop|ecommerce|store|checkout|cart/.test(blob)) return 'ecommerce';
  if (ctx.fragment) return 'fragment';
  // Short recipe-like HTML without document chrome → fragment
  if (!/<html\b/i.test(html) && !/<main\b/i.test(html)) return 'fragment';
  return 'marketing';
}

/**
 * Hero scope: explicit hero markers first, else prefix until common section ids.
 * Counts only real <a>/<button> tags with primary/outline CTA classes.
 */
function countHeroCtas(html) {
  const clean = stripNonRenderableHtml(html);
  let heroChunk = '';
  const heroSection =
    clean.match(/<section\b[^>]*(?:\bid=["']hero["']|data-velin-section=["']hero["'])[^>]*>[\s\S]*?<\/section>/i)
    || clean.match(/<(?:header|section)\b[^>]*\bid=["']top["'][^>]*>[\s\S]*?<\/(?:header|section)>/i);
  if (heroSection) {
    heroChunk = heroSection[0];
  } else {
    heroChunk = clean.split(/id=["'](?:services|faq|testimonials)["']/i)[0] || clean.slice(0, 2000);
  }
  const ctaRe = /<(?:a|button)\b[^>]*\bvelin-btn--(?:primary|outline)\b[^>]*>/gi;
  return [...heroChunk.matchAll(ctaRe)].length;
}

/**
 * @param {string} html
 * @param {{ plan?: object, prompt?: string, profile?: string, fragment?: boolean }} [ctx]
 */
export function reviewHtml(html, ctx = {}) {
  const issues = [];
  const text = html || '';
  const profile = detectProfile(text, ctx);
  const isFragment = profile === 'fragment';

  const isMarketing = profile === 'marketing' || profile === 'ecommerce';

  const h1 = [...text.matchAll(/<h1\b/gi)];
  if (!isFragment) {
    if (h1.length === 0) {
      const h1Fix = profile === 'app' || profile === 'docs'
        ? 'Add a single page H1 in the primary content (header/main) — not necessarily a marketing hero.'
        : 'Add a single page H1 in the hero.';
      issues.push({ code: 'a11y.missing-h1', severity: 'error', message: 'Missing H1', fix: h1Fix });
    } else if (h1.length > 1) {
      issues.push({ code: 'a11y.multiple-h1', severity: 'warning', message: `Found ${h1.length} H1 elements`, fix: 'Keep exactly one H1.' });
    }
  }

  if (!isFragment && !/<html\b[^>]*\blang=/i.test(text) && /<html\b/i.test(text)) {
    issues.push({
      code: 'a11y.missing-lang',
      severity: 'error',
      message: 'Missing lang on <html>',
      fix: 'Add lang="en" (or your locale) on <html>.',
    });
  }

  if (!isFragment) {
    const imgs = [...text.matchAll(/<img\b[^>]*>/gi)];
    for (const m of imgs) {
      const tag = m[0];
      if (/\brole=["']presentation["']/i.test(tag) || /\baria-hidden=["']true["']/i.test(tag)) continue;
      if (!/\balt=/i.test(tag)) {
        issues.push({
          code: 'a11y.img-missing-alt',
          severity: 'error',
          message: 'Image without alt attribute',
          fix: 'Add alt text (or alt="" for decorative images).',
        });
        break;
      }
    }
  }

  if (/<input\b/i.test(text) && !isFragment) {
    const inputs = [...text.matchAll(/<input\b[^>]*>/gi)];
    let unlabeled = 0;
    for (const m of inputs) {
      const tag = m[0];
      if (/\btype=["']hidden["']/i.test(tag)) continue;
      if (/\baria-label=/i.test(tag) || /\baria-labelledby=/i.test(tag) || /\bid=/i.test(tag)) continue;
      if (/\bplaceholder=/i.test(tag)) unlabeled += 1;
    }
    if (unlabeled > 0 && !/<label\b/i.test(text)) {
      issues.push({
        code: 'a11y.unlabeled-input',
        severity: 'error',
        message: 'Input(s) without associated label',
        fix: 'Wire <label for="…"> to each input id (or use aria-label).',
      });
    }
  }

  const ctaPrimary = [...text.matchAll(/velin-btn--primary/g)];
  if (isMarketing && ctaPrimary.length > 4) {
    issues.push({ code: 'design.too-many-primary-ctas', severity: 'warning', message: 'Many primary CTAs competing', fix: 'Limit primary CTAs; demote extras to outline/ghost.' });
  }
  if (/<form\b/i.test(text)) {
    const skipFormSummary = profile === 'docs' && /type=["']search["']/i.test(text) && !/<textarea\b/i.test(text);
    if (!skipFormSummary && !/velin-form-summary/i.test(text)) {
      issues.push({ code: 'a11y.missing-form-summary', severity: 'error', message: 'Form without velin-form-summary', fix: 'Add <velin-form-summary> before fields.' });
    }
    if (/placeholder=/.test(text) && !/<label\b/i.test(text)) {
      issues.push({ code: 'a11y.placeholder-only', severity: 'error', message: 'Possible placeholder-only fields', fix: 'Use visible <label> elements.' });
    }
  }

  if (/id="faq"|FAQ/i.test(text) && !/<(details|velin-accordion)\b/i.test(text)) {
    issues.push({ code: 'design.faq-not-disclosure', severity: 'warning', message: 'FAQ section without disclosure pattern', fix: 'Use velin-accordion or details/summary.' });
  }

  if (!isFragment && !/<title\b/i.test(text)) {
    issues.push({ code: 'seo.missing-title', severity: 'warning', message: 'Missing document title', fix: 'Add a descriptive <title>.' });
  }

  if (/style="[^"]*background:[^"]*#|color:#[0-9a-f]{3,8}/i.test(text)) {
    issues.push({ code: 'design.raw-hex', severity: 'warning', message: 'Raw hex colors detected', fix: 'Prefer --velin-color-* tokens.' });
  }

  if (/animation:\s*[^;]*infinite/i.test(text)) {
    issues.push({ code: 'perf.infinite-animation', severity: 'warning', message: 'Infinite animation found', fix: 'Avoid infinite motion; respect prefers-reduced-motion.' });
  }

  // Thin / junk page floors (anti false-confidence)
  const words = visibleWordCount(text);
  const hasMain = /<main\b/i.test(text);
  const mainEmpty = hasMain && /<main\b[^>]*>\s*<\/main>/i.test(text);
  const thin = !isFragment && (words < 40 || !hasMain || mainEmpty || h1.length === 0);

  if (!isFragment && words < 40) {
    issues.push({
      code: 'seo.thin-content',
      severity: 'warning',
      message: `Very little visible content (${words} words)`,
      fix: 'Add meaningful page copy, headings, and sections.',
    });
    issues.push({
      code: 'conversion.thin-page',
      severity: 'warning',
      message: 'Page is too thin to score conversion highly',
      fix: 'Add a clear offer, proof, and primary CTA path.',
    });
  }
  if (!isFragment && (!hasMain || mainEmpty)) {
    issues.push({
      code: 'seo.thin-content',
      severity: 'warning',
      message: hasMain ? 'Empty <main> landmark' : 'Missing <main> landmark',
      fix: 'Wrap primary content in <main>.',
    });
  }

  const plan = ctx.plan;
  if (plan?.sections && isMarketing) {
    const ids = plan.sections.map((s) => s.id);
    for (const need of ['hero', 'footer']) {
      if (!ids.includes(need) && /landing|lawyer|saas/i.test(plan.page?.id || '')) {
        issues.push({ code: `plan.missing-${need}`, severity: 'error', message: `Plan missing section ${need}`, fix: `Include ${need} in page template.` });
      }
    }
  }

  if (ctx.prompt && /steuerberater|lawyer|tax advisor/i.test(ctx.prompt)) {
    for (const need of ['services', 'testimonials', 'faq', 'contact']) {
      if (plan && !plan.sections.some((s) => s.id === need)) {
        issues.push({ code: `conversion.missing-${need}`, severity: 'error', message: `Professional-services page missing ${need}`, fix: `Add ${need} section.` });
      }
    }
  }

  const heroRules = loadConstraint('hero');
  if (heroRules && isMarketing && /velin-btn--primary/g.test(text)) {
    const heroCtas = countHeroCtas(text);
    if (heroCtas > 2) {
      issues.push({ code: 'design.hero-cta-max', severity: 'error', message: 'Hero exceeds 2 CTAs', fix: 'Keep at most two CTAs in the hero (real <a>/<button> only; scripts and code samples are ignored).' });
    }
  }

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;

  // Optimization heuristics (soft) — full vendor without production output hints
  const usesFullCss = /velinstyle\.min\.css|velinstyle\.css/i.test(text) && !/velin-production/i.test(text);
  const usesFullIife = /velinstyle-components\.min\.js/i.test(text);
  const unusedThemeLinks = [...text.matchAll(/themes\/([a-z0-9-]+)\.min\.css/gi)]
    .map((m) => m[1].toLowerCase());
  const themeAttrs = [...text.matchAll(/data-velin-theme\s*=\s*["']([^"']+)["']/gi)]
    .flatMap((m) => m[1].toLowerCase().split(/[\s,|]+/));
  const unusedThemes = unusedThemeLinks.filter((t) => themeAttrs.length && !themeAttrs.includes(t));

  if (usesFullCss && usesFullIife) {
    issues.push({
      code: 'optimization.full-bundle',
      severity: 'warning',
      message: 'Full CSS + components IIFE without production output',
      fix: 'Run `velinstyle build --production` and link dist/velin-production assets for publish.',
    });
  } else if (usesFullCss) {
    issues.push({
      code: 'optimization.full-css',
      severity: 'warning',
      message: 'Full VelinStyle CSS bundle linked',
      fix: 'Prefer production CSS from `velinstyle production` for go-live.',
    });
  }
  if (unusedThemes.length) {
    issues.push({
      code: 'optimization.unused-themes',
      severity: 'warning',
      message: `${unusedThemes.length} theme stylesheet(s) not referenced by data-velin-theme`,
      fix: `Remove unused theme links (${unusedThemes.slice(0, 5).join(', ')}) or run production theme trim.`,
    });
  }

  const optIssues = issues.filter((i) => i.code.startsWith('optimization'));
  const unusedComponentHint = [...text.matchAll(/<(velin-[a-z0-9-]+)\b/gi)].length;
  const classHits = [...text.matchAll(/\bvelin-[\w:-]+\b/g)].length;

  const score = (base, penalty) => Math.max(0, Math.round((base - penalty) * 10) / 10);

  let scores = {
    design: score(10, errors * 1.5 + warnings * 0.5),
    accessibility: score(10, issues.filter((i) => i.code.startsWith('a11y')).length * 2),
    seo: score(10, issues.filter((i) => i.code.startsWith('seo')).length * 2),
    performance: score(10, issues.filter((i) => i.code.startsWith('perf')).length * 2),
    conversion: score(10, issues.filter((i) => i.code.startsWith('conversion')).length * 2),
    visual: score(9, issues.filter((i) => i.code.startsWith('design')).length * 1.2),
    optimization: score(10, optIssues.length * 2 + (unusedThemes.length ? Math.min(3, unusedThemes.length * 0.5) : 0)),
  };

  if (thin) {
    // Cap soft categories so junk pages cannot claim 10/10
    scores.seo = Math.min(scores.seo, 4);
    scores.conversion = Math.min(scores.conversion, 4);
    scores.design = Math.min(scores.design, 6);
    scores.visual = Math.min(scores.visual, 5);
  }

  if (profile === 'app' || profile === 'docs') {
    // Conversion/SEO marketing heuristics are not the primary signal for app/docs shells
    scores.conversion = Math.min(scores.conversion, 6);
    if (profile === 'app') scores.seo = Math.min(scores.seo, 7);
  }

  const finalErrors = issues.filter((i) => i.severity === 'error').length;
  const finalWarnings = issues.filter((i) => i.severity === 'warning').length;

  const avg = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;
  const promptScore = Math.max(0, Math.min(10, avg - (ctx.plan?.warnings?.length ? 1 : 0)));

  const gate = finalErrors > 0 ? 'fail' : finalWarnings > 0 ? 'warn' : 'pass';

  return {
    version: 1,
    profile,
    promptScore,
    scores,
    issues,
    gate,
    optimization: {
      fullBundle: Boolean(usesFullCss && usesFullIife),
      unusedThemes: unusedThemes.length,
      componentTags: unusedComponentHint,
      classTokens: classHits,
    },
  };
}

export { PROFILES, detectProfile };
