import { describe, it, expect } from 'vitest';
import { execFileSync } from 'child_process';
import { mkdirSync, rmSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '..');
const SCRIPT = join(ROOT, 'scripts', 'check-release-sync.mjs');
const VERSION = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8')).version;

function runGuard(args = []) {
  const out = execFileSync('node', [SCRIPT, '--json', '--warn-only', ...args], {
    cwd: ROOT,
    encoding: 'utf-8',
  });
  return JSON.parse(out);
}

describe('release sync guard', () => {
  it('reports the framework version as the source of truth', () => {
    const report = runGuard(['--skip-site']);
    expect(report.version).toBe(VERSION);
    expect(report.siteChecked).toBe(false);
  });

  it('finds no drift in framework-owned version surfaces', () => {
    const report = runGuard(['--skip-site']);
    const failed = report.results.filter((r) => !r.ok);
    expect(failed.map((r) => `${r.name}: ${r.problems.join('; ')}`)).toEqual([]);
  });

  it('keeps CLI manifest and a11y contracts on the released version', () => {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'cli', 'cli-manifest.json'), 'utf-8'));
    const contracts = JSON.parse(readFileSync(join(ROOT, 'core', 'a11y', 'component-contracts.json'), 'utf-8'));
    expect(manifest.version).toBe(VERSION);
    expect(contracts.version).toBe(VERSION);
  });

  it('derives the CLI banner version instead of hardcoding it', () => {
    const cli = readFileSync(join(ROOT, 'cli', 'index.js'), 'utf-8');
    expect(cli).not.toMatch(/VelinStyle CLI'\)\}\s*v\d+\.\d+\.\d+/);
    const help = execFileSync('node', [join(ROOT, 'cli', 'index.js'), '--help'], { encoding: 'utf-8' });
    expect(help).toContain(`v${VERSION}`);
  });

  it('documents the released version in the changelog', () => {
    const changelog = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf-8');
    expect(changelog).toMatch(new RegExp(`^## \\[${VERSION.replace(/\./g, '\\.')}\\]`, 'm'));
  });

  it('checks component counts against the agent bundle', () => {
    const report = runGuard(['--skip-site']);
    const names = report.results.map((r) => r.name);
    expect(names).toContain('Canonical component count');
    expect(names).toContain('Lazy-loader component count');
  });

  it('ignores dot-directories so other tools scratch space cannot break it', () => {
    const scratch = join(ROOT, 'tests', '.tmp-release-sync');
    mkdirSync(scratch, { recursive: true });
    // Assembled at runtime so this file does not itself contain a stale pin.
    const stalePin = ['@birdapi', '/velinstyle', '@0.1.0'].join('');
    writeFileSync(join(scratch, 'stale.html'), `<p>${stalePin}</p>`);
    try {
      const report = runGuard(['--skip-site']);
      const pins = report.results.find((r) => r.name === 'Framework install pins');
      expect(pins.problems).toEqual([]);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });

  it('quotes the published component counts in both READMEs', () => {
    const bundle = JSON.parse(readFileSync(join(ROOT, 'dist', 'velin-agent.json'), 'utf-8'));
    const { count, loaderCount } = bundle.components;
    for (const file of ['README.md', 'README.de.md']) {
      const text = readFileSync(join(ROOT, file), 'utf-8');
      expect(text, file).toContain(`**${count} `);
      expect(text, file).toContain(`(${loaderCount} `);
    }
  });
});
