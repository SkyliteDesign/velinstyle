/**
 * Prompt Engine — plan before HTML.
 * Order: Mensch → Framework → KI (page registry + section graphs).
 */
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { emitBlueprint } from './blueprint.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PKG_VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8')).version;

function readJson(rel) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function loadPages() {
  return readJson('core/meta/pages/registry.json')?.pages || [];
}

function loadSections() {
  return readJson('core/meta/sections/registry.json')?.sections || [];
}

function loadConstraintPack(id) {
  const file = join(ROOT, 'core/meta/design-constraints', `${id}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf-8'));
}

function mapSectionToBlueprint(sectionId) {
  const map = {
    hero: 'hero-section',
    'trust-bar': 'trust-bar',
    benefits: 'benefits-grid',
    services: 'services-grid',
    process: 'process-steps',
    testimonials: 'testimonials',
    pricing: 'pricing-table',
    faq: 'faq-section',
    contact: 'form-contact',
    cta: 'cta-band',
    footer: 'footer-simple',
    navbar: 'navbar-header',
  };
  return map[sectionId] || sectionId;
}

/**
 * @param {string} prompt
 */
export function analyzePrompt(prompt) {
  const lower = (prompt || '').toLowerCase();
  const pages = loadPages();
  let best = null;
  let bestScore = 0;
  for (const page of pages) {
    let score = 0;
    for (const kw of page.promptKeywords || []) {
      if (lower.includes(kw.toLowerCase())) score += kw.length;
    }
    if (score > bestScore) {
      bestScore = score;
      best = page;
    }
  }

  const audience =
    /patient|clinic|healthcare|praxis/i.test(prompt) ? 'patients'
      : /developer|docs|api/i.test(prompt) ? 'developers'
        : /buyer|shop|store/i.test(prompt) ? 'buyers'
          : 'prospects';

  const conversionGoal =
    /contact|beratung|consultation|anfrage|kontakt/i.test(prompt) ? 'contact form'
      : /signup|trial|register/i.test(prompt) ? 'signup'
        : best?.conversionGoal || 'lead';

  return {
    intent: best ? `page:${best.id}` : 'page:landing',
    targetAudience: audience,
    businessType: best?.businessType || 'general',
    pageGoal: best?.pageGoal || 'explain offer and convert',
    conversionGoal,
    pageId: best?.id || 'landing',
    confidence: bestScore > 0 ? 'high' : 'low',
  };
}

/**
 * @param {ReturnType<typeof analyzePrompt>} analysis
 * @param {string} prompt
 */
export function buildPlan(analysis, prompt) {
  const pages = loadPages();
  const sectionsMeta = loadSections();
  const page = pages.find((p) => p.id === analysis.pageId) || pages.find((p) => p.id === 'landing');
  const lower = (prompt || '').toLowerCase();

  const sections = [...(page?.requiredSections || [])];
  for (const opt of page?.optionalSections || []) {
    if (opt === 'pricing' && /pric|tarif|abo/i.test(lower) && !sections.includes(opt)) {
      sections.splice(Math.max(sections.length - 2, 0), 0, opt);
    }
    if (opt === 'trust-bar' && /trust|kunden|marken/i.test(lower) && !sections.includes(opt)) {
      sections.splice(1, 0, opt);
    }
    if (opt === 'process' && /process|ablauf|how it works|schritte/i.test(lower) && !sections.includes(opt)) {
      sections.splice(Math.min(4, sections.length), 0, opt);
    }
    if (opt === 'contact' && /contact|kontakt|formular/i.test(lower) && !sections.includes(opt)) {
      sections.splice(Math.max(sections.length - 1, 0), 0, opt);
    }
  }

  if (/kontakt|contact|formular|steuerberater|leistungen/i.test(lower) && !sections.includes('contact')) {
    sections.splice(Math.max(sections.length - 1, 0), 0, 'contact');
  }

  const uniqueSections = [...new Set(sections)];
  const resolved = uniqueSections.map((id) => {
    const meta = sectionsMeta.find((s) => s.id === id);
    return {
      id,
      role: meta?.role || id,
      blueprint: mapSectionToBlueprint(id),
      designRules: meta?.designRules || [],
      a11yRules: meta?.a11yRules || [],
      seoRules: meta?.seoRules || [],
    };
  });

  const constraints = ['hero', 'faq', 'contact']
    .map(loadConstraintPack)
    .filter(Boolean);

  return {
    version: 1,
    analysis,
    page: {
      id: page?.id,
      name: page?.name,
      seoIntent: page?.seoIntent,
      defaultTone: page?.defaultTone,
      recommendedComponents: page?.recommendedComponents || [],
    },
    sections: resolved,
    layout: {
      container: 'velin-container',
      density: ['dashboard', 'crm', 'erp'].includes(page?.id) ? 'data-dense' : 'comfortable',
    },
    designConstraints: constraints,
    accessibility: {
      checklist: [
        'One H1',
        'Labeled form fields',
        'Focus-visible controls',
        'Respect prefers-reduced-motion',
      ],
      risks: page?.accessibilityRisks || [],
    },
    seo: {
      intent: page?.seoIntent,
      notes: ['Meaningful H1', 'Section H2s', 'Descriptive link text'],
    },
    warnings: analysis.confidence === 'low'
      ? ['Low page-type confidence — defaulted to landing. Refine prompt with business type keywords.']
      : [],
  };
}

/**
 * @param {object} plan
 * @param {{ brand?: string, title?: string, cta?: string }} slots
 */
export function renderPlan(plan, slots = {}) {
  const parts = [];
  const missing = [];
  for (const section of plan.sections || []) {
    const emitId = section.blueprint || mapSectionToBlueprint(section.id);
    const r = emitBlueprint(emitId);
    if (!r.ok) {
      missing.push(`${section.id}: ${r.error}`);
      continue;
    }
    parts.push(r.text);
  }

  let html = parts.join('\n\n');
  if (slots.brand) html = html.replace(/\bBrand\b/g, slots.brand);
  if (slots.title) html = html.replace(/>Headline</g, `>${slots.title}<`);
  if (slots.cta) {
    html = html.replace(/Primary CTA/g, slots.cta);
    html = html.replace(/Request a consultation/g, slots.cta);
    html = html.replace(/Kontakt aufnehmen/g, slots.cta);
  }

  const doc = `<!DOCTYPE html>
<html lang="de" data-velin-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${slots.title || plan.page?.name || 'VelinStyle page'}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@birdapi/velinstyle@${PKG_VERSION}/dist/velinstyle.min.css">
</head>
<body>
${html}
<script type="module">
  import { bootFromDOM } from 'https://cdn.jsdelivr.net/npm/@birdapi/velinstyle@${PKG_VERSION}/+esm';
  bootFromDOM();
</script>
</body>
</html>
`;

  return { html: doc, missing };
}

/**
 * @param {string} prompt
 */
export function planFromPrompt(prompt) {
  if (!prompt?.trim()) return { ok: false, error: 'Prompt is required.' };
  const analysis = analyzePrompt(prompt);
  const plan = buildPlan(analysis, prompt);
  const slots = {
    brand: 'Brand',
    title: /steuerberater/i.test(prompt) ? 'Steuerberatung mit Klarheit' : 'Headline',
    cta: /kontakt|consultation|beratung/i.test(prompt) ? 'Kontakt aufnehmen' : 'Primary CTA',
  };
  const rendered = renderPlan(plan, slots);
  return {
    ok: true,
    analysis,
    plan,
    html: rendered.html,
    missing: rendered.missing,
    warnings: plan.warnings,
  };
}
