#!/usr/bin/env node
/**
 * Regression: chaos + misses fixtures must trigger Round-3/4 detection rules.
 */
import { spawnSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const FIXTURES = join(ROOT, 'fixtures');
const SANDBOX_FIXTURES = join(ROOT, '..', 'VelinStyle_Live_test_sandbox', 'fixtures');

function resolveFixture(...names) {
  for (const base of [FIXTURES, SANDBOX_FIXTURES]) {
    for (const name of names) {
      const p = join(base, name);
      if (existsSync(p)) return p;
    }
  }
  return join(FIXTURES, names[0]);
}

const CHAOS = {
  path: resolveFixture('broken-chaos.html', 'chaos.html'),
  required: [
    'a11y/duplicate-id',
    'css/unknown-velin-class',
    'wc/invalid-attribute',
    'security/no-document-write',
    'a11y/target-size-min',
  ],
};

const MISSES = {
  path: resolveFixture('misses.html'),
  required: [
    'a11y/nested-interactive',
    'a11y/contrast-inline',
    'a11y/role-button-contract',
  ],
};

function scanJson(file) {
  const r = spawnSync(
    process.execPath,
    [join(ROOT, 'cli/index.js'), 'scan', file, '--format', 'json', '--severity', 'info'],
    { encoding: 'utf-8', cwd: ROOT },
  );
  try {
    return JSON.parse(r.stdout || '{}');
  } catch {
    console.error('Failed to parse scan JSON for', file, '\n', r.stdout, r.stderr);
    process.exit(1);
  }
}

function assertRules(label, file, required) {
  if (!existsSync(file)) {
    console.error(`Missing fixture: ${file}`);
    process.exit(1);
  }
  const payload = scanJson(file);
  const rules = new Set((payload.issues || []).map((i) => i.rule));
  const missing = required.filter((id) => !rules.has(id));
  if (missing.length) {
    console.error(`${label} FAILED — missing rules:`, missing.join(', '));
    console.error('Seen:', [...rules].sort().join(', '));
    process.exit(1);
  }
  console.log(`${label} OK (${required.length} rules, ${payload.total} issues).`);
}

const chaosPath = CHAOS.path;
assertRules('Chaos detection', chaosPath, CHAOS.required);
assertRules('Misses detection', MISSES.path, MISSES.required);
