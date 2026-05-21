import { lazyDefine } from '../../components/runtime/index.js';
import { initMotion } from '../motion/index.js';

/** @type {Map<string, { enhance: (el: HTMLElement) => void|Promise<void> }>} */
const registry = new Map();

export function registerAttribute(name, handler) {
  registry.set(name, handler);
}

export function getAttributeHandler(name) {
  return registry.get(name);
}

function bridgeComponent(el, tag, attrs = {}) {
  el.setAttribute('data-velin-component', tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v != null) el.setAttribute(k, v);
  }
  return lazyDefine(tag);
}

function registerBuiltins() {
  registerAttribute('velin-modal', {
    enhance(el) {
      bridgeComponent(el, 'velin-modal', { open: el.getAttribute('velin-modal') || '' });
    },
  });
  registerAttribute('velin-tabs', { enhance: (el) => bridgeComponent(el, 'velin-tabs') });
  registerAttribute('velin-accordion', { enhance: (el) => bridgeComponent(el, 'velin-accordion') });
  registerAttribute('velin-tooltip', {
    enhance(el) {
      const tip = el.getAttribute('velin-tooltip') || el.getAttribute('title') || '';
      if (tip && el.hasAttribute('title')) el.removeAttribute('title');
      if (el.tagName === 'VELIN-TOOLTIP' || el.tagName === 'VELIN-TOOLTIP-WC') {
        el.setAttribute('content', tip);
        return lazyDefine('velin-tooltip');
      }
      const wc = document.createElement('velin-tooltip');
      wc.setAttribute('content', tip);
      const parent = el.parentElement;
      if (parent) {
        parent.insertBefore(wc, el);
        wc.appendChild(el);
      }
      return lazyDefine('velin-tooltip');
    },
  });
  registerAttribute('velin-copy', {
    enhance(el) {
      const text = el.getAttribute('velin-copy') || el.textContent?.trim() || '';
      if (!el.querySelector('velin-copy')) {
        const wc = document.createElement('velin-copy');
        wc.setAttribute('value', text);
        if (el.tagName === 'BUTTON') {
          wc.append(...el.childNodes);
          el.replaceWith(wc);
          return lazyDefine('velin-copy');
        }
        el.appendChild(wc);
      }
      return lazyDefine('velin-copy');
    },
  });
  registerAttribute('velin-counter', {
    enhance(el) {
      bridgeComponent(el, 'velin-counter', {
        value: el.getAttribute('velin-counter') || '0',
      });
    },
  });
  registerAttribute('velin-notify', {
    async enhance(el) {
      await lazyDefine('velin-toast');
      el.addEventListener('click', () => {
        const msg = el.getAttribute('velin-notify') || el.textContent || '';
        document.dispatchEvent(
          new CustomEvent('velin-toast-show', { detail: { message: msg, variant: el.dataset.variant || 'info' } }),
        );
      });
    },
  });
  registerAttribute('velin-theme', {
    enhance(el) {
      const theme = el.getAttribute('velin-theme') || 'toggle';
      if (theme === 'toggle') {
        if (!el.querySelector('velin-theme-toggle')) {
          el.appendChild(document.createElement('velin-theme-toggle'));
        }
        return lazyDefine('velin-theme-toggle');
      }
      document.documentElement.setAttribute('data-velin-theme', theme);
    },
  });
  registerAttribute('velin-scroll-top', {
    enhance(el) {
      const raw = el.getAttribute('velin-scroll-top');
      const threshold = raw && raw !== 'true' ? raw : '300';
      if (el.tagName === 'VELIN-SCROLL-TOP') {
        if (raw && raw !== 'true') el.setAttribute('threshold', threshold);
        return lazyDefine('velin-scroll-top');
      }
      let wc = document.querySelector('velin-scroll-top');
      if (!wc) {
        wc = document.createElement('velin-scroll-top');
        wc.setAttribute('threshold', threshold);
        (el === document.body || el === document.documentElement ? document.body : el).appendChild(wc);
      }
      return lazyDefine('velin-scroll-top');
    },
  });
  registerAttribute('velin-progress', {
    enhance(el) {
      const ring = el.hasAttribute('ring');
      if (ring) return bridgeComponent(el, 'velin-progress-ring');
      el.classList.add('velin-progress');
      const val = parseInt(el.getAttribute('velin-progress') || '0', 10);
      el.setAttribute('role', 'progressbar');
      el.setAttribute('aria-valuenow', String(val));
      el.style.setProperty('--velin-progress', `${Math.min(100, val)}%`);
    },
  });
  registerAttribute('velin-search', {
    async enhance(el) {
      if (el.tagName !== 'VELIN-SEARCH') {
        const host = document.createElement('velin-search');
        host.setAttribute('index', el.getAttribute('data-search-index') || '/search-index.json');
        el.replaceWith(host);
        host.appendChild(el);
      }
      return lazyDefine('velin-search');
    },
  });
  registerAttribute('velin-lazy', {
    enhance(el) {
      if (el.tagName === 'IMG') {
        el.loading = 'lazy';
        el.decoding = 'async';
        if (el.hasAttribute('velin-skeleton') || el.dataset.velinSkeleton) {
          el.classList.add('velin-skeleton', 'velin-skeleton--image');
          el.addEventListener('load', () => el.classList.remove('velin-skeleton', 'velin-skeleton--image'), { once: true });
        }
      }
    },
  });
  registerAttribute('velin-skeleton', {
    enhance(el) {
      const variant = el.getAttribute('velin-skeleton') || 'text';
      el.classList.add('velin-skeleton', `velin-skeleton--${variant}`);
      const hasText = Boolean(el.textContent?.trim()) && el.children.length > 0;
      if (!hasText && !el.textContent?.trim()) {
        el.setAttribute('aria-hidden', 'true');
      }
    },
  });
  registerAttribute('velin-loading', {
    enhance(el) {
      el.classList.add('velin-spinner');
      el.setAttribute('aria-busy', 'true');
      el.setAttribute('role', 'status');
      if (!el.getAttribute('aria-label')?.trim()) {
        el.setAttribute('aria-label', 'Loading');
      }
    },
  });
  registerAttribute('velin-grid', {
    enhance(el) {
      const cols = el.getAttribute('velin-grid') || 'auto';
      el.classList.add('velin-grid');
      if (cols !== 'auto') el.style.setProperty('--velin-grid-cols', cols);
    },
  });
  registerAttribute('velin-anchor', {
    enhance(el) {
      if (!el.id && el.getAttribute('velin-anchor')) el.id = el.getAttribute('velin-anchor');
      el.setAttribute('tabindex', '-1');
    },
  });
  registerAttribute('velin-code', {
    async enhance(el) {
      const lang =
        el.getAttribute('velin-code') ||
        el.getAttribute('language') ||
        el.getAttribute('data-language') ||
        '';
      el.classList.add('velin-code-block');
      if (lang && lang !== 'true') {
        el.dataset.language = lang;
        if (!el.getAttribute('language')) el.setAttribute('language', lang);
      }
      if (!el.querySelector('[data-velin-copy]')) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'velin-code-block__copy velin-btn velin-btn--sm';
        btn.textContent = 'Copy';
        btn.setAttribute('data-velin-copy', '');
        btn.setAttribute('velin-copy', el.querySelector('code')?.textContent || el.textContent || '');
        el.style.position = 'relative';
        el.appendChild(btn);
      }
      await lazyDefine('velin-copy');

      const { initHighlight, highlightElement } = await import('../highlight/index.js');
      const immediate =
        el.getAttribute('data-velin-highlight') === 'immediate' ||
        (typeof matchMedia !== 'undefined' &&
          matchMedia('(prefers-reduced-motion: reduce)').matches);
      if (immediate) {
        await highlightElement(el);
      } else {
        initHighlight(el, { root: el });
      }
    },
  });
  registerAttribute('velin-quote', {
    enhance(el) {
      if (el.tagName === 'BLOCKQUOTE' || el.tagName === 'Q') {
        el.classList.add('velin-quote');
      }
    },
  });
  registerAttribute('velin-highlight', {
    enhance(el) {
      // Inline text mark (search/docs) — not syntax highlighting; see velinSyntax / velin-code
      el.classList.add('velin-highlight');
    },
  });

  for (const motion of ['velin-reveal', 'velin-fade', 'velin-slide', 'velin-scale', 'velin-parallax', 'velin-hover', 'velin-stagger', 'velin-scroll']) {
    registerAttribute(motion, { enhance() {} });
  }
}

registerBuiltins();

const enhanced = new WeakSet();

/**
 * @param {ParentNode} [root]
 */
export async function bootAttributes(root = document) {
  const selector = [...registry.keys()].map((a) => `[${a}]`).join(',');
  const elements = root.querySelectorAll(selector);

  for (const el of elements) {
    if (enhanced.has(el)) continue;
    for (const attr of registry.keys()) {
      if (!el.hasAttribute(attr)) continue;
      const handler = registry.get(attr);
      if (handler?.enhance) await handler.enhance(el);
    }
    enhanced.add(el);
  }

  initMotion({ root });
  if (typeof HTMLElement !== 'undefined') {
    const { bindDeclarativeSearch } = await import('../../components/velin-search.js');
    bindDeclarativeSearch(root);
    if (!document.querySelector('velin-announcer')) {
      const { getAnnouncer } = await import('../../components/a11y-utils.js');
      getAnnouncer();
    }
  }
}

export function listRegisteredAttributes() {
  return [...registry.keys()];
}
