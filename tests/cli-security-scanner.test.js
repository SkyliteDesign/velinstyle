import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { scan } from '../cli/scanner.js';
import { scanPIIHTML } from '../cli/pii-scanner.js';
import { tmpdir } from 'os';

function withFixture(name, html, fn) {
  const dir = join(tmpdir(), `velin-scan-${name}-${Date.now()}`);
  mkdirSync(dir, { recursive: true });
  const file = join(dir, 'test.html');
  writeFileSync(file, html, 'utf-8');
  try {
    fn(file, dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

describe('security scanner rules', () => {
  it('flags javascript: URLs', () => {
    withFixture('jsurl', '<a href="javascript:alert(1)">x</a>', (_f, dir) => {
      const code = scan(dir, { severity: 'error', format: 'json', only: 'security' });
      expect(code).toBe(1);
    });
  });

  it('flags meta refresh', () => {
    withFixture('refresh', '<meta http-equiv="refresh" content="0;url=/">', (_f, dir) => {
      expect(scan(dir, { severity: 'error', format: 'json', only: 'security' })).toBe(1);
    });
  });

  it('only filter limits to security category', () => {
    withFixture('only', '<html><body><img></body></html>', (_f, dir) => {
      expect(scan(dir, { severity: 'error', format: 'json', only: 'security' })).toBe(0);
    });
  });

  it('flags hardcoded email with --only pii', () => {
    const issues = scanPIIHTML('<p>Contact: admin@company.com</p>', 'test.html');
    expect(issues.some((i) => i.rule === 'pii/hardcoded-email')).toBe(true);
    withFixture('pii-email', '<p>Contact: admin@company.com</p>', (_f, dir) => {
      expect(scan(dir, { severity: 'info', format: 'json', only: 'pii' })).toBe(0);
    });
  });

  it('masks hardcoded email with --fix', () => {
    withFixture('pii-fix', '<p>admin@company.com</p>', (file, dir) => {
      scan(dir, { severity: 'warning', only: 'pii', fix: true });
      const out = readFileSync(file, 'utf-8');
      expect(out).toContain('user@example.com');
      expect(out).not.toContain('admin@company.com');
    });
  });

  it('flags hardcoded secret in JS', () => {
    const dir = join(tmpdir(), `velin-scan-pii-secret-${Date.now()}`);
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, 'app.js'),
      "const api_key = 'unit_test_placeholder_not_a_real_secret';",
      'utf-8',
    );
    try {
      expect(scan(dir, { severity: 'error', format: 'json', only: 'pii' })).toBe(1);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
