import { VelinSearchEngine } from './engine.js';
import { collectProviderEntries } from './providers.js';
import { normalizeEntry, SEARCH_CATEGORIES } from './types.js';

export { VelinSearchEngine } from './engine.js';
export { highlightHtml } from './highlight.js';
export { registerSearchProvider, unregisterSearchProvider, listSearchProviders } from './providers.js';
export { SEARCH_CATEGORIES, CATEGORY_BOOST, normalizeEntry } from './types.js';
export { getDocsBaseUrl, resolveDocsSearchUrl, relativizeDocsPathname } from './docs-url.js';

const defaultEngine = new VelinSearchEngine();
let indexLoaded = false;

/**
 * @param {import('./types.js').SearchEntry[]|{ entries?: import('./types.js').SearchEntry[] }} data
 */
function parseIndexPayload(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.entries)) return data.entries;
  return [];
}

/**
 * Singleton search API.
 */
export const velinSearch = {
  engine: defaultEngine,

  /**
   * Load JSON index from URL (offline after fetch) or pass entries directly.
   * @param {string|import('./types.js').SearchEntry[]} source
   */
  async loadIndex(source) {
    let entries = [];
    if (typeof source === 'string') {
      const res = await fetch(source);
      if (!res.ok) throw new Error(`Failed to load search index: ${res.status}`);
      entries = parseIndexPayload(await res.json());
    } else if (Array.isArray(source)) {
      entries = source;
    }
    defaultEngine.setEntries(entries);
    const providerEntries = await collectProviderEntries();
    if (providerEntries.length) defaultEngine.addEntries(providerEntries);
    indexLoaded = true;
    return entries.length;
  },

  /**
   * Merge entries without replacing the full index.
   * @param {import('./types.js').SearchEntry[]} entries
   */
  addEntries(entries) {
    defaultEngine.addEntries(entries);
  },

  /**
   * Refresh entries from registered providers.
   */
  async refreshProviders() {
    const providerEntries = await collectProviderEntries();
    if (providerEntries.length) defaultEngine.addEntries(providerEntries);
    return providerEntries.length;
  },

  /**
   * @param {string} query
   * @param {object} [options]
   */
  async query(query, options = {}) {
    if (!indexLoaded && defaultEngine._entries.length === 0) {
      await this.refreshProviders();
    }
    return defaultEngine.query(query, options);
  },

  isReady() {
    return indexLoaded || defaultEngine._entries.length > 0;
  },
};

/**
 * Create an isolated search instance (for multiple widgets).
 */
/**
 * @param {{ worker?: boolean, workerUrl?: string }} [config]
 */
export function createSearch(config = {}) {
  const engine = new VelinSearchEngine();
  const wantWorker = config.worker === true;
  let workerClient = null;

  async function getWorker() {
    if (!wantWorker || workerClient) return workerClient;
    if (typeof Worker === 'undefined') return null;
    const { createSearchWorker } = await import('./worker-client.js');
    workerClient = createSearchWorker(config.workerUrl);
    return workerClient;
  }

  return {
    engine,
    async loadIndex(source) {
      let entries = [];
      if (typeof source === 'string') {
        const res = await fetch(source);
        entries = parseIndexPayload(await res.json());
      } else if (Array.isArray(source)) {
        entries = source;
      }
      engine.setEntries(entries);
      const w = await getWorker();
      if (w) await w.setEntries(engine._entries);
      return entries.length;
    },
    async query(q, opts) {
      const w = await getWorker();
      if (w) return w.query(q, opts);
      return engine.query(q, opts);
    },
    addEntries(entries) {
      engine.addEntries(entries);
      void getWorker().then((w) => w?.setEntries(engine._entries));
    },
  };
}
