import { describe, it, expect } from 'vitest';
import { escapeHTML, sanitizeURL, stripControlChars, escapeHTMLAttribute } from '../components/sanitize.js';

describe('sanitize', () => {
  it('escapeHTML escapes dangerous characters', () => {
    expect(escapeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('sanitizeURL blocks javascript:', () => {
    expect(sanitizeURL('javascript:alert(1)')).toBe('');
  });

  it('sanitizeURL blocks data:text/html', () => {
    expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('sanitizeURL allows https', () => {
    expect(sanitizeURL('https://example.com/x')).toBe('https://example.com/x');
  });

  it('stripControlChars removes control bytes', () => {
    expect(stripControlChars('a\u0000b')).toBe('ab');
  });

  it('escapeHTMLAttribute strips and escapes', () => {
    expect(escapeHTMLAttribute('"><img')).toBe('&quot;&gt;&lt;img');
  });
});
