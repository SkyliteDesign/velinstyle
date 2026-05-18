import { describe, it, expect } from 'vitest';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { scan } from '../cli/scanner.js';

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
});
