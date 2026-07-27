#!/usr/bin/env node
/**
 * Release sync guard: keeps version-bearing surfaces in the framework and the
 * sibling velinstyle-site repo aligned with package.json.
 *
 * Only machine-readable surfaces are compared (meta blocks, JSON-LD, doc header
 * badges, install pins, generated docs). Prose that mentions historical
 * versions is intentionally ignored, so changelog-style notes stay intact.
 *
 * Usage: node scripts/check-release-sync.mjs [--json] [--warn-only] [--skip-site] [--fix]
 *
 * --fix rewrites the mechanical surfaces (version fields, install pins, meta
 * blocks, doc header badges, changelog copies). Checks that need a human or a
 * build step are always reported, never auto-fixed.
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE_ROOT = join(ROOT, '..', 'velinstyle-site');

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const warnOnly = args.includes('--warn-only');
const skipSite = args.includes('--skip-site');
const fixMode = args.includes('--fix');

const PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
const VERSION = PKG.version;
const PKG_NAME = PKG.name;

/** Directories never scanned for version pins. */
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'chunks', '.github', 'coverage', 'test-results']);

/**
 * Site paths excluded from install-pin checks: migration tooling and changelog
 * copies legitimately name older versions.
 */
const SITE_PIN_EXCLUDES = ['tools', 'CHANGELOG.md', join('docs', 'CHANGELOG.md'), join('docs', 'generated')];

const results = [];
const fixes = [];

/**
 * @param {string} name
 * @param {string[]} problems
 */
function record(name, problems) {
  results.push({ name, ok: problems.length === 0, problems });
}

/**
 * Rewrite a file when --fix is active; otherwise leave it untouched.
 * @param {string} full
 * @param {string} next
 * @param {string} label
 */
function applyFix(full, next, label) {
  if (!fixMode) return false;
  writeFileSync(full, next);
  fixes.push(label);
  return true;
}

/**
 * @param {string} dir
 * @param {(f: string) => boolean} match
 * @returns {string[]}
 */
function walk(dir, match) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    // Dot-directories hold VCS data and scratch space from other tooling.
    if (SKIP_DIRS.has(entry) || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    let isDir;
    try {
      isDir = statSync(full).isDirectory();
    } catch {
      continue; // Removed while we were walking.
    }
    if (isDir) out.push(...walk(full, match));
    else if (match(entry)) out.push(full);
  }
  return out;
}

