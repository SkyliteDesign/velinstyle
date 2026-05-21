#!/usr/bin/env node
/**
 * CI gates: bundle size, search index drift, types file, component loaders drift.
 */
import { readFileSync, statSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const MAX_BUNDLE_JS = 200 * 1024;
const MAX_BUNDLE_CSS = 170 * 1024;

function fail(msg) {
  console.error(`CI check failed: ${msg}`);
  process.exit(1);
}

const jsPath = join(ROOT, 'dist/velinstyle-components.min.js');
const cssPath = join(ROOT, 'dist/velinstyle.min.css');
const typesPath = join(ROOT, 'dist/velinstyle.d.ts');
const loadersPath = join(ROOT, 'components/runtime/component-loaders.js');

if (!existsSync(jsPath)) fail('Run npm run build first');
const jsKb = statSync(jsPath).size;
const cssKb = statSync(cssPath).size;
if (jsKb > MAX_BUNDLE_JS) fail(`JS bundle ${jsKb} > ${MAX_BUNDLE_JS}`);
if (cssKb > MAX_BUNDLE_CSS) fail(`CSS bundle ${cssKb} > ${MAX_BUNDLE_CSS}`);
console.log(`Bundle OK: JS ${(jsKb / 1024).toFixed(1)} KB, CSS ${(cssKb / 1024).toFixed(1)} KB`);

if (!existsSync(typesPath)) fail('Missing dist/velinstyle.d.ts — run npm run build:types');
console.log('Types OK');

execSync('node scripts/generate-component-loaders.mjs', { cwd: ROOT, stdio: 'inherit' });
try {
  execSync(`git diff --exit-code ${loadersPath}`, { cwd: ROOT, stdio: 'pipe' });
} catch {
  fail('component-loaders.js out of date — run npm run build:loaders and commit');
}
const loaders = readFileSync(loadersPath, 'utf-8');
const count = (loaders.match(/^\s+'velin-/gm) || []).length;
if (count < 36) fail(`Expected >= 36 loaders, got ${count}`);
console.log(`Loaders OK: ${count} entries`);

function normalizeJsonTimestamp(path) {
  const data = JSON.parse(readFileSync(path, 'utf-8'));
  delete data.generatedAt;
  return JSON.stringify(data);
}

const indexPath = join(ROOT, 'dist/search-index.json');
const beforeIndex = normalizeJsonTimestamp(indexPath);
execSync('npm run search:index', { cwd: ROOT, stdio: 'pipe' });
const afterIndex = normalizeJsonTimestamp(indexPath);
if (beforeIndex !== afterIndex) {
  fail('dist/search-index.json out of date — commit after npm run search:index');
}
console.log('Search index OK');

const agentPath = join(ROOT, 'dist/velin-agent.json');
const llmsPath = join(ROOT, 'dist/llms.txt');
if (!existsSync(agentPath)) fail('Missing dist/velin-agent.json — run npm run meta:build');
const beforeAgent = normalizeJsonTimestamp(agentPath);
const beforeLlms = readFileSync(llmsPath, 'utf-8');
execSync('npm run meta:build', { cwd: ROOT, stdio: 'pipe' });
const afterAgent = normalizeJsonTimestamp(agentPath);
const afterLlms = readFileSync(llmsPath, 'utf-8');
if (beforeAgent !== afterAgent) {
  fail('dist/velin-agent.json out of date — run npm run meta:build and commit');
}
if (beforeLlms !== afterLlms) {
  fail('dist/llms.txt out of date — run npm run meta:build and commit');
}
console.log('Velin-Meta OK');

console.log('All CI checks passed');
