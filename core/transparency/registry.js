/** In-memory disclosure registry. */

/**
 * @typedef {object} Provenance
 * @property {string} [createdBy]
 * @property {string} [createdAt]
 * @property {string} [reviewedAt]
 * @property {string} [approvedBy]
 * @property {string} [source]
 * @property {string} [license]
 * @property {string} [version]
 * @property {string} [publishedAt]
 */

/**
 * @typedef {object} DisclosureRecord
 * @property {string} id
 * @property {string} [type]
 * @property {string} [status]
 * @property {string} [review]
 * @property {string} provider
 * @property {string[]} claims
 * @property {Provenance} provenance
 * @property {string} [updated]
 * @property {string} [label]
 * @property {string} [description]
 * @property {string} [renderer]
 * @property {string} [tone]
 * @property {string} [position]
 * @property {{ selector?: string, tag?: string, src?: string, file?: string }} [target]
 * @property {Record<string, unknown>} [meta]
 */

export function createRegistry() {
  /** @type {Map<string, DisclosureRecord>} */
  const map = new Map();

  return {
    register(record) {
      if (!record?.id) throw new Error('DisclosureRecord requires id');
      map.set(record.id, structuredCloneSafe(record));
      return map.get(record.id);
    },
    get(id) {
      return map.get(id) || null;
    },
    has(id) {
      return map.has(id);
    },
    remove(id) {
      return map.delete(id);
    },
    list() {
      return [...map.values()].map((r) => structuredCloneSafe(r));
    },
    query(predicate) {
      return this.list().filter(predicate);
    },
    clear() {
      map.clear();
    },
    size() {
      return map.size;
    },
    export() {
      return { schema: 'velinstyle.transparency.registry', version: 1, items: this.list() };
    },
    diff(otherList = []) {
      const other = new Map(otherList.map((r) => [r.id, r]));
      const added = [];
      const removed = [];
      const changed = [];
      for (const r of map.values()) {
        if (!other.has(r.id)) added.push(r.id);
        else if (JSON.stringify(r) !== JSON.stringify(other.get(r.id))) changed.push(r.id);
      }
      for (const id of other.keys()) {
        if (!map.has(id)) removed.push(id);
      }
      return { added, removed, changed };
    },
  };
}

function structuredCloneSafe(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Stable id from target hints.
 * @param {{ id?: string, selector?: string, src?: string, tag?: string, type?: string, file?: string }} parts
 */
export function stableDisclosureId(parts = {}) {
  if (parts.id) return String(parts.id).trim();
  const raw = [parts.file || '', parts.selector || '', parts.src || '', parts.tag || '', parts.type || '']
    .join('|')
    .toLowerCase();
  let h = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    h ^= raw.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `tx-${(h >>> 0).toString(16)}`;
}
