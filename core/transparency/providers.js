import { normalizeDisclosure, mergeDisclosures } from './normalize.js';
import { providerRank } from './policy.js';

/** @type {Map<string, { collect: Function, apply?: Function }>} */
const providers = new Map();

export function registerTransparencyProvider(id, handler) {
  if (!id || typeof handler?.collect !== 'function') {
    throw new Error('registerTransparencyProvider requires id and collect()');
  }
  providers.set(id, handler);
}

export function listTransparencyProviders() {
  return [...providers.keys()];
}

export function getTransparencyProvider(id) {
  return providers.get(id) || null;
}

function mergeById(records, policy) {
  const map = new Map();
  const conflicts = [];
  const rankFn = (pid) => providerRank(pid, policy);
  for (const rec of records) {
    if (!map.has(rec.id)) {
      map.set(rec.id, rec);
      continue;
    }
    const { record, conflicts: c } = mergeDisclosures(map.get(rec.id), rec, rankFn);
    map.set(rec.id, record);
    if (c.length) {
      conflicts.push({ id: rec.id, keys: c, providers: record.meta?.mergedFrom });
    }
  }
  return { records: [...map.values()], conflicts };
}

/**
 * Collect from all providers, normalize, merge by id using policy priority.
 * @param {string|Document|ParentNode|object} root
 * @param {{ policy: object, file?: string, lang?: string, meta?: object, apiDisclosures?: object[] }} ctx
 */
export async function collectAllDisclosures(root, ctx) {
  const drafts = [];
  for (const [id, handler] of providers) {
    const items = await handler.collect(root, { ...ctx, providerId: id });
    for (const item of items || []) {
      drafts.push(normalizeDisclosure({ ...item, provider: item.provider || id }, {
        provider: item.provider || id,
        file: ctx.file,
        lang: ctx.lang,
      }));
    }
  }
  return mergeById(drafts, ctx.policy);
}

function attr(tag, name) {
  const re = new RegExp(`\\b${name}=["']([^"']*)["']`, 'i');
  return tag.match(re)?.[1];
}

function hasAttr(tag, name) {
  return new RegExp(`(?:\\s|^|<)${name}(?:[\\s>=/]|$)`, 'i').test(tag);
}

/**
 * Parse HTML string for velin-transparency hosts and JSON blocks.
 */