/** @returns {string | null} null when the file vanished mid-scan. */
function readIfPresent(path) {
  try {
    return readFileSync(path, 'utf-8');
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

function read(path) {
  return readFileSync(path, 'utf-8');
}

function isExcludedSitePath(rel) {
  return SITE_PIN_EXCLUDES.some((ex) => rel === ex || rel.startsWith(ex + sep));
}

// ── Framework surfaces ───────────────────────────────────────────────────────

function checkJsonVersion(relPath, label) {
  const full = join(ROOT, relPath);
  if (!existsSync(full)) {
    record(label, [`${relPath} missing`]);
    return;
  }
  const text = read(full);
  const data = JSON.parse(text);
  if (data.version === VERSION) {
    record(label, []);
    return;
  }
  const next = text.replace(/("version":\s*")\d+\.\d+\.\d+(")/, `$1${VERSION}$2`);
  if (applyFix(full, next, `${relPath} version -> ${VERSION}`)) {
    record(label, []);
    return;
  }
  record(label, [`${relPath}: ${data.version} !== ${VERSION}`]);
}

function checkChangelogEntry() {
  const text = read(join(ROOT, 'CHANGELOG.md'));
  const problems = [];
  if (!new RegExp(`^## \\[${VERSION.replace(/\./g, '\\.')}\\]`, 'm').test(text)) {
    problems.push(`CHANGELOG.md has no released "## [${VERSION}]" section`);
  }
  record('CHANGELOG entry', problems);
}

/** Self-referencing install pins must never lag behind the released version. */
function checkInstallPins(root, label, excludeFn = () => false) {
  const pinSource = `${PKG_NAME.replace('/', '\\/')}@(\\d+\\.\\d+\\.\\d+)`;
  const files = walk(root, (f) => /\.(js|mjs|jsx|ts|json|md|html|py|css)$/.test(f));
  const problems = [];
  for (const file of files) {
    const rel = relative(root, file);
    if (rel === 'CHANGELOG.md' || excludeFn(rel)) continue;
    const text = readIfPresent(file);
    if (text === null) continue;
    const stale = [...text.matchAll(new RegExp(pinSource, 'g'))].filter((m) => m[1] !== VERSION);
    if (!stale.length) continue;
    const next = text.replace(new RegExp(pinSource, 'g'), `${PKG_NAME}@${VERSION}`);
    if (applyFix(file, next, `${rel}: ${stale.length} install pin(s) -> ${VERSION}`)) continue;
    for (const m of stale) problems.push(`${rel}: ${PKG_NAME}@${m[1]} !== ${VERSION}`);
  }
  record(label, [...new Set(problems)]);
}

/** The CLI banner is user-facing and must report the shipped version. */
function checkCliBanner() {
  const text = read(join(ROOT, 'cli', 'index.js'));
  const problems = [];
  for (const m of text.matchAll(/VelinStyle CLI'\)\}\s*v(\d+\.\d+\.\d+)/g)) {
    problems.push(`cli/index.js hardcodes CLI banner v${m[1]} instead of reading package.json`);
  }
  record('CLI banner version', problems);
}

function checkAgentBundle() {
  const full = join(ROOT, 'dist', 'velin-agent.json');
  if (!existsSync(full)) {
    record('Velin-Meta bundle version', []);
    return;
  }
  const data = JSON.parse(read(full));
  const version = data.framework?.version ?? data.version;
  record(
    'Velin-Meta bundle version',
    version === VERSION ? [] : [`dist/velin-agent.json: ${version} !== ${VERSION} — run npm run meta:build`],
  );
}

// ── Site surfaces ────────────────────────────────────────────────────────────

/**
 * Compare capture group 1 of every pattern against `expected` across one or more
 * documentation roots.
 *
 * @param {string} label
 * @param {string} expected
 * @param {{ source: string, replace: string, describe: (found: string) => string }[]} patterns
 * @param {{ roots?: { dir: string, exclude?: (rel: string) => boolean }[] }} [options]
 */
function checkDocPatterns(label, expected, patterns, { roots } = {}) {
  const scanned = roots ?? [{ dir: SITE_ROOT, exclude: isExcludedSitePath }];
  const problems = [];
  for (const { dir, exclude = () => false } of scanned) {
    for (const file of walk(dir, (f) => /\.(html|md)$/.test(f))) {
      const rel = relative(dir, file);
      if (exclude(rel)) continue;
      const text = readIfPresent(file);
      if (text === null) continue;
      const stale = [];
      let next = text;
      for (const { source, replace, describe } of patterns) {
        for (const m of text.matchAll(new RegExp(source, 'g'))) {
          if (m[1] !== expected) stale.push(`${rel}: ${describe(m[1])}`);
        }
        next = next.replace(new RegExp(source, 'g'), replace);
      }
      if (!stale.length) continue;
      if (applyFix(file, next, `${rel}: ${label} -> ${expected}`)) continue;
      problems.push(...stale);
    }
  }
  record(label, [...new Set(problems)]);
}

function checkSitePattern(label, source, describe, replace, { exclude } = {}) {
  const excludeRel = exclude
    ? (rel) => isExcludedSitePath(rel) || exclude(rel)
    : isExcludedSitePath;
  checkDocPatterns(label, VERSION, [{ source, describe, replace }], {
    roots: [{ dir: SITE_ROOT, exclude: excludeRel }],
  });
}

/** Canonical and lazy-loader component counts as published in the agent bundle. */
function componentCounts() {
  const full = join(ROOT, 'dist', 'velin-agent.json');
  if (!existsSync(full)) return null;
  const components = JSON.parse(read(full)).components ?? {};
  const canonical = Number(components.count);
  const loaders = Number(components.loaderCount);
  return canonical > 0 && loaders > 0 ? { canonical, loaders } : null;
}

/**
 * Component counts are quoted verbatim in marketing and doc prose. The patterns
 * below cover every phrasing currently in use, in English and German, so adding
 * a component cannot silently leave the site claiming the old number.
 */
function countPatterns(kind, n) {
  const sources =
    kind === 'canonical'
      ? [
          ['<strong>(\\d+) canonical</strong>', `<strong>${n} canonical</strong>`],
          ['<strong>(\\d+) kanonischen?</strong>', `<strong>${n} kanonische</strong>`],
          ['(\\d+) canonical Web Components', `${n} canonical Web Components`],
          ['(\\d+) canonical custom elements', `${n} canonical custom elements`],
          ['(\\d+) kanonische Web Components', `${n} kanonische Web Components`],
          ['(\\d+) Canonical Components', `${n} Canonical Components`],
          ['\\*\\*(\\d+) canonical\\*\\*', `**${n} canonical**`],
          ['\\*\\*(\\d+) kanonische\\*\\*', `**${n} kanonische**`],
          ['Component contracts \\((\\d+)\\)', `Component contracts (${n})`],
          ['(\\d+) Component Contracts', `${n} Component Contracts`],
          ['Component contract coverage \\((\\d+)/\\d+\\)', `Component contract coverage (${n}/${n})`],
          ['(\\d+)/\\d+ Contracts', `${n}/${n} Contracts`],
          ['(\\d+)/\\d+ component a11y contracts', `${n}/${n} component a11y contracts`],
          ['(\\d+)/\\d+ A11y-Component-Contracts', `${n}/${n} A11y-Component-Contracts`],
          [
            '(\\d+) web components in <code>core/a11y/component-contracts\\.json</code>',
            `${n} web components in <code>core/a11y/component-contracts.json</code>`,
          ],
          ['View all (\\d+) components', `View all ${n} components`],
          ['35\\+ CSS · (\\d+) WC', `35+ CSS · ${n} WC`],
          ['35\\+ CSS \\+ (\\d+) Web Components', `35+ CSS + ${n} Web Components`],
          ['35\\+ CSS components, (\\d+) Web Components', `35+ CSS components, ${n} Web Components`],
          [
            'to="(\\d+)" duration="1200"></velin-counter>&nbsp;web components',
            `to="${n}" duration="1200"></velin-counter>&nbsp;web components`,
          ],
        ]
      : [
          ['\\((\\d+) lazy-loader entries', `(${n} lazy-loader entries`],
          ['<strong>(\\d+)</strong> lazy-loader entries', `<strong>${n}</strong> lazy-loader entries`],
          ['\\((\\d+) lazy loaders\\)', `(${n} lazy loaders)`],
          ['\\((\\d+) Lazy-Loader-Einträge', `(${n} Lazy-Loader-Einträge`],
        ];
  return sources.map(([source, replace]) => ({
    source,
    replace,
    describe: (found) => `claims ${found} ${kind} components, expected ${n}`,
  }));
}

/** docs/generated is copied verbatim from the framework; any delta means a stale sync. */
function checkGeneratedDocsSync() {
  const fwDir = join(ROOT, 'docs', 'generated');
  const siteDir = join(SITE_ROOT, 'docs', 'generated');
  if (!existsSync(fwDir) || !existsSync(siteDir)) {
    record('Generated docs sync', [existsSync(fwDir) ? 'site docs/generated missing' : 'framework docs/generated missing']);
    return;
  }
  const problems = [];
  const fwFiles = walk(fwDir, (f) => f.endsWith('.md')).map((f) => relative(fwDir, f));
  for (const rel of fwFiles) {
    const sitePath = join(siteDir, rel);
    if (!existsSync(sitePath)) {
      problems.push(`missing on site: docs/generated/${rel.split(sep).join('/')}`);
    } else if (readIfPresent(join(fwDir, rel)) !== readIfPresent(sitePath)) {
      problems.push(`out of date on site: docs/generated/${rel.split(sep).join('/')}`);
    }
  }
  record('Generated docs sync', problems.length ? [...problems, 'run npm run sync:dist in velinstyle-site'] : []);
}

function checkSiteChangelogCopy() {
  const sourcePath = join(ROOT, 'CHANGELOG.md');
  const source = read(sourcePath);
  const problems = [];
  for (const rel of ['CHANGELOG.md', join('docs', 'CHANGELOG.md')]) {
    const full = join(SITE_ROOT, rel);
    const missing = !existsSync(full);
    if (!missing && read(full) === source) continue;
    if (fixMode) {
      copyFileSync(sourcePath, full);
      fixes.push(`site ${rel} <- framework CHANGELOG.md`);
      continue;
    }
    problems.push(missing ? `${rel} missing on site` : `${rel} differs from framework CHANGELOG.md`);
  }
  record('Site changelog copy', problems);
}

// ── Run ──────────────────────────────────────────────────────────────────────

checkJsonVersion(join('cli', 'cli-manifest.json'), 'CLI manifest version');
checkJsonVersion(join('core', 'a11y', 'component-contracts.json'), 'A11y contracts version');
checkChangelogEntry();
checkCliBanner();
checkAgentBundle();
checkInstallPins(ROOT, 'Framework install pins');

const siteChecked = !skipSite && existsSync(SITE_ROOT);
if (siteChecked) {
  checkSitePattern(
    'Site doc header badges',
    'velin-doc-header__version">v(\\d+\\.\\d+\\.\\d+)',
    (found) => `doc header badge v${found} !== v${VERSION}`,
    `velin-doc-header__version">v${VERSION}`,
  );
  checkSitePattern(
    'Site velin-meta blocks',
    '"version":\\s*"(\\d+\\.\\d+\\.\\d+)"',
    (found) => `velin-meta version ${found} !== ${VERSION}`,
    `"version": "${VERSION}"`,
  );
  checkSitePattern(
    'Site JSON-LD softwareVersion',
    '"softwareVersion":\\s*"(\\d+\\.\\d+\\.\\d+)"',
    (found) => `softwareVersion ${found} !== ${VERSION}`,
    `"softwareVersion": "${VERSION}"`,
  );
  checkDocPatterns('Site version badges', VERSION, [
    {
      source: 'site-nav__logo-version">v(\\d+\\.\\d+\\.\\d+)',
      replace: `site-nav__logo-version">v${VERSION}`,
      describe: (found) => `nav logo badge v${found} !== v${VERSION}`,
    },
    {
      source: 'hero__badge-livedot">v(\\d+\\.\\d+\\.\\d+)',
      replace: `hero__badge-livedot">v${VERSION}`,
      describe: (found) => `hero badge v${found} !== v${VERSION}`,
    },
    {
      source: 'pulse="true">v(\\d+\\.\\d+\\.\\d+)',
      replace: `pulse="true">v${VERSION}`,
      describe: (found) => `comparison card badge v${found} !== v${VERSION}`,
    },
  ]);
  checkInstallPins(SITE_ROOT, 'Site install pins', isExcludedSitePath);
  checkGeneratedDocsSync();
  checkSiteChangelogCopy();
}

const counts = componentCounts();
if (counts) {
  const roots = [{ dir: ROOT, exclude: (rel) => rel === 'CHANGELOG.md' }];
  if (siteChecked) roots.push({ dir: SITE_ROOT, exclude: isExcludedSitePath });
  checkDocPatterns('Canonical component count', String(counts.canonical), countPatterns('canonical', counts.canonical), { roots });
  checkDocPatterns('Lazy-loader component count', String(counts.loaders), countPatterns('lazy-loader', counts.loaders), { roots });
} else {
  record('Component counts', ['dist/velin-agent.json missing counts — run npm run meta:build']);
}

const failed = results.filter((r) => !r.ok);

if (asJson) {
  console.log(JSON.stringify({ version: VERSION, siteChecked, fixed: fixes, results }, null, 2));
} else {
  console.log(`Release sync check — ${PKG_NAME}@${VERSION}`);
  console.log(siteChecked ? `Site repo: ${SITE_ROOT}` : 'Site repo: not checked');
  for (const r of results) {
    console.log(`${r.ok ? '  OK  ' : ' FAIL '} ${r.name}`);
    for (const p of r.problems) console.log(`        - ${p}`);
  }
  if (fixes.length) {
    console.log(`Applied ${fixes.length} fix(es):`);
    for (const f of fixes) console.log(`        + ${f}`);
  }
  console.log(
    failed.length === 0
      ? 'Release sync OK'
      : `Release sync found ${failed.reduce((n, r) => n + r.problems.length, 0)} issue(s) in ${failed.length} check(s)`,
  );
}

if (failed.length && !warnOnly) process.exit(1);
