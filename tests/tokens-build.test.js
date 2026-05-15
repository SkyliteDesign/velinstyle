import { describe, it, expect } from 'vitest';
import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { buildTokensFromJson } from '../cli/tokens-build.js';

describe('buildTokensFromJson', () => {
  it('emits :root and theme blocks', () => {
    const p = join(tmpdir(), 'vs-tokens-test.json');
    writeFileSync(
      p,
      JSON.stringify({
        tokens: { 'color-primary': 'oklch(0.5 0.2 250)' },
        themes: { dark: { 'color-primary': 'oklch(0.8 0.15 250)' } },
      }),
      'utf-8',
    );
    try {
      const css = buildTokensFromJson(p);
      expect(css).toContain('--velin-color-primary');
      expect(css).toContain('[data-velin-theme="dark"]');
    } finally {
      unlinkSync(p);
    }
  });

  it('returns null for missing file', () => {
    expect(buildTokensFromJson(join(tmpdir(), 'nope-velin-tokens.json'))).toBeNull();
  });
});