export function collectFromHtmlString(html) {
  const items = [];
  const tagRe = /<([a-z0-9-]+)(\s[^>]*)?>/gi;
  let m;
  while ((m = tagRe.exec(html))) {
    const full = m[0];
    if (!hasAttr(full, 'velin-transparency') && !hasAttr(full, 'velin-disclosure')) continue;
    const tagName = m[1].toUpperCase();
    const id = attr(full, 'velin-transparency-id') || attr(full, 'id');
    const type = attr(full, 'velin-type') || 'ai';
    const status = attr(full, 'velin-status');
    const review = attr(full, 'velin-review');
    const license = attr(full, 'velin-license');
    const label = attr(full, 'velin-label') || attr(full, 'velin-ai-label');
    const description = attr(full, 'velin-description') || attr(full, 'velin-ai-description');
    const overlay = attr(full, 'velin-overlay') || attr(full, 'velin-renderer') || attr(full, 'velin-ai-overlay');
    const tone = attr(full, 'velin-tone') || attr(full, 'velin-ai-tone');
    const position = attr(full, 'velin-position') || attr(full, 'velin-ai-position');
    const src = attr(full, 'src') || attr(full, 'href');
    items.push({
      id,
      type,
      status,
      review,
      license,
      label,
      description,
      overlay,
      tone,
      position,
      src,
      tag: tagName,
      selector: id ? `#${id}` : undefined,
      provenance: {
        createdBy: attr(full, 'velin-created-by'),
        createdAt: attr(full, 'velin-created-at'),
        reviewedAt: attr(full, 'velin-reviewed-at'),
        approvedBy: attr(full, 'velin-approved-by'),
        source: attr(full, 'velin-source'),
        license: license || undefined,
        version: attr(full, 'velin-version'),
        publishedAt: attr(full, 'velin-published-at'),
      },
      provider: 'html',
    });
  }

  const scriptRe = /<script\b[^>]*type=["']application\/vnd\.velinstyle\.transparency\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let sm;
  while ((sm = scriptRe.exec(html))) {
    try {
      const data = JSON.parse(sm[1].trim());
      const list = Array.isArray(data) ? data : data.items || [data];
      for (const item of list) items.push({ ...item, provider: item.provider || 'json' });
    } catch { /* ignore */ }
  }

  const jsonAttrRe = /<([a-z0-9-]+)([^>]*\bvelin-transparency-json=["']([^"']+)["'][^>]*)>/gi;
  let jm;
  while ((jm = jsonAttrRe.exec(html))) {
    try {
      const data = JSON.parse(jm[3].replace(/&quot;/g, '"'));
      items.push({ ...data, tag: jm[1].toUpperCase(), provider: 'json' });
    } catch { /* ignore */ }
  }

  return items;
}

function collectFromDom(root) {
  if (typeof root?.querySelectorAll !== 'function') return [];
  const items = [];
  root.querySelectorAll('[velin-transparency], [velin-disclosure]').forEach((el) => {
    const get = (n) => el.getAttribute(n);
    items.push({
      id: get('velin-transparency-id') || el.id || undefined,
      type: get('velin-type') || 'ai',
      status: get('velin-status'),
      review: get('velin-review'),
      license: get('velin-license'),
      label: get('velin-label') || get('velin-ai-label'),
      description: get('velin-description'),
      overlay: get('velin-overlay') || get('velin-renderer'),
      tone: get('velin-tone'),
      position: get('velin-position'),
      src: el.getAttribute('src') || el.getAttribute('href') || undefined,
      tag: el.tagName,
      selector: el.id ? `#${el.id}` : undefined,
      provenance: {
        createdBy: get('velin-created-by'),
        createdAt: get('velin-created-at'),
        reviewedAt: get('velin-reviewed-at'),
        approvedBy: get('velin-approved-by'),
        source: get('velin-source'),
        license: get('velin-license'),
        version: get('velin-version'),
        publishedAt: get('velin-published-at'),
      },
      provider: 'html',
    });
  });
  root.querySelectorAll('script[type="application/vnd.velinstyle.transparency+json"]').forEach((script) => {
    try {
      const data = JSON.parse(script.textContent || '{}');
      const list = Array.isArray(data) ? data : data.items || [data];
      for (const item of list) items.push({ ...item, provider: item.provider || 'json' });
    } catch { /* ignore */ }
  });
  return items;
}

registerTransparencyProvider('html', {
  async collect(root) {
    if (typeof root === 'string') return collectFromHtmlString(root).filter((i) => i.provider === 'html');
    return collectFromDom(root);
  },
});

registerTransparencyProvider('json', {
  async collect(root) {
    if (root && typeof root === 'object' && !root.querySelectorAll && (Array.isArray(root) || root.type || root.items)) {
      const list = Array.isArray(root) ? root : root.items || [root];
      return list.map((item) => ({ ...item, provider: 'json' }));
    }
    if (typeof root === 'string') {
      return collectFromHtmlString(root).filter((i) => i.provider === 'json');
    }
    return [];
  },
});

registerTransparencyProvider('meta', {
  async collect(root, ctx = {}) {
    if (ctx.meta?.transparency) {
      const t = ctx.meta.transparency;
      const list = Array.isArray(t) ? t : t.disclosures || t.items || [];
      return list.map((item) => ({ ...item, provider: 'meta' }));
    }
    if (typeof root === 'string') {
      const m = root.match(
        /<script\b[^>]*(?:id=["']velin-meta["']|type=["']application\/vnd\.velinstyle\.meta\+json["'])[^>]*>([\s\S]*?)<\/script>/i,
      );
      if (!m) return [];
      try {
        const meta = JSON.parse(m[1].trim());
        const t = meta.transparency || meta.aiDisclosure;
        if (!t) return [];
        const list = Array.isArray(t) ? t : t.disclosures || t.items || [];
        return list.map((item) => ({ ...item, provider: 'meta' }));
      } catch {
        return [];
      }
    }
    return [];
  },
});

registerTransparencyProvider('api', {
  async collect(_root, ctx = {}) {
    return Array.isArray(ctx.apiDisclosures)
      ? ctx.apiDisclosures.map((i) => ({ ...i, provider: 'api' }))
      : [];
  },
});
