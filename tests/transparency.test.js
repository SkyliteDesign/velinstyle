import { describe, it, expect } from 'vitest';
import {
  normalizeDisclosure,
  deriveClaims,
  createRegistry,
  normalizePolicy,
  STRICT_MEDIA_POLICY,
  validateRecords,
  createTransparencyEngine,
  exportDisclosures,
  transparencyMigrate,
} from '../core/transparency/index.js';

describe('transparency claims + normalize', () => {
  it('derives ai.generated and review.human claims', () => {
    const claims = deriveClaims({ status: 'generated', review: 'human-reviewed', license: 'CC BY 4.0' });
    expect(claims).toContain('ai.generated');
    expect(claims).toContain('review.human');
    expect(claims).toContain('license.cc-by');
  });

  it('normalizes provenance and stable id', () => {
    const rec = normalizeDisclosure({
      type: 'ai',
      status: 'generated',
      review: 'human-reviewed',
      src: '/hero.png',
      tag: 'IMG',
      provenance: {
        createdAt: '2026-08-01',
        license: 'MIT',
        approvedBy: 'Sebastian',
      },
    }, { provider: 'html', file: 'index.html' });
    expect(rec.id).toMatch(/^tx-/);
    expect(rec.provenance.createdAt).toBe('2026-08-01');
    expect(rec.provenance.approvedBy).toBe('Sebastian');
    expect(rec.claims).toContain('ai.generated');
  });
});

describe('transparency registry + policy', () => {
  it('registers and exports', () => {
    const reg = createRegistry();
    const rec = normalizeDisclosure({ id: 'hero-image', type: 'ai', status: 'assisted' }, { provider: 'api' });
    reg.register(rec);
    expect(reg.size()).toBe(1);
    expect(reg.export().items[0].id).toBe('hero-image');
  });

  it('strict policy requires image provenance', () => {
    const policy = normalizePolicy(STRICT_MEDIA_POLICY);
    const rec = normalizeDisclosure({
      id: 'img-1',
      type: 'image',
      status: 'generated',
      tag: 'IMG',
      src: 'a.png',
    }, { provider: 'html' });
    const findings = validateRecords([rec], policy);
    expect(findings.some((f) => f.code === 'missing-provenance.createdAt')).toBe(true);
    expect(findings.some((f) => f.code === 'missing-provenance.license')).toBe(true);
  });
});

describe('transparency engine doctor/migrate/export', () => {
  const html = `
<!doctype html>
<html lang="en">
<body>
  <img id="hero" src="/hero.png" alt="Hero"
    velin-transparency
    velin-transparency-id="hero-image"
    velin-type="ai"
    velin-status="generated"
    velin-review="human-reviewed"
    velin-created-at="2026-08-01"
    velin-license="CC BY 4.0"
    velin-source="/hero.png"
    velin-approved-by="Sebastian">
  <img src="/missing.png" alt="No disclosure">
</body>
</html>`;

  it('doctors HTML and scores pillars', async () => {
    const engine = createTransparencyEngine({ policy: STRICT_MEDIA_POLICY });
    const report = await engine.doctor(html, { file: 'demo.html' });
    expect(report.registry.items.length).toBeGreaterThanOrEqual(1);
    expect(report.scores.transparency).toBeTypeOf('number');
    expect(report.findings.some((f) => f.code === 'missing-disclosure.images')).toBe(true);
  });

  it('migrate suggests attributes for missing image', async () => {
    const engine = createTransparencyEngine({ policy: STRICT_MEDIA_POLICY });
    const result = await engine.migrate(html, { file: 'demo.html', dryRun: true });
    expect(result.suggestions.some((s) => s.kind === 'images')).toBe(true);
  });

  it('exports JSON-LD', async () => {
    const engine = createTransparencyEngine();
    await engine.ingest(html, { file: 'demo.html' });
    const body = engine.export('json-ld');
    const data = JSON.parse(body);
    expect(data['@context']).toBe('https://schema.org');
    expect(Array.isArray(data['@graph'])).toBe(true);
  });

  it('exportDisclosures csv has header', () => {
    const rec = normalizeDisclosure({ id: 'x', type: 'ai', status: 'generated' }, { provider: 'api' });
    const csv = exportDisclosures([rec], 'csv');
    expect(csv.split('\n')[0]).toContain('id,type,status');
  });
});
