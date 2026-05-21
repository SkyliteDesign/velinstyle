import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { normalizeEntry } from '../core/search/types.js';
import { relativizeDocsPathname, resolveDocsSearchUrl, getDocsBaseUrl } from '../core/search/docs-url.js';
import { sanitizeSearchUrl } from '../components/sanitize.js';

describe('search docs URL', () => {
  it('sanitizeSearchUrl keeps relative index paths', () => {
    expect(sanitizeSearchUrl('getting-started/contents.html#cli')).toBe(
      'getting-started/contents.html#cli',
    );
  });

  it('normalizeEntry does not resolve against location', () => {
    const prev = globalThis.location;
    // @ts-expect-error test stub
    globalThis.location = new URL('http://localhost/docs/components/buttons/');
    const entry = normalizeEntry({
      id: 'x',
      title: 'CLI',
      url: 'getting-started/contents.html#cli',
    });
    globalThis.location = prev;
    expect(entry.url).toBe('getting-started/contents.html#cli');
  });

  it('relativizeDocsPathname strips mistaken section prefix', () => {
    expect(
      relativizeDocsPathname('/docs/components/getting-started/contents.html'),
    ).toBe('getting-started/contents.html');
    expect(relativizeDocsPathname('/docs/components/velin-code-block.html')).toBe(
      'components/velin-code-block.html',
    );
  });
});

describe('resolveDocsSearchUrl (browser)', () => {
  const base = 'http://localhost/docs/';

  beforeEach(() => {
    document.body.innerHTML = `
      <script src="${base}assets/doc-search.iife.js"></script>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resolves relative index path from docs root', () => {
    expect(resolveDocsSearchUrl('getting-started/contents.html#cli')).toBe(
      'http://localhost/docs/getting-started/contents.html#cli',
    );
  });

  it('repairs legacy absolute URLs baked under current section', () => {
    expect(
      resolveDocsSearchUrl('http://localhost/docs/components/getting-started/contents.html#cli'),
    ).toBe('http://localhost/docs/getting-started/contents.html#cli');
  });

  it('getDocsBaseUrl uses script mount', () => {
    expect(getDocsBaseUrl()).toBe('http://localhost/docs/');
  });
});
