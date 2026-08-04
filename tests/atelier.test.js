import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, existsSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { fileURLToPath } from 'url';
import {
  resolveAtelierEntry,
  resolveAtelierList,
  listAtelierEntries,
  pullAtelier,
  composeAtelierPage,
  planFromAtelierList,
} from '../cli/atelier.js';
import { emitFormatShell, normalizeFormat, LIMITATION_EN } from '../cli/atelier-formats.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_LIBRARY = join(__dirname, '../cli/__fixtures__/atelier-library');

describe('atelier resolve', () => {
  it('resolves 36 → 36-calendar', () => {
    const r = resolveAtelierEntry('36');
    expect(r.ok).toBe(true);
    expect(r.entry.id).toBe('36-calendar');
    expect(r.entry.num).toBe('36');
  });

  it('resolves 036 padded', () => {
    const r = resolveAtelierEntry('036');
    expect(r.ok).toBe(true);
    expect(r.entry.id).toBe('36-calendar');
  });

  it('does not treat 3600 as curated short number', () => {
    const r = resolveAtelierEntry('3600');
    expect(r.ok).toBe(false);
  });

  it('resolves exact id', () => {
    const r = resolveAtelierEntry('01-login');
    expect(r.ok).toBe(true);
    expect(r.entry.num).toBe('01');
  });

  it('lists catalog entries', () => {
    const r = listAtelierEntries();
    expect(r.ok).toBe(true);
    expect(r.items.length).toBeGreaterThanOrEqual(200);
  });
});

describe('atelier formats', () => {
  it('rejects unknown format', () => {
    expect(normalizeFormat('svelte').ok).toBe(false);
  });

  it('emits vue shell with mount', () => {
    const r = emitFormatShell({ id: '04-pricing', title: 'Pricing', assetDir: '.', format: 'vue' });
    expect(r.ok).toBe(true);
    expect(r.files['04-pricing.vue']).toMatch(/data-velin-atelier-mount/);
    expect(r.files['04-pricing.vue']).toMatch(/04-pricing/);
  });

  it('emits blade shell with mount', () => {
    const r = emitFormatShell({ id: '01-login', title: 'Login', assetDir: 'public/velin/01-login', format: 'blade' });
    expect(r.ok).toBe(true);
    expect(r.files['01-login.blade.php']).toMatch(/data-velin-atelier-mount/);
  });
});

describe('atelier pull + compose (fixture)', () => {
  let tmp;

  it('pulls 04 from fixture with limitation README', async () => {
    tmp = mkdtempSync(join(tmpdir(), 'velin-atelier-'));
    const out = join(tmp, '04-pricing');
    const r = await pullAtelier('04', {
      from: FIXTURE_LIBRARY,
      output: out,
      format: 'html',
    });
    expect(r.ok).toBe(true);
    expect(existsSync(join(out, 'app.js'))).toBe(true);
    expect(existsSync(join(out, 'index.html'))).toBe(true);
    const readme = readFileSync(join(out, 'README.md'), 'utf-8');
    expect(readme).toMatch(/Limitation/i);
    expect(readme).toContain('planned');
  });

  it('pulls with vue format shell', async () => {
    tmp = mkdtempSync(join(tmpdir(), 'velin-atelier-'));
    const out = join(tmp, '01-login');
    const r = await pullAtelier('01', {
      from: FIXTURE_LIBRARY,
      output: out,
      format: 'vue',
    });
    expect(r.ok).toBe(true);
    expect(existsSync(join(out, '01-login.vue'))).toBe(true);
    const vue = readFileSync(join(out, '01-login.vue'), 'utf-8');
    expect(vue).toMatch(/data-velin-atelier-mount/);
    expect(LIMITATION_EN).toMatch(/integration shell/i);
  });

  it('composes scaffold --atelier 04,01 from fixture', async () => {
    tmp = mkdtempSync(join(tmpdir(), 'velin-atelier-'));
    const out = join(tmp, 'compose.html');
    const r = await composeAtelierPage('04,01', {
      from: FIXTURE_LIBRARY,
      output: out,
    });
    expect(r.ok).toBe(true);
    expect(r.entries.map((e) => e.id)).toEqual(['04-pricing', '01-login']);
    const html = readFileSync(out, 'utf-8');
    expect(html).toMatch(/04-pricing/);
    expect(html).toMatch(/01-login/);
    expect(html).toMatch(/atelier-compose/);
    expect(existsSync(join(tmp, 'atelier-assets', '04-pricing', 'app.js'))).toBe(true);
    expect(existsSync(join(tmp, 'atelier-assets', '01-login', 'app.js'))).toBe(true);
    const readme = readFileSync(join(tmp, 'README.md'), 'utf-8');
    expect(readme).toMatch(/Limitation/i);
  });

  it('planFromAtelierList includes atelier refs', () => {
    const r = planFromAtelierList('04,36');
    expect(r.ok).toBe(true);
    expect(r.plan.sections).toHaveLength(2);
    expect(r.plan.sections[0].atelierId).toBe('04-pricing');
    expect(r.plan.sections[1].atelierId).toBe('36-calendar');
    expect(r.plan.maturity).toBe('beta');
  });

  it('resolveAtelierList fails on unknown', () => {
    const r = resolveAtelierList('04,999');
    expect(r.ok).toBe(false);
  });
});
