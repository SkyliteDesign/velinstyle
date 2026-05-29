import { describe, it, expect } from 'vitest';
import { VelinSearchEngine } from '../core/search/engine.js';
import { highlightHtml } from '../core/search/highlight.js';
import { velinSearch, registerSearchProvider, createSearch } from '../core/search/index.js';
import { buildSearchIndex } from '../cli/search-index.js';
import { existsSync, mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

describe('VelinSearch engine', () => {
  const sample = [
    { id: 'c:modal', title: 'velin-modal', excerpt: 'Dialog overlay', url: '/modal', category: 'components', weight: 2 },
    { id: 'd:tokens', title: 'Color tokens', excerpt: 'OKLCH palette', url: '/tokens', category: 'docs', keywords: ['color', 'oklch'] },
    { id: 'a:scan', title: 'velinstyle scan', excerpt: 'Security scanner', url: '/cli/scan', category: 'api' },
  ];

  it('scores exact title matches highest', () => {
    const engine = new VelinSearchEngine();
    engine.setEntries(sample);
    const { results } = engine.query('velin-modal', { minChars: 2 });
    expect(results[0].title).toBe('velin-modal');
  });

  it('fuzzy matches typos', () => {
    const engine = new VelinSearchEngine();
    engine.setEntries(sample);
    const { results } = engine.query('modla', { minChars: 2, fuzzy: 0.2 });
    expect(results.some((r) => r.title.includes('modal'))).toBe(true);
  });

  it('filters by category', () => {
    const engine = new VelinSearchEngine();
    engine.setEntries(sample);
    const { results } = engine.query('velin', { categories: ['api'], minChars: 2 });
    expect(results.every((r) => r.category === 'api')).toBe(true);
  });

  it('groups results by category', () => {
    const engine = new VelinSearchEngine();
    engine.setEntries(sample);
    const { groups } = engine.query('velin', { minChars: 2, limit: 10 });
    expect(Object.keys(groups).length).toBeGreaterThan(0);
  });
});

describe('highlightHtml', () => {
  it('wraps matches in mark', () => {
    const html = highlightHtml('Velin Modal', 'mod');
    expect(html).toContain('<mark class="velin-search-hit">');
    expect(html).toContain('Mod');
  });
});

describe('velinSearch API', () => {
  it('createSearch isolates instances', async () => {
    const s = createSearch();
    s.addEntries([{ id: 'x', title: 'Test', url: '/t', category: 'docs' }]);
    const { results } = await s.query('test', { minChars: 2 });
    expect(results).toHaveLength(1);
  });

  it('registerSearchProvider merges on refresh', async () => {
    registerSearchProvider('test-fixture', () => [
      { id: 'p:1', title: 'Provider hit', url: '/p', category: 'examples' },
    ]);
    await velinSearch.refreshProviders();
    const { results } = await velinSearch.query('provider', { minChars: 2 });
    expect(results.some((r) => r.title === 'Provider hit')).toBe(true);
  });
});

describe('search index CLI', () => {
  it('builds index from generated docs when present', () => {
    const gen = join(process.cwd(), 'docs', 'generated');
    if (!existsSync(gen)) return;
    const tmp = mkdtempSync(join(tmpdir(), 'velinstyle-search-index-'));
    try {
      const { ok, count } = buildSearchIndex({
        outFile: join(tmp, 'search-index.test.json'),
      });
      expect(ok).toBe(true);
      expect(count).toBeGreaterThan(10);
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});
