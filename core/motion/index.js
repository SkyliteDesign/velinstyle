import { observeInView, disconnectInViewObserver } from './scheduler.js';
import { applyEffects, markVisible, prefersReducedMotion, VISIBLE_CLASS } from './effects.js';
import { enhanceStagger } from './stagger.js';
import { bindSmoothScroll } from './scroll.js';

const MOTION_ATTRS = ['velin-reveal', 'velin-fade', 'velin-slide', 'velin-scale', 'velin-parallax', 'velin-hover'];

let teardownFns = [];

/**
 * Initialize motion system: in-view reveals, stagger, smooth scroll anchors.
 * @param {object} [options]
 * @param {HTMLElement|Document} [options.root]
 * @param {string} [options.selector]
 */
export function initMotion(options = {}) {
  const root = options.root || (typeof document !== 'undefined' ? document : null);
  if (!root) return () => {};

  const selector =
    options.selector ||
    [
      '[velin-reveal]',
      '[velin-fade]',
      '[velin-slide]',
      '[velin-scale]',
      '[velin-parallax]',
      '[velin-hover]',
      '.velin-animate-on-scroll',
    ].join(',');

  const elements = root.querySelectorAll(selector);
  const reduced = prefersReducedMotion();

  for (const el of elements) {
    if (el.dataset.velinMotionInit) continue;
    el.dataset.velinMotionInit = '1';

    const attrs = {};
    for (const name of MOTION_ATTRS) {
      if (el.hasAttribute(name)) attrs[name.replace('velin-', '')] = el.getAttribute(name) || 'true';
    }
    applyEffects(el, attrs);

    if (reduced) {
      markVisible(el);
      continue;
    }

    const stop = observeInView(el, (node) => markVisible(node));
    teardownFns.push(stop);
  }

  enhanceStagger(root);
  bindSmoothScroll(root);

  return () => {
    teardownFns.forEach((fn) => fn());
    teardownFns = [];
    disconnectInViewObserver();
  };
}

/** @deprecated use initMotion */
export function initReveal(options = {}) {
  return initMotion({
    root: typeof document !== 'undefined' ? document : null,
    selector: options.selector || '.velin-animate-on-scroll',
  });
}

export const velinMotion = { init: initMotion, observe: observeInView, markVisible, VISIBLE_CLASS };
export { observeInView, disconnectInViewObserver } from './scheduler.js';
export { applyEffects, markVisible, prefersReducedMotion, VISIBLE_CLASS } from './effects.js';
export { enhanceStagger, applyStagger } from './stagger.js';
export { smoothScrollTo, bindSmoothScroll } from './scroll.js';
