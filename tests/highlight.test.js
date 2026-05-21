import { describe, it, expect } from 'vitest';
import { renderTokens, escapeHtml } from '../core/highlight/render.js';
import { registerLanguage, getLanguage, normalizeLanguage } from '../core/highlight/registry.js';
import lexJs from '../core/highlight/languages/js.js';
import lexHtml from '../core/highlight/languages/html.js';

describe('highlight render', () => {
  it('escapes HTML in token values', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
  });

  it('wraps tokens in velin-token spans', () => {
    const html = renderTokens([
      { type: 'keyword', value: 'const' },
      { type: 'plain', value: ' ' },
      { type: 'identifier', value: 'x' },
    ]);
    expect(html).toContain('velin-token--keyword');
    expect(html).toContain('>const<');
    expect(html).toContain('>x<');
  });
});

describe('highlight registry', () => {
  it('normalizes language aliases', () => {
    expect(normalizeLanguage('language-html')).toBe('html');
    expect(normalizeLanguage('javascript')).toBe('js');
    expect(normalizeLanguage('typescript')).toBe('ts');
  });

  it('registers custom lexer', () => {
    registerLanguage('demo', () => [{ type: 'plain', value: 'x' }]);
    expect(getLanguage('demo')).toBeTypeOf('function');
  });
});

describe('js lexer', () => {
  it('tokenizes keywords and strings', () => {
    const tokens = lexJs('const msg = "hi";');
    const types = tokens.map((t) => t.type);
    expect(types).toContain('keyword');
    expect(types).toContain('string');
  });
});

describe('html lexer', () => {
  it('tokenizes tags', () => {
    const tokens = lexHtml('<div></div>');
    expect(tokens.some((t) => t.type === 'tag')).toBe(true);
  });
});
