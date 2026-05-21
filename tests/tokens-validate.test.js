import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { validateTokensJson } from '../cli/tokens-validate.js';

const SAMPLE = resolve(dirname(fileURLToPath(import.meta.url)), '../examples/tokens.sample.json');

describe('tokens validate', () => {
  it('accepts sample tokens', () => {
    const r = validateTokensJson(SAMPLE);
    expect(r.ok).toBe(true);
    expect(r.errors).toHaveLength(0);
  });

  it('rejects missing file', () => {
    const r = validateTokensJson('/nonexistent/tokens.json');
    expect(r.ok).toBe(false);
  });
});
