/**
 * Prompt-based scaffolding: plan-first for pages; recipe fallback for fragments.
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { emitBlueprint } from './blueprint.js';
import { auditHtml, suggestFromIssues } from './layout-audit.js';
import { planFromPrompt, analyzePrompt } from './prompt-engine.js';
import { reviewHtml } from './review.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RECIPES_PATH = join(__dirname, 'scaffold-recipes.json');

function loadRecipes() {
  return JSON.parse(readFileSync(RECIPES_PATH, 'utf-8'));
}

/**
 * Fragment intents (navbar, modal, …) stay recipe-based.
 * Full pages go through the Prompt Engine (plan → render → review).
 * Low-confidence hero-only fallback is removed in favor of page planning.
 * @param {string} prompt
 */
function isPagePrompt(prompt) {
  const recipes = loadRecipes();
  const lower = (prompt || '').toLowerCase();

  const pageHints = [
    'landing page', 'landingpage', 'homepage', 'website', 'webseite',
    'steuerberater', 'lawyer', 'kanzlei', 'tax advisor', 'attorney',
    'clinic', 'healthcare', 'praxis', 'restaurant', 'saas', 'portfolio',
    'agency', 'corporate', 'shop', 'online store', 'blog post page',
    'course landing', 'community site', 'event page', 'page for',
  ];
  if (pageHints.some((h) => lower.includes(h))) return true;

  let bestRecipe = { id: null, score: 0 };
  for (const [id, def] of Object.entries(recipes.intents)) {
    let score = 0;
    for (const kw of def.keywords) {
      if (lower.includes(kw.toLowerCase())) score += kw.length;
    }
    if (score > bestRecipe.score) bestRecipe = { id, score };
  }

  const fragmentIds = new Set([
    'navbar', 'modal', 'card', 'dashboard', 'login', 'footer', 'pricing', 'empty', 'table', 'onboarding',
  ]);
  if (bestRecipe.id && fragmentIds.has(bestRecipe.id) && bestRecipe.score >= 5) {
    return false;
  }

  // Hero-only recipe with "landing" keyword but no full-page phrasing → still plan a page
  if (bestRecipe.id === 'hero' && /landing|homepage|website|webseite|seite/i.test(prompt)) {
    return true;
  }

  const analysis = analyzePrompt(prompt);
  return analysis.confidence === 'high' && !fragmentIds.has(analysis.pageId);
}

/**
 * @param {string} prompt
 */
export function parseIntent(prompt) {
  if (isPagePrompt(prompt)) {
    const analysis = analyzePrompt(prompt);
    return { id: analysis.pageId || 'landing', confidence: analysis.confidence, mode: 'plan' };
  }

  const recipes = loadRecipes();
  const lower = prompt.toLowerCase();
  let best = { id: recipes.fallback.intent, confidence: recipes.fallback.confidence, score: 0 };

  for (const [id, def] of Object.entries(recipes.intents)) {
    let score = 0;
    for (const kw of def.keywords) {
      if (lower.includes(kw.toLowerCase())) score += kw.length;
    }
    if (score > best.score) {
      best = { id, confidence: def.confidence || 'medium', score };
    }
  }

  return { id: best.id, confidence: best.score > 0 ? best.confidence : 'low', mode: 'recipe' };
}

/**
 * @param {string} prompt
 */
