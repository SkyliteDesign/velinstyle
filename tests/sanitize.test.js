import { describe, it, expect } from 'vitest';
import {
  escapeHTML,
  sanitizeURL,
  sanitizeSearchUrl,
  stripControlChars,
  escapeHTMLAttribute,
} from '../components/sanitize.js';

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

  it('sanitizeURL allows https and normalizes', () => {
    expect(sanitizeURL('https://example.com/x')).toBe('https://example.com/x');
  });

  it('sanitizeURL blocks data svg', () => {
    expect(sanitizeURL('data:image/svg+xml,<svg onload=alert(1)>')).toBe('');
  });

  it('sanitizeSearchUrl allows path-absolute paths', () => {
    expect(sanitizeSearchUrl('/docs/foo.html')).toBe('/docs/foo.html');
  });

  it('sanitizeSearchUrl keeps index-relative paths', () => {
    expect(sanitizeSearchUrl('getting-started/foo.html')).toBe('getting-started/foo.html');
  });

  it('sanitizeSearchUrl blocks javascript', () => {
    expect(sanitizeSearchUrl('javascript:alert(1)')).toBe('#');
  });

  it('stripControlChars removes control bytes', () => {
    expect(stripControlChars('a\u0000b')).toBe('ab');
  });

  it('escapeHTMLAttribute strips and escapes', () => {
    expect(escapeHTMLAttribute('"><img')).toBe('&quot;&gt;&lt;img');
  });
});
