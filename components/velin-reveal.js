/*
 * velin-reveal.js — reusable scroll-into-view reveal helper.
 *
 * Replaces inline IntersectionObserver snippets that every project ends up
 * copy-pasting. Just call `initReveal()` once, or opt into auto-init by
 * adding `data-velin-reveal-auto` to <html>. Elements with the class
 * `.velin-animate-on-scroll` get `is-visible` toggled when they enter the
 * viewport.
 *
 * Honours `prefers-reduced-motion: reduce` by revealing immediately without
 * animation, and falls back to immediate reveal if IntersectionObserver is
 * unavailable.
 *
 * API:
 *   initReveal(options?) -> () => void teardown function.
 *   options.selector     CSS selector (default '.velin-animate-on-scroll').
 *   options.threshold    IO threshold (default 0.1).
 *   options.rootMargin   IO rootMargin (default '0px 0px -40px 0px').
 *   options.once         if true (default) stops observing once visible.
 *   options.visibleClass class added on intersect (default 'is-visible').
 */

const DEFAULTS = {
  selector: '.velin-animate-on-scroll',
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px',
  once: true,
  visibleClass: 'is-visible',
};

const _activeObservers = new WeakMap();

export function initReveal(options = {}) {
  if (typeof document === 'undefined') return () => {};
  const opts = { ...DEFAULTS, ...options };
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = Array.from(document.querySelectorAll(opts.selector));

  if (reduced || typeof IntersectionObserver === 'undefined') {
    targets.forEach((el) => el.classList.add(opts.visibleClass));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(opts.visibleClass);
        if (opts.once) observer.unobserve(entry.target);
      }
    },
    { threshold: opts.threshold, rootMargin: opts.rootMargin },
  );

  targets.forEach((el) => {
    if (_activeObservers.has(el)) return;
    _activeObservers.set(el, observer);
    observer.observe(el);
  });

  return () => {
    observer.disconnect();
    targets.forEach((el) => _activeObservers.delete(el));
  };
}

if (typeof document !== 'undefined') {
  const autoInit = () => {
    if (document.documentElement && document.documentElement.hasAttribute('data-velin-reveal-auto')) {
      initReveal();
    }
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit, { once: true });
  } else {
    autoInit();
  }
}

export default { initReveal };