export function extractSlots(prompt) {
  const recipes = loadRecipes();
  const lower = prompt.toLowerCase();
  const slots = {
    brand: 'Brand',
    title: 'Welcome',
    cta: 'Get started',
    columns: 3,
  };

  const brandMatch = prompt.match(/(?:brand|logo|marke)\s*[:\-]?\s*["']?([^"'\n,]+)/i);
  if (brandMatch) slots.brand = brandMatch[1].trim();

  const titleMatch = prompt.match(/(?:title|titel|heading)\s*[:\-]?\s*["']?([^"'\n]+)/i);
  if (titleMatch) slots.title = titleMatch[1].trim();

  const colMatch = lower.match(/(\d+)\s*(?:spalten|columns|cols|karten|cards)/);
  if (colMatch) slots.columns = Math.min(12, Math.max(1, parseInt(colMatch[1], 10)));

  for (const [slot, keys] of Object.entries(recipes.slots || {})) {
    if (keys.some((k) => lower.includes(k)) && slot === 'cta') {
      slots.cta = 'Get started';
    }
  }

  if (/suche|search/i.test(prompt)) slots.includeSearch = true;

  return slots;
}

/**
 * @param {string} intentId
 * @param {{ prompt?: string, slots?: object }} options
 */
export function resolveBlueprints(intentId, options = {}) {
  const recipes = loadRecipes();
  const def = recipes.intents[intentId] || recipes.intents[recipes.fallback.intent];
  const ids = [...def.blueprints];

  const lower = (options.prompt || '').toLowerCase();
  if (def.optionalIf) {
    for (const [key, bps] of Object.entries(def.optionalIf)) {
      if (lower.includes(key)) ids.push(...bps);
    }
  }
  if (options.slots?.includeSearch && intentId === 'navbar' && !ids.includes('search-field')) {
    ids.push('search-field');
  }

  return [...new Set(ids)];
}

function applySlots(html, slots) {
  let out = html;
  out = out.replace(/\bBrand\b/g, slots.brand);
  out = out.replace(/Card one/gi, `${slots.title} — 1`);
  out = out.replace(/Welcome/gi, slots.title);
  out = out.replace(/Get started/gi, slots.cta);
  return out;
}

/**
 * @param {string} prompt
 * @param {{ pkgRoot?: string }} options
 */
export function scaffoldFromPrompt(prompt, options = {}) {
  if (!prompt || !prompt.trim()) {
    return { ok: false, error: 'Prompt is required.' };
  }

  if (isPagePrompt(prompt)) {
    const planned = planFromPrompt(prompt);
    if (!planned.ok) return planned;

    const review = reviewHtml(planned.html, { plan: planned.plan, prompt });
    const banner =
      `<!-- Generated by velinstyle scaffold (1.2.0) — mode: plan, page: ${planned.plan.page?.id}, confidence: ${planned.analysis.confidence} -->\n` +
      `<!-- Sections: ${(planned.plan.sections || []).map((s) => s.id).join(', ')} — run: velinstyle review -->\n`;

    const fullHtml = banner + planned.html;
    const issues = auditHtml(fullHtml);
    const responsiveHints = suggestFromIssues(issues);

    return {
      ok: true,
      mode: 'plan',
      intent: planned.plan.page?.id || planned.analysis.pageId,
      confidence: planned.analysis.confidence,
      blueprints: (planned.plan.sections || []).map((s) => s.blueprint),
      plan: planned.plan,
      analysis: planned.analysis,
      review,
      html: fullHtml,
      slots: {
        brand: 'Brand',
        title: /steuerberater/i.test(prompt) ? 'Steuerberatung mit Klarheit' : 'Headline',
        cta: /kontakt|consultation|beratung/i.test(prompt) ? 'Kontakt aufnehmen' : 'Primary CTA',
      },
      missing: planned.missing,
      warnings: planned.warnings,
      responsiveHints,
      nextSteps: ['velinstyle review <file>', 'velinstyle layout suggest <file>', 'velinstyle scan <file>'],
    };
  }

  const intent = parseIntent(prompt);
  // No silent hero-only fallback — unknown prompts plan a landing page.
  if (intent.mode !== 'plan' && intent.id === 'hero' && intent.confidence === 'low') {
    const planned = planFromPrompt(prompt);
    if (!planned.ok) return planned;
    const review = reviewHtml(planned.html, { plan: planned.plan, prompt });
    const fullHtml =
      `<!-- Generated by velinstyle scaffold (1.2.0) — mode: plan-fallback, page: ${planned.plan.page?.id} -->\n` +
      planned.html;
    return {
      ok: true,
      mode: 'plan',
      intent: planned.plan.page?.id || 'landing',
      confidence: planned.analysis.confidence,
      blueprints: (planned.plan.sections || []).map((s) => s.blueprint),
      plan: planned.plan,
      analysis: planned.analysis,
      review,
      html: fullHtml,
      slots: extractSlots(prompt),
      missing: planned.missing,
      warnings: [...(planned.warnings || []), 'Used page planner instead of silent hero fallback.'],
      responsiveHints: suggestFromIssues(auditHtml(fullHtml)),
      nextSteps: ['velinstyle review <file>', 'velinstyle layout suggest <file>', 'velinstyle scan <file>'],
    };
  }

  const slots = extractSlots(prompt);
  const blueprintIds = resolveBlueprints(intent.id, { prompt, slots });

  const parts = [];
  for (const id of blueprintIds) {
    const r = emitBlueprint(id, {});
    if (!r.ok) {
      return { ok: false, error: r.error };
    }
    parts.push(r.text);
  }

  let html = parts.join('\n\n');
  html = applySlots(html, slots);

  const banner =
    `<!-- Generated by velinstyle scaffold (1.2.0) — mode: recipe, intent: ${intent.id}, confidence: ${intent.confidence} -->\n` +
    `<!-- Blueprints: ${blueprintIds.join(', ')} — run: velinstyle layout suggest & velinstyle scan -->\n`;

  const fullHtml = banner + html;
  const issues = auditHtml(fullHtml);
  const responsiveHints = suggestFromIssues(issues);
  const review = reviewHtml(fullHtml, { prompt });

  return {
    ok: true,
    mode: 'recipe',
    intent: intent.id,
    confidence: intent.confidence,
    blueprints: blueprintIds,
    html: fullHtml,
    slots,
    review,
    responsiveHints,
    nextSteps: ['velinstyle review <file>', 'velinstyle layout suggest <file>', 'velinstyle scan <file>'],
  };
}

export function listIntents() {
  const recipes = loadRecipes();
  return Object.entries(recipes.intents).map(([id, def]) => ({
    id,
    keywords: def.keywords,
    blueprints: def.blueprints,
    confidence: def.confidence,
  }));
}
