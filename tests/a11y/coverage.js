import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { WCAG_AAA_CRITERIA } from '../../cli/docgen/extract-a11y.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..', '..');

function loadContracts() {
  const path = join(PKG_ROOT, 'core', 'a11y', 'component-contracts.json');
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function scoreContracts(contracts) {
  const entries = Object.values(contracts.components || {});
  if (!entries.length) return { pass: 0, total: 0, pct: 0 };
  const pass = entries.filter((c) => c.status === 'pass').length;
  const partial = entries.filter((c) => c.status === 'partial').length;
  const total = entries.length;
  const pct = Math.round(((pass + partial * 0.5) / total) * 100);
  return { pass, partial, total, pct };
}

function scoreCriteria() {
  const pass = WCAG_AAA_CRITERIA.filter((c) => c.status === 'pass').length;
  const partial = WCAG_AAA_CRITERIA.filter((c) => c.status === 'partial').length;
  const total = WCAG_AAA_CRITERIA.length;
  const pct = Math.round(((pass + partial * 0.5) / total) * 100);
  return { pass, partial, total, pct };
}

async function runAxeSummary() {
  const reportPath = join(PKG_ROOT, 'tests', 'a11y', '.axe-summary.json');
  if (!existsSync(reportPath)) return null;
  try {
    return JSON.parse(readFileSync(reportPath, 'utf-8'));
  } catch {
    return null;
  }
}

export async function computeCoverage() {
  const contracts = loadContracts();
  const comp = scoreContracts(contracts);
  const crit = scoreCriteria();
  const axe = await runAxeSummary();
  const overall = Math.round((comp.pct * 0.5 + crit.pct * 0.3 + (axe?.pct ?? crit.pct) * 0.2));
  return {
    wcagLevel: contracts.wcagLevel,
    overall,
    components: comp,
    criteria: crit,
    axe,
  };
}

async function main() {
  const cov = await computeCoverage();
  console.log('VelinStyle framework A11y coverage');
  console.log(`  Target level: ${cov.wcagLevel}`);
  console.log(`  Overall score: ${cov.overall}%`);
  console.log(`  Components: ${cov.components.pass} pass, ${cov.components.partial} partial / ${cov.components.total} (${cov.components.pct}%)`);
  console.log(`  WCAG criteria: ${cov.criteria.pass} pass, ${cov.criteria.partial} partial / ${cov.criteria.total} (${cov.criteria.pct}%)`);
  if (cov.axe) {
    console.log(`  Axe pages: ${cov.axe.passed}/${cov.axe.total} (${cov.axe.pct}%)`);
  } else {
    console.log('  Axe: run npm run test:a11y first for page results');
  }
  const minScore = Number(process.env.VELIN_A11Y_MIN_COVERAGE || 0);
  if (minScore > 0 && cov.overall < minScore) {
    console.error(`Coverage ${cov.overall}% below minimum ${minScore}%`);
    process.exit(1);
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
