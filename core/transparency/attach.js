import { normalizeDisclosure } from './normalize.js';
import { renderDisclosure } from './renderer.js';
import { createRegistry } from './registry.js';

const defaultRegistry = createRegistry();

/**
 * Attach a disclosure to an element (browser API).
 * @param {HTMLElement} el
 * @param {Record<string, unknown>} options
 * @param {{ registry?: ReturnType<typeof createRegistry>, lang?: string }} [ctx]
 */
export function attach(el, options = {}, ctx = {}) {
  if (!el) throw new Error('VelinTransparency.attach requires an element');
  const registry = ctx.registry || defaultRegistry;
  const draft = {
    ...options,
    tag: el.tagName,
    src: el.getAttribute?.('src') || el.getAttribute?.('href') || options.src,
    selector: el.id ? `#${el.id}` : options.selector,
    id: options.id || el.getAttribute?.('velin-transparency-id') || el.id,
    provider: options.provider || 'api',
  };
  // Mirror useful attributes if present
  if (el.hasAttribute?.('velin-transparency') || el.hasAttribute?.('velin-disclosure')) {
    draft.type = draft.type || el.getAttribute('velin-type') || 'ai';
    draft.status = draft.status || el.getAttribute('velin-status');
    draft.review = draft.review || el.getAttribute('velin-review');
    draft.license = draft.license || el.getAttribute('velin-license');
    draft.label = draft.label || el.getAttribute('velin-label');
    draft.description = draft.description || el.getAttribute('velin-description');
    draft.overlay = draft.overlay || el.getAttribute('velin-overlay') || el.getAttribute('velin-renderer');
    draft.provenance = {
      createdBy: el.getAttribute('velin-created-by'),
      createdAt: el.getAttribute('velin-created-at'),
      reviewedAt: el.getAttribute('velin-reviewed-at'),
      approvedBy: el.getAttribute('velin-approved-by'),
      source: el.getAttribute('velin-source'),
      license: el.getAttribute('velin-license'),
      version: el.getAttribute('velin-version'),
      publishedAt: el.getAttribute('velin-published-at'),
      ...(options.provenance || {}),
    };
  }
  const record = normalizeDisclosure(draft, { provider: draft.provider, lang: ctx.lang });
  registry.register(record);
  if (!el.hasAttribute('velin-transparency')) el.setAttribute('velin-transparency', '');
  if (!el.hasAttribute('velin-transparency-id')) el.setAttribute('velin-transparency-id', record.id);
  renderDisclosure(el, record);
  return record;
}

/**
 * Enhance all [velin-transparency] under root.
 * @param {ParentNode} [root]
 */
export function enhanceAll(root = typeof document !== 'undefined' ? document : null) {
  if (!root?.querySelectorAll) return [];
  const out = [];
  root.querySelectorAll('[velin-transparency], [velin-disclosure]').forEach((el) => {
    out.push(attach(el, {}, { registry: defaultRegistry }));
  });
  return out;
}

export function getDefaultRegistry() {
  return defaultRegistry;
}

export const VelinTransparency = {
  attach,
  enhanceAll,
  getRegistry: getDefaultRegistry,
};
