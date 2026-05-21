/** @typedef {() => import('./types.js').SearchEntry[]|Promise<import('./types.js').SearchEntry[]>} SearchProviderFn */

/** @type {Map<string, SearchProviderFn>} */
const providers = new Map();

/**
 * Register a custom search content provider (API hook for developers).
 * @param {string} id
 * @param {SearchProviderFn} fn
 */
export function registerSearchProvider(id, fn) {
  if (!id || typeof fn !== 'function') {
    throw new Error('registerSearchProvider(id, fn) requires a non-empty id and function');
  }
  providers.set(id, fn);
}

export function unregisterSearchProvider(id) {
  providers.delete(id);
}

export function listSearchProviders() {
  return [...providers.keys()];
}

/**
 * @returns {Promise<import('./types.js').SearchEntry[]>}
 */
export async function collectProviderEntries() {
  const all = [];
  for (const fn of providers.values()) {
    const chunk = await fn();
    if (Array.isArray(chunk)) all.push(...chunk);
  }
  return all;
}
