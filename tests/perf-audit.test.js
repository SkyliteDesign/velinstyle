import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { auditHtml, fixPath } from '../cli/perf-audit.js';

const FIXTURE = join(dirname(fileURLToPath(import.meta.url)), 'perf/fixtures/no-dimensions.html');

describe('perf audit', () => {
  it('flags img without dimensions', () => {
    const html = readFileSync(FIXTURE, 'utf-8');
    const issues = auditHtml(html, { file: FIXTURE });
    expect(issues.some((i) => i.id === 'img-missing-dimensions')).toBe(true);
  });

  it('fix adds width/height and defer', () => {
    const dir = join(dirname(fileURLToPath(import.meta.url)), 'perf/tmp-fix');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'page.html');
    writeFileSync(file, readFileSync(FIXTURE, 'utf-8'), 'utf-8');
    try {
      const { changes } = fixPath(dir, { write: true, dryRun: false });
      expect(changes.length).toBeGreaterThan(0);
      const out = readFileSync(file, 'utf-8');
      expect(out).toMatch(/width=/);
      expect(out).toMatch(/defer/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
