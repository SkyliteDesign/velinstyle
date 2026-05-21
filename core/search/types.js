import { sanitizeSearchUrl } from '../../components/sanitize.js';

/** @typedef {'docs'|'components'|'api'|'examples'} SearchCategory */

/**
 * @typedef {Object} SearchEntry
 * @property {string} id
 * @property {string} title
 * @property {string} [excerpt]
 * @property {string} url
 * @property {SearchCategory} category
 * @property {string[]} [keywords]
 * @property {number} [weight]
 */

export const SEARCH_CATEGORIES = /** @type {const} */ (['docs', 'components', 'api', 'examples']);

export const CATEGORY_BOOST = {
  components: 1.25,
  api: 1.15,
  docs: 1,
  examples: 0.9,
};

/**
 * @param {unknown} entry
 * @returns {SearchEntry|null}
 */
export function normalizeEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const e = /** @type {Record<string, unknown>} */ (entry);
  const id = String(e.id || e.url || e.title || '').trim();
  const title = String(e.title || '').trim();
  const url = String(e.url || '').trim();
  if (!id || !title) return null;
  const keywords = Array.isArray(e.keywords)
    ? e.keywords.map((k) => String(k))
    : typeof e.keywords === 'string'
      ? e.keywords.split(/\s+/).filter(Boolean)
      : [];
  let category = /** @type {SearchCategory} */ (
    SEARCH_CATEGORIES.includes(/** @type {SearchCategory} */ (e.category))
      ? e.category
      : 'docs'
  );
  if (!e.category && typeof e.url === 'string') {
    if (e.url.includes('/components/')) category = 'components';
    else if (e.url.includes('/cli/') || e.url.includes('/api/')) category = 'api';
    else if (e.url.includes('samples/') || e.url.includes('examples/')) category = 'examples';
  }
  const safeUrl = url ? sanitizeSearchUrl(url) : `#${id}`;
  return {
    id,
    title,
    excerpt: String(e.excerpt || e.section || '').slice(0, 200),
    url: safeUrl,
    category: /** @type {SearchCategory} */ (category),
    keywords,
    weight: typeof e.weight === 'number' ? e.weight : 1,
  };
}
