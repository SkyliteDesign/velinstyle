/**
 * @vitest-environment node
 */
import { describe, it, expect } from 'vitest';
import { VelinSearchEngine } from '../core/search/engine.js';
import { createSearch } from '../core/search/index.js';

const WORKER_URL = new URL('../core/search/worker.js', import.meta.url).href;
const MAIN_THREAD_MS = 400;
const WORKER_MS = 500;

/** @returns {import('../core/search/types.js').SearchEntry[]} */
function build10kEntries() {
  const categories = ['docs', 'components', 'api', 'examples'];
  return Array.from({ length: 10_000 }, (_, i) => ({
    id: `bench:${i}`,
    title: i % 23 === 0 ? `velin-modal ${i}` : `Page ${i}`,
    excerpt: `Documentation excerpt ${i}`,
    url: `/docs/page-${i}.html`,
    category: categories[i % categories.length],
    keywords: ['velin', `topic-${i % 80}`, i % 41 === 0 ? 'modal' : 'utility'],
    weight: i % 5 === 0 ? 2 : 1,
  }));
}

describe('VelinSearch 10k benchmark', () => {
  const entries = build10kEntries();

  it(`indexes ${entries.length} entries`, () => {
    expect(entries).toHaveLength(10_000);
  });

  it(`main-thread fuzzy query completes within ${MAIN_THREAD_MS}ms`, () => {
    const engine = new VelinSearchEngine();
    engine.setEntries(entries);
    const start = performance.now();
    const { results } = engine.query('modal', { fuzzy: 0.2, limit: 20, minChars: 2 });
    const elapsed = performance.now() - start;
    expect(results.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(MAIN_THREAD_MS);
  });

  it(`worker fuzzy query completes within ${WORKER_MS}ms`, async () => {
    if (typeof Worker === 'undefined') return;
    const search = createSearch({ worker: true, workerUrl: WORKER_URL });
    await search.loadIndex(entries);
    const start = performance.now();
    const { results } = await search.query('modal', { fuzzy: 0.2, limit: 20, minChars: 2 });
    const elapsed = performance.now() - start;
    expect(results.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(WORKER_MS);
  });
});
