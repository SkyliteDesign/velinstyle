import { CATEGORY_BOOST, normalizeEntry } from './types.js';

/**
 * Lightweight fuzzy/substring search engine (no external deps).
 */
export class VelinSearchEngine {
  constructor() {
    /** @type {import('./types.js').SearchEntry[]} */
    this._entries = [];
  }

  /** @param {import('./types.js').SearchEntry[]} entries */
  setEntries(entries) {
    this._entries = entries.map((e) => normalizeEntry(e)).filter(Boolean);
  }

  /** @param {import('./types.js').SearchEntry[]} entries */
  addEntries(entries) {
    const next = entries.map((e) => normalizeEntry(e)).filter(Boolean);
    const ids = new Set(this._entries.map((e) => e.id));
    for (const e of next) {
      if (!ids.has(e.id)) {
        this._entries.push(e);
        ids.add(e.id);
      }
    }
  }

  /**
   * @param {string} query
   * @param {object} [opts]
   * @param {number} [opts.limit]
   * @param {number} [opts.minChars]
   * @param {number} [opts.fuzzy] 0–1 threshold for typo tolerance
   * @param {import('./types.js').SearchCategory[]} [opts.categories]
   */
  query(query, opts = {}) {
    const q = String(query || '').trim().toLowerCase();
    const minChars = opts.minChars ?? 2;
    const limit = opts.limit ?? 12;
    const fuzzy = opts.fuzzy ?? 0.2;
    const categories = opts.categories;

    if (q.length < minChars) {
      return { results: [], groups: {} };
    }

    const scored = [];
    for (const entry of this._entries) {
      if (categories && categories.length && !categories.includes(entry.category)) continue;
      const s = scoreEntry(entry, q, fuzzy);
      if (s > 0) scored.push({ entry, score: s });
    }

    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, limit).map((x) => ({ ...x.entry, _score: x.score }));

    /** @type {Record<string, typeof results>} */
    const groups = {};
    for (const r of results) {
      if (!groups[r.category]) groups[r.category] = [];
      groups[r.category].push(r);
    }

    return { results, groups };
  }
}

/**
 * @param {import('./types.js').SearchEntry} entry
 * @param {string} q
 * @param {number} fuzzy
 */
function scoreEntry(entry, q, fuzzy) {
  const title = entry.title.toLowerCase();
  const excerpt = (entry.excerpt || '').toLowerCase();
  const keywords = (entry.keywords || []).join(' ').toLowerCase();
  const boost = (CATEGORY_BOOST[entry.category] || 1) * (entry.weight || 1);

  let score = 0;

  if (title === q) score = 100;
  else if (title.startsWith(q)) score = 70;
  else if (title.includes(q)) score = 50;
  else if (keywords.includes(q)) score = 35;
  else if (excerpt.includes(q)) score = 25;
  else if (fuzzy > 0 && fuzzyMatch(title, q, fuzzy)) score = 40;
  else if (fuzzy > 0 && fuzzyMatch(keywords, q, fuzzy)) score = 28;
  else if (fuzzy > 0 && fuzzyMatch(excerpt, q, fuzzy)) score = 18;
  else if (subsequenceMatch(title, q)) score = 22;
  else if (fuzzy > 0) {
    for (const word of title.split(/[^a-z0-9]+/)) {
      if (word.length >= 3 && fuzzyMatch(word, q, fuzzy)) {
        score = 32;
        break;
      }
    }
  }

  return score > 0 ? score * boost : 0;
}

function subsequenceMatch(haystack, needle) {
  let j = 0;
  for (let i = 0; i < haystack.length && j < needle.length; i++) {
    if (haystack[i] === needle[j]) j++;
  }
  return j === needle.length;
}

/** Allow ~1 edit per 4 chars when fuzzy threshold met */
function fuzzyMatch(text, query, threshold) {
  if (!text || !query) return false;
  if (text.includes(query)) return true;
  if (subsequenceMatch(text, query)) return true;
  const maxDist = Math.max(1, Math.floor(query.length * threshold * 2));
  return levenshtein(text.slice(0, Math.min(text.length, query.length + 8)), query) <= maxDist;
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Uint16Array((n + 1) * (m + 1));
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    dp[i * (n + 1)] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i * (n + 1) + j] = Math.min(
        dp[(i - 1) * (n + 1) + j] + 1,
        dp[i * (n + 1) + (j - 1)] + 1,
        dp[(i - 1) * (n + 1) + (j - 1)] + cost,
      );
    }
  }
  return dp[m * (n + 1) + n];
}
