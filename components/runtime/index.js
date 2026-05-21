/**
 * VelinStyle runtime — register only the Web Components you need.
 */
import { COMPONENT_LOADERS } from './component-loaders.js';

const registry = new Map();

const VELIN_TAG_RE = /^velin-[a-z0-9-]+$/;

export function whenDefined(tagName) {
  if (typeof customElements === 'undefined') {
    return Promise.reject(new Error('customElements not available'));
  }
  return customElements.whenDefined(tagName);
}

export async function lazyDefine(tagName) {
  const loader = COMPONENT_LOADERS[tagName];
  if (!loader) {
    throw new Error(`Unknown Velin component: ${tagName}`);
  }
  if (registry.has(tagName)) return registry.get(tagName);
  const p = loader().then((mod) => {
    const Cls = mod.default;
    if (Cls && !customElements.get(tagName)) {
      customElements.define(tagName, Cls);
    }
    return Cls;
  });
  registry.set(tagName, p);
  return p;
}

export async function register(tagNames) {
  return Promise.all(tagNames.map((t) => lazyDefine(t)));
}

function collectTagsFromDOM(root) {
  const tags = new Set();
  root.querySelectorAll('[data-velin-component]').forEach((el) => {
    const name = el.getAttribute('data-velin-component');
    if (name) tags.add(name.startsWith('velin-') ? name : `velin-${name}`);
  });
  for (const el of root.querySelectorAll('*')) {
    const tag = el.tagName?.toLowerCase();
    if (tag && VELIN_TAG_RE.test(tag) && COMPONENT_LOADERS[tag]) {
      tags.add(tag);
    }
  }
  return tags;
}

/**
 * @param {ParentNode} [root]
 * @param {{ attributes?: boolean, highlight?: boolean, haptic?: boolean, tags?: string[] }} [options]
 */
export async function bootFromDOM(root = document, options = {}) {
  const tags = options.tags?.length
    ? new Set(options.tags)
    : collectTagsFromDOM(root);
  const wcPromise = register([...tags]);
  if (options.attributes) {
    const { bootAttributes } = await import('../../core/attributes/index.js');
    await bootAttributes(root);
  }
  if (options.highlight) {
    const { initHighlight } = await import('../../core/highlight/index.js');
    initHighlight(root);
  }
  if (options.haptic) {
    const { VelinHapticObserver } = await import('../velin-haptic.js');
    new VelinHapticObserver().start(root instanceof Document ? root.body : root);
  }
  return wcPromise;
}

export { COMPONENT_LOADERS };
