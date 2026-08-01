#!/usr/bin/env node
/**
 * Lightweight structural validation for 1.2.0 Design Intelligence data files
 * against schemas/ contracts (no Ajv dependency — required-field + type checks).
 *
 * Usage: node scripts/validate-intelligence-schemas.mjs [--json]
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const asJson = process.argv.includes('--json');
const problems = [];

function loadJson(rel) {
  const full = join(ROOT, rel);
  if (!existsSync(full)) {
    problems.push(`missing file: ${rel}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(full, 'utf-8'));
  } catch (err) {
    problems.push(`invalid JSON ${rel}: ${err.message}`);
    return null;
  }
}

function requireKeys(obj, keys, label) {
  for (const key of keys) {
    if (obj == null || obj[key] === undefined || obj[key] === null || obj[key] === '') {
      problems.push(`${label}: missing required "${key}"`);
    }
  }
}

function requireArray(obj, key, label) {
  if (!Array.isArray(obj?.[key])) problems.push(`${label}: "${key}" must be an array`);
}

const SCHEMA_FILES = [
  'schemas/component-knowledge.schema.json',
  'schemas/design-intelligence.schema.json',
  'schemas/design-constraint.schema.json',
  'schemas/design-rule.schema.json',
  'schemas/page-template.schema.json',
  'schemas/section.schema.json',
  'schemas/review-report.schema.json',
  'schemas/token-graph.schema.json',
  'schemas/utility.schema.json',
];

for (const rel of SCHEMA_FILES) {
  if (!existsSync(join(ROOT, rel))) problems.push(`missing schema: ${rel}`);
}

const componentsDoc = loadJson('core/meta/knowledge/components.json');
if (componentsDoc) {
  requireKeys(componentsDoc, ['version', 'components'], 'components.json');
  requireArray(componentsDoc, 'components', 'components.json');
  for (const node of componentsDoc.components || []) {
    const label = `component ${node?.id || '?'}`;
    requireKeys(node, ['id', 'kind', 'category', 'purpose', 'maturity'], label);
    if (node?.maturity && !['core', 'advanced', 'experimental'].includes(node.maturity)) {
      problems.push(`${label}: maturity must be core|advanced|experimental`);
    }
    if (node?.kind && !['web-component', 'css-component', 'pattern', 'helper'].includes(node.kind)) {
      problems.push(`${label}: invalid kind`);
    }
    if (node?.designIntelligence) {
      const di = node.designIntelligence;
      if (di.visualWeight != null && (typeof di.visualWeight !== 'number' || di.visualWeight < 1 || di.visualWeight > 5)) {
        problems.push(`${label}: designIntelligence.visualWeight must be 1–5`);
      }
    }
  }
}

const tokensDoc = loadJson('core/meta/knowledge/tokens.json');
if (tokensDoc) {
  requireKeys(tokensDoc, ['version', 'tokens'], 'tokens.json');
  requireArray(tokensDoc, 'tokens', 'tokens.json');
  const names = new Set();
  for (const tok of tokensDoc.tokens || []) {
    const label = `token ${tok?.name || '?'}`;
    requireKeys(tok, ['name', 'layer', 'usage'], label);
    if (tok?.layer && !['core', 'semantic', 'component'].includes(tok.layer)) {
      problems.push(`${label}: layer must be core|semantic|component`);
    }
    if (tok?.name) names.add(tok.name);
  }
  for (const tok of tokensDoc.tokens || []) {
    for (const peer of tok.pairsWith || []) {
      if (!names.has(peer)) problems.push(`token ${tok.name}: pairsWith unknown "${peer}"`);
    }
  }
  for (const required of ['space-8', 'space-10', 'space-12', 'color-text', 'color-surface', 'color-primary']) {
    if (!names.has(required)) problems.push(`tokens.json missing referenced token "${required}"`);
  }
}

const pagesDoc = loadJson('core/meta/pages/registry.json');
const sectionsDoc = loadJson('core/meta/sections/registry.json');
const sectionIds = new Set((sectionsDoc?.sections || []).map((s) => s.id));

if (pagesDoc) {
  requireKeys(pagesDoc, ['version', 'pages'], 'pages/registry.json');
  requireArray(pagesDoc, 'pages', 'pages/registry.json');
  for (const page of pagesDoc.pages || []) {
    const label = `page ${page?.id || '?'}`;
    requireKeys(page, ['id', 'name', 'requiredSections'], label);
    requireArray(page, 'requiredSections', label);
    for (const sid of page.requiredSections || []) {
      if (!sectionIds.has(sid)) problems.push(`${label}: requiredSection "${sid}" not in sections registry`);
    }
    for (const sid of page.optionalSections || []) {
      if (!sectionIds.has(sid)) problems.push(`${label}: optionalSection "${sid}" not in sections registry`);
    }
  }
}

if (sectionsDoc) {
  requireKeys(sectionsDoc, ['version', 'sections'], 'sections/registry.json');
  requireArray(sectionsDoc, 'sections', 'sections/registry.json');
  const blueprintsDir = join(ROOT, 'cli', 'blueprints');
  for (const section of sectionsDoc.sections || []) {
    const label = `section ${section?.id || '?'}`;
    requireKeys(section, ['id', 'role'], label);
    if (section?.blueprintFile) {
      const bp = join(blueprintsDir, section.blueprintFile);
      if (!existsSync(bp)) problems.push(`${label}: blueprint missing cli/blueprints/${section.blueprintFile}`);
    }
  }
}

const constraintDir = join(ROOT, 'core', 'meta', 'design-constraints');
if (existsSync(constraintDir)) {
  for (const file of readdirSync(constraintDir).filter((f) => f.endsWith('.json'))) {
    const pack = loadJson(`core/meta/design-constraints/${file}`);
    if (!pack) continue;
    const label = `constraint ${file}`;
    requireKeys(pack, ['id', 'target', 'rules'], label);
    requireArray(pack, 'rules', label);
    for (const rule of pack.rules || []) {
      requireKeys(rule, ['id', 'rule', 'severity'], `${label} rule`);
    }
  }
}

const ok = problems.length === 0;
if (asJson) {
  console.log(JSON.stringify({ ok, problems }, null, 2));
} else {
  console.log(ok ? 'Intelligence schema check OK' : `Intelligence schema check found ${problems.length} issue(s)`);
  for (const p of problems) console.log(`  - ${p}`);
}
process.exit(ok ? 0 : 1);
